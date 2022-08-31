var express = require("express");
var router = express.Router();
var passport = require("passport");

router.get("/", function (req, res, next) {
  res.render("index", { title: "Expense Tracker" });
});

router.get("/success", async (req, res, next) => {
  try {
    res.render("success");
  } catch (error) {
    next(error);
  }
});

router.get("/failure", async (req, res, next) => {
  try {
    res.render("failure");
  } catch (error) {
    next(error);
  }
});

router.get("/auth/github", passport.authenticate("github"));

router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/users/login" }),
  (req, res) => {
    res.redirect("/users");
  }
);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/users/login" }),
  (req, res) => {
    res.redirect("/users");
  }
);

router.get("/log-out", async (req, res, next) => {
  try {
    req.session.destroy();
    res.clearCookie();
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
