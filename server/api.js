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

const User = require("./models/user");
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

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  logger.warn(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
