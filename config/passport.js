const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");
const bcrypt = require("bcryptjs");

module.exports = function (passport) {
  // Local Strategy
  passport.use(
    new LocalStrategy({ usernameField: "email" }, function (
      email,
      password,
      done
    ) {
      let query = { email: email };
      User.findOne(query)
        .exec()
        .then((user) => {
          if (!user) {
            return done(null, false, { message: "User not found" });
          }

          bcrypt.compare(password, user.password)
            .then((isMatch) => {
              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, { message: "Invalid credentials" });
              }
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    })
  );

  // Serialize User
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  // Deserialize User
  passport.deserializeUser(function(id, done) {
    User.findById(id)
        .then(user => {
            done(null, user);
        })
        .catch(err => {
            done(err, null);
        });
});
};
