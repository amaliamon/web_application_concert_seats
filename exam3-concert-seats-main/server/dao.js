'use strict';

/*** Importing necessary modules ***/
const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('concert_db.db', (err) => {
    if (err) throw err;
});

/*** Concert-related Functions ***/

// List all concerts (for both authenticated and non-authenticated users)
exports.listConcerts = () => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                concerts.concert_id, 
                concerts.theater_id, 
                concerts.name, 
                concerts.location, 
                concerts.onset, 
                COUNT(reservation_seats.seat) as booked_seats, 
                (theaters.rows * theaters.columns) as total_seats, 
                concerts.image 
            FROM 
                concerts 
            LEFT JOIN 
                reservations ON concerts.concert_id = reservations.concert_id 
            LEFT JOIN 
                reservation_seats ON reservations.reservation_id = reservation_seats.reservation_id 
            JOIN 
                theaters ON concerts.theater_id = theaters.theater_id 
            WHERE 
                datetime(concerts.onset) > datetime('now') 
            GROUP BY 
                concerts.concert_id`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
};

// List all seats for a specific concert
exports.listConcertSeats = (concert_id) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                concerts.concert_id, 
                concerts.theater_id, 
                concerts.name, 
                concerts.location, 
                concerts.onset, 
                theaters.rows, 
                theaters.columns, 
                reservation_seats.seat as seat
            FROM 
                concerts 
            LEFT JOIN 
                reservations ON concerts.concert_id = reservations.concert_id 
            LEFT JOIN 
                reservation_seats ON reservations.reservation_id = reservation_seats.reservation_id 
            JOIN 
                theaters ON concerts.theater_id = theaters.theater_id 
            WHERE 
                concerts.concert_id = ?`;
        db.all(sql, [concert_id], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            let concert = {};

            if (rows.length > 0) {
                let seats = [];
                rows.forEach((row) => {
                    if (row.seat != null) seats.push(row.seat);
                });
                concert = { ...rows[0], seats: seats };
                delete concert.seat;
            }

            resolve(concert);
        });
    });
};

// Check if a concert ID exists
exports.checkConcertId = (concert_id) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT *
            FROM concerts
            WHERE concert_id = ?`;
        db.all(sql, [concert_id], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows.length > 0);
        });
    });
};

/*** Reservation-related Functions ***/

// List all reservations for a specific user (authenticated)
exports.listReservations = (uid) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                reservations.reservation_id, 
                concerts.concert_id, 
                concerts.theater_id, 
                concerts.name, 
                concerts.location, 
                concerts.onset,
                (theaters.rows * theaters.columns) as total_seats, 
                concerts.image 
            FROM 
                reservations 
            JOIN 
                concerts ON reservations.concert_id = concerts.concert_id 
            LEFT JOIN 
                reservation_seats ON reservations.reservation_id = reservation_seats.reservation_id 
            JOIN 
                theaters ON concerts.theater_id = theaters.theater_id 
            WHERE 
                reservations.uid = ? 
            GROUP BY 
                reservations.reservation_id, concerts.theater_id`;
        
        db.all(sql, [uid], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            const sql2 = `SELECT count(*) as booked_seats, reservations.concert_id
                          FROM 
                              reservations 
                          JOIN 
                              concerts ON reservations.concert_id = concerts.concert_id 
                          JOIN 
                              reservation_seats ON reservations.reservation_id = reservation_seats.reservation_id 
                          GROUP BY concerts.concert_id;`;

            db.all(sql2, [], (err2, concerts) => {
                if (err2) {
                    reject(err2);
                    return;
                }

                rows = rows.map((row) => {
                    const concertMatch = concerts.filter((concert) => concert.concert_id === row.concert_id)[0];
                    row.booked_seats = concertMatch ? concertMatch.booked_seats : 0; // If no match, default to 0
                    return row;
                });

                resolve(rows);
            });
        });
    });
};


// Create a new reservation for a user (authenticated)
exports.createReservation = (concert_id, uid, seats) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO reservations(concert_id, uid) VALUES(?, ?)';
        db.run(sql, [concert_id, uid], function (err) {
            if (err) {
                reject(err);
                return;
            }

            let reservation_id = this.lastID;
            seats.forEach(seat => {
                const sql = 'INSERT INTO reservation_seats(reservation_id, seat) VALUES(?, ?)';
                db.run(sql, [reservation_id, seat], function (err) {
                    if (err) reject(err);
                });
            });

            resolve(reservation_id);
        });
    });
};

