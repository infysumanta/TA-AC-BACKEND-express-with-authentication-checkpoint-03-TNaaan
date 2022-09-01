let mongoose = require("mongoose");
let moment = require("moment");
let Schema = mongoose.Schema;

let transactionSchema = new Schema(
  {
    source_category: { type: String, require: true },
    date: { type: Date },
    amount: { type: Number },
    type: { type: String, enum: ["income", "expense"], default: "income" },
    createdBy: { type: mongoose.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

transactionSchema.methods.dateFormat = function () {
  return moment(this.date).format("MMMM Do YYYY");
};

let Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
