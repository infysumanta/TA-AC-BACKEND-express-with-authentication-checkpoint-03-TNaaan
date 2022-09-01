var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var GitHubStrategy = require("passport-github").Strategy;
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
var bcrypt = require("bcrypt");
var User = require("../models/User");

passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    //match user
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          return done(null, false, {
            message: "The email address is not registered with Us.",
          });
        }
        if (!user.verified) {
          return done(null, false, {
            message: "The Account is not verified.",
          });
        }
        //match pass
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;

          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Password is incorrect!!" });
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
  })
);
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      // console.log(profile._json);
      var profileData = {
        name: profile._json.name,
        email: profile._json.email ? profile._json.email : profile._json.login,
        password: profile._json.name,
      };
      try {
        const user = await User.findOne({ email: profileData.email });
        if (!user) {
          const addedUser = await User.create(profileData);
          return done(null, addedUser);
        }
        return done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      var profileData = {
        name: profile._json.name,
        email: profile._json.email,
        password: profile._json.name,
      };
      try {
        const user = await User.findOne({ email: profile._json.email });
        if (!user) {
          const addedUser = await User.create(profileData);
          return done(null, addedUser);
        }
        return done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

module.exports = passport;
