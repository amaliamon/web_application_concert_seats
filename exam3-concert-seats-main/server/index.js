'use strict';

/*** Importing modules ***/
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const { body, check, validationResult } = require('express-validator'); // validation middleware
const { initAuthentication, isLoggedIn } = require("./auth");
const jsonwebtoken = require('jsonwebtoken');

const jwtSecret = '4fdf2f025de9179d20613aa217f36fb14961f3e55344f0936e6c802a9b756e4f';
const expireTime = 300; //seconds

/*** Importing DAO modules ***/
const concertsDao = require('./dao'); // module for accessing the concerts table in the DB
const userDao = require('./daoUser'); // module for accessing the user table in the DB

/*** Initialize Express and set up middlewares ***/
const app = express();
const port = 3001;

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

initAuthentication(app, userDao);

/*** Routes ***/

// GET /api/concerts - Public, shows all the concerts for unauthenticated users
app.get('/api/concerts', (req, res) => {
  concertsDao.listConcerts()
    .then(concerts => res.json(concerts))
    .catch(err => res.status(500).json({ error: 'Internal server error' }));
});

// GET /api/concerts/non-booked - Authenticated users, shows non-booked concerts
app.get('/api/concerts/non-booked', isLoggedIn, (req, res) => {
  const uid = req.user.uid; // Assuming user ID is stored in req.user.uid
  concertsDao.listNonBookedConcerts(uid)
      .then(concerts => res.json(concerts))
      .catch(err => res.status(500).json({ error: 'Internal server error' }));
});

// GET /api/concerts/:concert_id - Public, shows all seats for a specific concert
app.get('/api/concerts/:concert_id', [
  check('concert_id').isInt(),
  check('concert_id').custom(async concert_id => {
    const concertExists = await concertsDao.checkConcertId(concert_id);
    if (!concertExists) {
      throw new Error('The concert ID specified does not exist');
    }
  })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const seats = await concertsDao.listConcertSeats(req.params.concert_id);
    res.status(200).json(seats);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});



// GET /api/reservations - Authenticated users, shows all reservations done
app.get('/api/reservations', isLoggedIn, (req, res) => {
  const uid = req.user.uid;
  concertsDao.listReservations(uid)
    .then(reservations => res.json(reservations))
    .catch(err => res.status(500).json({ error: 'Internal server error' }));
});



// GET /api/reservations/:reservation_id - Authenticated users, shows details of a specific reservation
app.get('/api/reservations/:reservation_id', isLoggedIn, [
  check('reservation_id').isInt(),
  check('reservation_id').custom(async (reservation_id) => {
    const reservationExists = await concertsDao.checkReservationId(reservation_id);
    if (!reservationExists) {
      throw new Error('The reservation ID specified does not exist');
    }
  })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const fromDifferentUser = await concertsDao.checkIsDifferentUser(req.params.reservation_id, req.user.uid);
    if (fromDifferentUser) {
      return res.status(400).json({ error: 'You cannot see a reservation created by another user.' });
    }
    const reservation = await concertsDao.listReservationSeats(req.params.reservation_id, req.user.uid);
   
    res.status(200).json(reservation);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
//Create a new reservation
app.post('/api/reservations/:concert_id', isLoggedIn, [
  check('concert_id').isInt(),
  check('seats').isArray({ min: 1 }),
  check('concert_id').custom(async (concert_id) => {
    const concertExists = await concertsDao.checkConcertId(concert_id);
    if (!concertExists) {
      throw new Error('The concert ID does not exist');
    }
  })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const alreadyBooked = await concertsDao.checkAlreadyBooked(req.params.concert_id, req.user.id);
    if (alreadyBooked) {
      return res.status(400).json({ error: 'You already have a reservation for this concert.' });
    }

    // Access the seats from the request body
    const seats = req.body.seats;  
    

    const occupiedSeats = await concertsDao.checkBook(req.params.concert_id, seats);
    if (occupiedSeats.length > 0) {
      return res.status(400).json({ error: 'Some of the selected seats are already booked.', occupiedSeats });
    }
    const reservationId = await concertsDao.createReservation(req.params.concert_id, req.user.uid, seats);
    res.status(200).json({ reservationId });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
  
});



// DELETE /api/reservations/:reservation_id - Authenticated users, delete a reservation
app.delete('/api/reservations/:reservation_id', isLoggedIn, [
  check('reservation_id').isInt(),
  check('reservation_id').custom(async (reservation_id) => {
    const reservationExists = await concertsDao.checkReservationId(reservation_id);
    if (!reservationExists) {
      throw new Error('The reservation does not exist');
    }
  })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const deleteFromDifferentUser = await concertsDao.checkIsDifferentUser(req.params.reservation_id, req.user.uid);
    if (deleteFromDifferentUser) {
      return res.status(403).json({ error: 'You cannot delete a reservation created by another user.' });
    }
    const numRowChanges = await concertsDao.deleteReservation(req.params.reservation_id);
    res.status(200).json({ numRowChanges });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error'});
  }
});

// POST /api/sessions - Login
app.post(
  '/api/session',
  body("username", "username is not a valid email").isEmail(),
  body("password", "password must be a non-empty string").isString().notEmpty(),
  (req, res, next) => {
    // Check if validation is okay
    const err = validationResult(req);
    if (!err.isEmpty()) {
      const errList = err.errors.map(e => e.msg);
      return res.status(400).json({ errors: errList });
    }

    // Perform the actual authentication
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return res.status(err.status || 500).json({ errors: [err.message || "Authentication error"] });
      }

      // Log the user in
      req.login(user, (err) => {
        console.log(user);
        if (err) return next(err);
        return res.json(req.user);
      });
    })(req, res, next);
  }
);

// DELETE /api/sessions/current - Logout
app.delete('/api/session/current', (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});

// GET /api/sessions/current - Check if user is logged in
app.get('/api/session/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});



/*** Token ***/
/**
 * Get token
 */
app.get('/api/auth-token', isLoggedIn, (req, res) => {
  const loyal = req.user.loyal;

  const payloadToSign = { loyal: loyal, uid: req.user.id };
  const jwtToken = jsonwebtoken.sign(payloadToSign, jwtSecret, {expiresIn: expireTime});
  
  res.json({token: jwtToken});
});


/*** Start the server ***/
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}/`);
});
