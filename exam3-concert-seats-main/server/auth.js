"use strict"

const passport = require("passport");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;

function initAuthentication(app, daoUser) {
  passport.use(new LocalStrategy((email, password, done) => {
    daoUser.getUser(email.toLowerCase(), password)
      .then(user => {
        if (user) done(null, user);
        else         done({status: 401, msg: "Incorrect username and/or password"}, false);
      })
      .catch(() => /* db error */ done({status: 500, msg: "Database error"}, false));
  }));

  // Serialization and deserialization of the student to and from a cookie
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    daoUser.getUserById(id)
      .then(user => done(null, user))
      .catch(e => done(e, null));
  });

  // Initialize express-session
  app.use(session({
    secret: "6210a3abaa61c28ded45d2c8c6cc534c0ccb23cdcd486270132c93a382272429",
    resave: false,
    saveUninitialized: false, 
    cookie: { httpOnly: true, secure: app.get('env') === 'production' ? true : false },
  }));

  // Initialize passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({errors: ["Not authenticated"]});
}

function isLoyal(req, res, next) {
  console.log("asdkjhalhdlasjdh");
  if (req.user && req.user.loyal) return next();
  return res.status(403).json({ errors: ["Not a loyal user"] });
}

module.exports = { initAuthentication, isLoggedIn, isLoyal };