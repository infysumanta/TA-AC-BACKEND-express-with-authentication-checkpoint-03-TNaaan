var express = require("express");
var router = express.Router();
var User = require("./../models/User");
var Transaction = require("./../models/Transaction");
var passport = require("passport");
var moment = require("moment");
/* GET users listing. */
var { isLoggedIn } = require("./../middleware/auth");
const app = require("../app");
const { Router } = require("express");

router.get("/login", (req, res, next) => {
  let error = req.flash("error")[0];
  let success = req.flash("success")[0];
  res.render("login", { error: error, success: success });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/users",
    failureRedirect: "/users/login",
  })
);

router.get("/register", (req, res, next) => {
  let error = req.flash("error")[0];
  let success = req.flash("success")[0];
  res.render("register", { error: error, success: success });
});

router.post("/register", (req, res, next) => {
  let { email, password } = req.body;
  if (password && password.length < 5) {
    req.flash("error", "The password must be at least 5 characters");
    res.redirect("/users/register");
  }
  User.findOne({ email: email }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      User.create(req.body, (err, user) => {
        if (err) return next(err);
        req.flash("success", "Registration Success!! Please login");
        res.redirect("/users/login");
      });
    } else {
      req.flash("error", "The email address is already registered with us");
      res.redirect("/users/register");
    }
  });
});

router.use(isLoggedIn);
router.get("/", async (req, res, next) => {
  Transaction.find({ createdBy: req.user.id }, (err, transactions) => {
    res.render("home", { transactions });
  });
});

router.get("/income", (req, res, next) => {
  let error = req.flash("error")[0];
  let success = req.flash("success")[0];
  res.render("income", { error: error, success: success });
});
router.post("/income", (req, res, next) => {
  let data = req.body;
  data.type = "income";
  data.createdBy = req.user._id;
  Transaction.create(req.body, (err, transaction) => {
    if (err) return next(err);
    User.findByIdAndUpdate(
      req.user._id,
      { $push: { transactions: transaction._id } },
      (err, user) => {
        req.flash("success", "Save Successfully!!");
        res.redirect("/users/income");
      }
    );
  });
});
router.get("/expense", (req, res, next) => {
  let error = req.flash("error")[0];
  let success = req.flash("success")[0];
  res.render("expense", { error: error, success: success });
});
router.post("/expense", (req, res, next) => {
  let data = req.body;
  data.type = "expense";
  data.createdBy = req.user._id;
  Transaction.create(req.body, (err, transaction) => {
    if (err) return next(err);
    User.findByIdAndUpdate(
      req.user._id,
      { $push: { transactions: transaction._id } },
      (err, user) => {
        req.flash("success", "Save Successfully!!");
        res.redirect("/users/expense");
      }
    );
  });
});
router.get("/statement", (req, res, next) => {
  let { type, from, to, month } = req.query;
  let pipeline = [];

  pipeline.push({
    $project: {
      source_category: 1,
      date: 1,
      amount: 1,
      type: 1,
      createdBy: 1,
      day: { $dayOfMonth: "$date" },
      month: { $month: "$date" },
      year: { $year: "$date" },
    },
  });
  pipeline.push({
    $match: { createdBy: req.user._id },
  });

  if (type) {
    pipeline.push({ $match: { type: type } });
  }

  if (from) {
    pipeline.push({ $match: { date: { $gte: new Date(from) } } });
  }

  if (to) {
    pipeline.push({ $match: { date: { $lte: new Date(to) } } });
  }
  if (month) {
    console.log("Month: ", month);
    pipeline.push({
      $match: { month: Number(month.split("-")[1]) },
    });
  }

  Transaction.aggregate(pipeline).exec((err, transactions) => {
    console.log("FROM", pipeline);
    res.render("statement", { transactions, type, from, to, month });
  });
});

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/users");
  });
});
module.exports = router;
