let mongoose = require("mongoose");
let bcrypt = require("bcrypt");

let Schema = mongoose.Schema;

let userSchema = new Schema(
  {
    name: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    age: { type: Number, default: 0 },
    phone: { type: Number, default: 0000000000 },
    country: { type: String, default: "India" },
    password: { type: String, minlength: 5 },
    transactions: [{ type: mongoose.Types.ObjectId, ref: "Transaction" }],
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  bcrypt.hash(this.password, 10, (err, hashed) => {
    if (err) return next(err);
    this.password = hashed;
    return next();
  });
});

userSchema.methods.checkPassword = function (password, cb) {
  bcrypt.compare(password, this.password, (err, result) => {
    return cb(err, result);
  });
};

let User = mongoose.model("User", userSchema);

module.exports = User;
