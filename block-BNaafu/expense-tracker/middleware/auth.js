const User = require("./../models/User");

module.exports = {
  isLoggedIn: function (req, res, next) {
    var userId = req.session.passport && req.session.passport.user;
    if (userId) {
      next();
    } else {
      res.redirect("/users/login");
    }
  },
  userInfo: function (req, res, next) {
    var userId = req.session.passport && req.session.passport.user;
    if (userId) {
      User.findById(userId)
        .populate("transactions")
        .exec((err, user) => {
          if (err) return next(err);
          let total_income = 0;
          let total_expense = 0;
          let balance = user.transactions.reduce((acc, cv) => {
            if (cv.type == "income") {
              total_income += cv.amount;
              acc = acc + cv.amount;
            } else {
              total_expense += cv.amount;
              acc = acc - cv.amount;
            }

            return acc;
          }, 0);

          console.log("Balance", balance);
          user.balance = balance;
          user.total_income = total_income;
          user.total_expense = total_expense;
          req.user = user;
          res.locals.user = user;
          next();
        });
    } else {
      req.user = null;
      res.locals.user = null;
      return next();
    }
  },
};
