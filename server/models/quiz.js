const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema({
  title: String,
  body: Array,
});

// compile model from schema
module.exports = mongoose.model("Quiz", QuizSchema);
