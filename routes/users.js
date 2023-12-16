var express = require('express');
var router = express.Router();
var bcrypt = require("bcryptjs");
var passport = require("passport");

const {check, validationResult} = require("express-validator");

let User =require("../models/user");

router
    .route("/register")

    .get((req,res) =>{
      res.render("register");
    })

    .post(async (req, res) => {
      // Async validation check of form elements
      await check("name", "Name is required").notEmpty().run(req);
      await check("email", "Email is required").notEmpty().run(req);
      await check("email", "Email is invalid").isEmail().run(req);
      await check("password", "Password is required").notEmpty().run(req);
      await check("confirm_password", "Confirm password is required")
        .notEmpty()
        .run(req);
      await check(
        "confirm_password",
        "Password and confirm password do not match"
      )
        .equals(req.body.password)
        .run(req);
  
      // Get validation errors
      const errors = validationResult(req);
  
      if (errors.isEmpty()) {
        // Create new user from mongoose model
        let newUser = new User();
        // Assign attributes based on form data
        newUser.name = req.body.name;
        newUser.email = req.body.email;
  
        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(req.body.password, salt, async function (err, hashed_password) {
            if (err) {
              console.log(err);
            } else {
              newUser.password = hashed_password;
              // Save new user to MongoDB
              let result = await newUser.save()
              if (!result) {
                // Log error if failed
                res.send("Could not save user")
              } else {
                // Route to login if user created
                res.redirect("/users/login");
              }
            }
          });
        });
      } else {
        // Render form with errors
        res.render("register", {
          errors: errors.array(),
        });
      }
    });
  
  router
    .route("/login")
    .get((req, res) => {
      res.render("login");
    })
    .post(async (req, res, next) => {
      // Check form elements are submitted and valid
      await check("email", "Email is required").notEmpty().run(req);
      await check("email", "Email is invalid").isEmail().run(req);
      await check("password", "Password is required").notEmpty().run(req);
  
      // Get validation errors
      const errors = validationResult(req);
  
      if (errors.isEmpty()) {
        // Authenticate using passport and redirect
        passport.authenticate('local', { successRedirect: "/patients", failureRedirect: "/users/login", failureMessage: true, })(req, res, next);
      } else {
        // If form errors then render login with errors
        res.render("login", {
          errors: errors.array(),
        });
      }
    });
  
  router.get('/logout', (req, res) => {
      req.logout(() => { // Passport function to log out user
        req.session.destroy(); // destroy session
        res.redirect('/'); // redirect to home page
      });
  });
  


module.exports = router;
