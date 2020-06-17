/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");
const logger = require("pino")(); // import pino logger

const Quiz = require("./models/quiz");
const Score = require("./models/score");
const generator = require("./generator");

//add error handling to async endpoints
const { decorateRouter } = require("@awaitjs/express");

// api endpoints: all these paths will be prefixed with "/api/"
const router = decorateRouter(express.Router());
const key = (w) => `<${w.reading}|${w.word}>`;

router.get("/whoami", (req, res) => {
  res.send(req.user || {});
});

router.postAsync("/generate", async (req, res) => {
  const result = await generator.kanjiQuiz(req.body.analyzer, req.body.text);
  res.send(result);
});

router.postAsync("/save", async (req, res) => {
  const quiz = new Quiz({
    title: req.body.title,
    body: req.body.quiz,
  });
  await quiz.save();
  res.send({ _id: quiz._id });
});

router.getAsync("/quiz", async (req, res) => {
  res.send(await Quiz.findOne({ _id: req.query.id }));
});

router.getAsync("/score", async (req, res) => {
  res.send((await Score.findOne({ student: req.query.student, quiz: req.query.quiz })) || {});
});

router.getAsync("/quizes", async (req, res) => {
  res.send(await Quiz.find({}).select("title"));
});

router.postAsync("/score", async (req, res) => {
  const quiz = req.body.quiz.filter((word) => word.isQuestion);
  const answers = {};
  quiz.forEach((word) => (answers[word.answer] = word));

  const scores = Object.keys(answers).map((word) => {
    const wordObj = answers[word];
    if (wordObj.content === wordObj.answer) {
      return 1;
    }

    // if wrong, try to reward partial credit
    const parts = wordObj.parts.filter((part) => part.isQuestion);
    return parts.filter((p) => p.studentAnswer === p.answer).length / parts.length;
  });

  const grade = Math.round((100 * scores.reduce((a, b) => a + b, 0)) / scores.length);

  const wrong = Object.keys(answers)
    .map((word) => ({ answer: answers[word].answer, studentAnswer: answers[word].content }))
    .filter((word) => word.answer !== word.studentAnswer);

  const score = new Score({
    quiz: req.body.id,
    student: req.user._id,
    timestamp: new Date(),
    grade,
    wrong,
  });

  await score.save();
  res.send(score);
});

router.getAsync("/scores", async (req, res) => {
  const scores = await Score.find({ quiz: req.query.quiz }).populate("student");
  const quiz = await Quiz.findOne({ _id: req.query.quiz });
  res.send({ scores, quiz });
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  logger.warn(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
