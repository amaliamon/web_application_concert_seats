'use strict';
const sqlite = require('sqlite3');
const crypto = require('crypto');

// Open the database
const db = new sqlite.Database('concert_db.db', (err) => {
  if (err) throw err;
});

// Get user by ID
exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE uid = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err); // Database error
      } else if (!row) {
        resolve({ error: 'User not found.' });
      } else {
        const user = { uid: row.uid, username: row.email, loyal: !!row.loyal };
        resolve(user);
      }
    });
  });
};

// Authenticate user by email and password
exports.getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.get(sql, [email], (err, row) => {
      if (err) {
        return reject(err); // Database error
      }

      if (!row) {
        return resolve(false); // User not found
      }

      const user = { id: row.uid, username: row.email, loyal: row.loyal === 1 };


      const salt = row.salt;
      crypto.scrypt(password, salt, 32, (err, hashedPassword) => {
        if (err) {
          return reject(err); // Hashing error
        }

        const passwordHex = Buffer.from(row.password, 'hex');

        // Secure comparison of hashed password
        if (!crypto.timingSafeEqual(passwordHex, hashedPassword)) {
          return resolve(false); // Password does not match
        }

        resolve(user); // Successfully authenticated
      });
    });
  });
};
