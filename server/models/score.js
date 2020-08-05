const mongoose = require("mongoose");

const ScoreSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  timestamp: Date,
  grade: Number,
  studentQuiz: [Object],
});

// compile model from schema
module.exports = mongoose.model("Score", ScoreSchema);
