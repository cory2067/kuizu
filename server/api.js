/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");
const util = require("util");
const fs = require("fs");
const logger = require("pino")(); // import pino logger

const Quiz = require("./models/quiz");
const Score = require("./models/score");
const generator = require("./generator");

const textToSpeech = require("@google-cloud/text-to-speech");
const client = new textToSpeech.TextToSpeechClient({
  credentials: {
    client_email: process.env.TTS_EMAIL,
    private_key: process.env.TTS_KEY,
  },
});

//add error handling to async endpoints
const { decorateRouter } = require("@awaitjs/express");

// api endpoints: all these paths will be prefixed with "/api/"
const router = decorateRouter(express.Router());
const key = (w) => `<${w.reading}|${w.word}>`;

const ensure = (func) => {
  return (req, res, next) => (func(req, res) ? next() : res.status(403).send({ err: "Forbidden" }));
};

const isLoggedIn = ensure((req, res) => req.user && req.user._id);
const isTeacher = ensure((req, res) => req.user && req.user.isTeacher);

router.get("/whoami", (req, res) => {
  res.send(req.user || {});
});

router.postAsync("/generate", async (req, res) => {
  let result = [];
  if (req.body.type === "kanji") {
    result = await generator.kanjiQuiz(req.body.analyzer, req.body.text);
  } else if (req.body.type === "particle") {
    result = await generator.particleQuiz(req.body.analyzer, req.body.text);
  }
  res.send(result);
});

router.postAsync("/save", isTeacher, async (req, res) => {
  console.log(req.user);
  const quiz = new Quiz({
    title: req.body.title,
    creator: req.user._id,
    timestamp: new Date(),
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
  res.send(await Quiz.find({}).select("-body").populate("creator"));
});

router.deleteAsync("/quiz", async (req, res) => {
  await Quiz.deleteOne({ _id: req.body.id });
  await Score.deleteMany({ quiz: req.body.id });
  res.send({});
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

router.getAsync("/audio", async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.query.id });
  const text = quiz.body.map((word) => word.answer || word.content).join("");

  const fileRoute = `/audio/${req.query.id}.mp3`;
  const fileAbsolute = `${__dirname}/../${fileRoute}`;

  if (!fs.existsSync(fileAbsolute)) {
    logger.info(`Generating audio for ${quiz.title}`);
    const request = {
      input: { text },
      voice: { languageCode: "ja-JP", name: "ja-JP-Wavenet-D" },
      audioConfig: { audioEncoding: "MP3" },
    };

    const [response] = await client.synthesizeSpeech(request);
    const writeFile = util.promisify(fs.writeFile);

    await writeFile(fileAbsolute, response.audioContent, "binary");
  }

  res.redirect(fileRoute);
});
// anything else falls to this "not found" case

router.all("*", (req, res) => {
  logger.warn(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
