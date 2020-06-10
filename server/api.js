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
const generator = require("./generator");

//add error handling to async endpoints
const { decorateRouter } = require("@awaitjs/express");

// api endpoints: all these paths will be prefixed with "/api/"
const router = decorateRouter(express.Router());

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

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

router.getAsync("/quizes", async (req, res) => {
  res.send(await Quiz.find({}).select("title"));
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  logger.warn(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
