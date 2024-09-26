'use strict';

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { body, validationResult } = require("express-validator");
const { expressjwt: jwt } = require('express-jwt');

const jwtSecret = '4fdf2f025de9179d20613aa217f36fb14961f3e55344f0936e6c802a9b756e4f';
const jsonwebtoken = require('jsonwebtoken');
const expireTime = 60;
//const token = jsonwebtoken.sign( { access: 'premium', authId: 1234 }, jwtSecret, {expiresIn: expireTime});
//console.log(token);

const app = new express();
const port = 3002;

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json()); // To automatically decode incoming json

// Check token validity
app.use(jwt({
  secret: jwtSecret,
  algorithms: ["HS256"],
}));

// To return a better object in case of errors
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ errors: [{ 'param': 'Server', 'msg': 'Authorization error', 'path': err.code }] });
  } else {
    next();
  }
});


function calculateDiscount(isLoyal, occupiedSeats) {
  // Ensure occupiedSeats is an array
  if (!Array.isArray(occupiedSeats)) {
    throw new Error("Invalid input: occupiedSeats must be an array");
  }

  const rowSum = occupiedSeats.reduce((sum, seat) => {
    const rowNumber = parseInt(seat.match(/\d+/)[0], 10);
    return sum + rowNumber;
  }, 0);
  
  let discount = isLoyal ? rowSum : rowSum / 3;
  const randomAddition = Math.floor(Math.random() * 16) + 5;
  discount += randomAddition;
  discount = Math.round(discount);
  discount = Math.max(5, Math.min(discount, 50));

  return discount + "%";
}


app.post('/api/discount/:loyal', 
  (req, res) => { 
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }

    const loyal = req.params.loyal == "loyal";
    console.log(loyal);
    let discount = calculateDiscount(loyal, req.body.booked_seats);
    res.json({ discount: discount });
  }
);






app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
