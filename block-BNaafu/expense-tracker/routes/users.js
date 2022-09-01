var express = require("express");
var router = express.Router();
var User = require("./../models/User");
var Transaction = require("./../models/Transaction");
var passport = require("passport");
var bcrypt = require("bcrypt");
/* GET users listing. */
var { isLoggedIn } = require("./../middleware/auth");
var {
  sendVerifyEmail,
  sendResetPasswordLink,
} = require("./../modules/nodemailer");

router.get("/login", (req, res, next) => {
  let error = req.flash("error")[0];
  let success = req.flash("success")[0];
  res.render("login", { error: error, success: success });
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", function (err, user, info) {
    if (err) return next(err);
    if (!user) {
      req.flash("error", info.message);
      return res.redirect("/users/login");
    }
    req.logIn(user, function (err) {
      if (err) return next(err);
      return res.redirect("/users/");
    });
  })(req, res, next);
});
router.get("/register", (req, res, next) => {
  let error = req.flash("error")[0];
  let success = req.flash("success")[0];
  res.render("register", { error: error, success: success });
});
router.post("/register", (req, res, next) => {
  let { email, password } = req.body;
  if (password && password.length < 5) {
    req.flash("error", "The password must be at least 5 characters");
    return res.redirect("/users/register");
  }
  User.findOne({ email: email }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      User.create(req.body, (err, user) => {
        if (err) return next(err);
        let verifiedLink =
          process.env.PROJECT_URL + `/users/verified/account/${user._id}`;
        sendVerifyEmail(user.name, user.email, verifiedLink);
        req.flash("success", "Registration Success!! Please login");
        return res.redirect("/users/login");
      });
    } else {
      req.flash("error", "The email address is already registered with us");
      return res.redirect("/users/register");
    }
  });
});
router.get("/reset/password", (req, res, next) => {
  let error = req.flash("error")[0];
  let success = req.flash("success")[0];
  res.render("resetPassword", { error: error, success: success });
});
router.post("/reset/password", (req, res, next) => {
  let { email } = req.body;
  if (email) {
    User.findOne({ email: email }, (err, user) => {
      if (err) next(err);
      if (user) {
        let resetLink =
          process.env.PROJECT_URL + `/users/reset/password/${user._id}`;
        sendResetPasswordLink(user.name, user.email, resetLink);
        req.flash(
          "success",
          "Reset Link Send Successfully to your email address"
        );
        return res.redirect("/users/reset/password");
      } else {
        req.flash("error", "The Email Address is not registered.");
        return res.redirect("/users/reset/password");
      }
    });
  } else {
    req.flash("error", "Please Enter Email Address to reset your password");
    return redirect("/users/reset/password");
  }
});
router.get("/reset/password/:userId", (req, res, next) => {
  let error = req.flash("error")[0];
  let success = req.flash("success")[0];
  let userId = req.params.userId;
  if (userId) {
    User.findById(userId, (err, user) => {
      if (err) return next(err);
      let data = {
        userId: userId,
        email: user.email,
      };
      res.render("resetPasswordConfirm", {
        error: error,
        success: success,
        data: data,
      });
    });
  }
});
router.post("/reset/password/update", (req, res, next) => {
  let { userid, password, confirmPassword } = req.body;

  if (password && password.length < 5) {
    req.flash("error", "The password must be at least 5 characters");
    res.redirect("/users/register");
  }
  if (password !== confirmPassword) {
    req.flash("error", "Password and Confirm Password are not the same.");
    res.redirect("/users/change/password");
  }
  if (userid) {
    User.findById(userid, (err, user) => {
      if (err) return next(err);
      bcrypt.hash(password, 10, (err, hashed) => {
        if (err) return next(err);
        password = hashed;
        User.findByIdAndUpdate(userid, { password: password }, (err, user) => {
          req.flash("success", "Password Changes Successfully");
          res.redirect("/users/login");
        });
      });
    });
  } else {
    req.flash("error", "Invalid Entry");
    res.redirect("/users/login");
  }
});

router.get("/verified/account/:userId", (req, res, next) => {
  userId = req.params.userId;
  if (userId) {
    User.findById(userId, (err, user) => {
      if (err) return next(err);
      if (user) {
        User.findByIdAndUpdate(
          user,
          { verified: true },
          (err, verifiedUser) => {
            req.flash("success", "Verified!! Login Now");
            res.redirect("/users/login");
          }
        );
      } else {
        let error = "Invalid User";

        res.render("usersVerified", { error });
      }
    });
  } else {
    let error = "Invalid Link";

    res.redirect("usersVerified", { error });
  }
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
router.get("/change/password", (req, res, next) => {
  let error = req.flash("error")[0];
  let success = req.flash("success")[0];
  res.render("changePassword", { error: error, success: success });
});
router.post("/change/password", (req, res, next) => {
  let { password, confirmPassword } = req.body;
  if (password && password.length < 5) {
    req.flash("error", "The password must be at least 5 characters");
    res.redirect("/users/register");
  }
  if (password !== confirmPassword) {
    req.flash("error", "Password and Confirm Password are not the same.");
    res.redirect("/users/change/password");
  }

  bcrypt.hash(password, 10, (err, hashed) => {
    if (err) return next(err);
    password = hashed;
    User.findByIdAndUpdate(
      req.user._id,
      { password: password },
      (err, user) => {
        req.flash("success", "Password Changes Successfully");
        res.redirect("/users/change/password");
      }
    );
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