// Delete a specific reservation
exports.deleteReservation = (reservation_id) => {
    return new Promise((resolve, reject) => {
        const deleteSeatsSql = 'DELETE FROM reservation_seats WHERE reservation_id = ?';
        db.run(deleteSeatsSql, [reservation_id], function (err) {
            if (err) {
                reject(err);
                return;
            } else {
                const deleteReservationSql = 'DELETE FROM reservations WHERE reservation_id = ?';
                db.run(deleteReservationSql, [reservation_id], function (err) {
                    if (err) {
                        reject(err);
                        return;
                    } else {
                        resolve(this.changes);  // return the number of affected rows
                    }
                });
            }
        });
    });
};

// Check if the user has already booked the concert
exports.checkAlreadyBooked = (concert_id, uid) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT *
            FROM reservations
            WHERE concert_id = ? AND uid = ?`;
        db.all(sql, [concert_id, uid], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows.length > 0);
        });
    });
};

// Check if the chosen seat is available for booking
exports.checkBook = (concert_id, seats) => {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(seats) || seats.length === 0) {
            resolve([]); // No seats to check
            return;
        }

        // Properly format the seat list for SQL query
        const placeholders = seats.map(() => '?').join(', ');
        const sql = `
            SELECT seat
            FROM reservation_seats
            JOIN reservations ON reservation_seats.reservation_id = reservations.reservation_id
            WHERE reservations.concert_id = ?
            AND reservation_seats.seat IN (${placeholders})
        `;

        // Combine concert_id and seats for query parameters
        const params = [concert_id, ...seats];


        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Database Error:', err);
                reject(err);
                return;
            }

            // Check if rows is undefined or not an array
            if (!Array.isArray(rows)) {
                reject(new Error('Expected an array of rows from the database.'));
                return;
            }

            const occupiedSeats = rows.map(row => row.seat);
            resolve(occupiedSeats);
        });
    });
};


/*** Utility Functions ***/

exports.listNonBookedConcerts = (uid) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                concerts.concert_id, 
                concerts.theater_id, 
                concerts.name, 
                concerts.location, 
                concerts.onset, 
                (theaters.rows * theaters.columns) as total_seats, 
                concerts.image, 
                COUNT(reservation_seats.seat) as booked_seats
            FROM concerts
            LEFT JOIN reservations ON concerts.concert_id = reservations.concert_id
            LEFT JOIN reservation_seats ON reservations.reservation_id = reservation_seats.reservation_id
            JOIN theaters ON concerts.theater_id = theaters.theater_id
            WHERE concerts.concert_id NOT IN (
                SELECT concert_id FROM reservations WHERE uid = ?
            )
            GROUP BY 
                concerts.concert_id, 
                concerts.theater_id, 
                concerts.name, 
                concerts.location, 
                concerts.onset, 
                theaters.rows, 
                theaters.columns, 
                concerts.image
        `;

        db.all(sql, [uid], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
};


// Check if a reservation ID exists
exports.checkReservationId = (reservation_id) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT *
            FROM reservations
            WHERE reservation_id = ?`;
        db.all(sql, [reservation_id], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows.length > 0);
        });
    });
};

// Check if the reservation belongs to a different user
exports.checkIsDifferentUser = (reservation_id, uid) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT *
            FROM reservations
            WHERE reservation_id = ? AND uid = ?`;
        db.all(sql, [reservation_id, uid], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows.length === 0);
        });
    });
};

exports.listReservationSeats = (reservation_id, uid) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT 
                concerts.concert_id, 
                concerts.theater_id, 
                concerts.name, 
                concerts.location, 
                concerts.onset, 
                theaters.rows, 
                theaters.columns, 
                rs.seat,
                reservations.uid 
            FROM 
                concerts
            JOIN 
                reservations ON concerts.concert_id = reservations.concert_id
            JOIN 
                reservation_seats rs ON reservations.reservation_id = rs.reservation_id
            JOIN 
                theaters ON concerts.theater_id = theaters.theater_id
            WHERE 
                concerts.concert_id = (
                    SELECT concert_id FROM reservations WHERE reservation_id = ?
                )`;

        db.all(sql, [reservation_id], (err, rows) => {
            if (err) {
                console.error("Error in query execution: ", err);
                reject(err);
                return;
            }

            let reservation = {};

            if (rows.length > 0) {
                let seats = [];
                let reservationSeats = [];
                rows.forEach((row) => {
                    seats.push(row.seat);
                    if (row.uid === uid) {
                        reservationSeats.push(row.seat);
                    }
                });

                reservation = {
                    ...rows[0],
                    seats: seats,
                    reservation_seats: reservationSeats
                };

            }

            resolve(reservation);
        });
    });
};
