/*
|--------------------------------------------------------------------------
| auth.js -- Auth API routes
|--------------------------------------------------------------------------
|
| This file defines the API authentication routes for your server.
|
*/
const express = require("express");
const logger = require("pino")(); // import pino logger
const passport = require("./passport");
//add error handling to async endpoints
const { decorateRouter } = require("@awaitjs/express");

// api endpoints: all these paths will be prefixed with "/api/"
const router = decorateRouter(express.Router());

// authentication routes
router.get("/google", passport.authenticate("google", { scope: ["profile"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // janky thing to close the login popup window
    res.send("<script>setInterval(window.close)</script>");
  }
);

router.get("/logout", (req, res) => {
  logger.info(`Logged out user ID ${req.user._id}`);
  req.logout();
  res.send({});
});

module.exports = router;
