const mongoose = require("mongoose");

const ScoreSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  timestamp: Date,
  score: Number,
  wrong: [{ answer: String, studentAnswer: String }],
});

// compile model from schema
module.exports = mongoose.model("Score", ScoreSchema);
