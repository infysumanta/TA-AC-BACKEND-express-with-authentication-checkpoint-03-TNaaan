let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let expenseSchema = new Schema(
  {
    source: { type: String, require: true },
    category: [{ type: String }],
    date: { type: Date },
    amount: { type: Number },
    type: { type: String, default: "expense" },
    createdBy: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

let Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
