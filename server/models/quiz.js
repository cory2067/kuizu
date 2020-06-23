const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema({
  title: String,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  timestamp: Date,
  body: Array,
});

// compile model from schema
module.exports = mongoose.model("Quiz", QuizSchema);
