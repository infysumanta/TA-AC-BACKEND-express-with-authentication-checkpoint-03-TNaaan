let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let incomeSchema = new Schema(
  {
    source: { type: String, require: true },
    date: { type: Date },
    amount: { type: Number },
    type: { type: String, default: "income" },
    createdBy: { type: mongoose.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

let Income = mongoose.model("Income", incomeSchema);

module.exports = Income;
