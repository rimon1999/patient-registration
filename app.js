var createError = require('http-errors');
var express = require('express');
const session = require("express-session");
const crypto = require("crypto");
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require("mongoose");
require('dotenv').config(); // Load environment variables from .env file
var passport = require("passport");
require('./config/passport')(passport);

// Ensure user is authenticated
function ensureAuthenticated(req, res, next) {
  // If logged in, proceed to the next middleware
  if (req.isAuthenticated()) {
    console.log('User authenticated:', req.user);
    return next();
  } else {
    // If not authenticated, redirect to the login page
    res.redirect("/users/login");
  }
}

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var patientsRouter = require('./routes/patients');

var app = express();

const newSecretKey = crypto.randomBytes(32).toString("hex");

// Use the MongoDB Atlas connection string from the environment variables
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
let connection = mongoose.connection;
connection.once("open", () => console.log("Connected to db"));
connection.once("error", (error) => console.log(error));

app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: newSecretKey,
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 900000  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.get("*", (req,res,next)=>{
  res.locals.user = req.user || null;
  next();
})

app.set('views', path.join(__dirname, 'views'));

// Use the authentication middleware for routes that require authentication
app.use('/patients', ensureAuthenticated, patientsRouter);

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
