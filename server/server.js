//get environment variables configured
require("dotenv").config();

//import libraries needed for the webserver to work!
const http = require("http");
const express = require("express"); // backend framework for our node server.

const path = require("path"); // provide utilities for working with file and directory paths

const api = require("./api");
const auth = require("./auth");
const passport = require("./passport");

const logger = require("pino")(); // import pino logger

//connect and initialize your database!
const db = require("./db");
db.init();

// create a new express server
const app = express();

app.use(express.json());

// library that stores info about each connected user
const session = require("express-session");

//register express session middleware
const MongoStore = require("connect-mongo")(session);
const mongoSession = session({
  secret: "my-secret",
  store: new MongoStore({ mongooseConnection: db.getConnection() }),
  resave: false,
  saveUninitialized: true,
});
app.use(mongoSession);

//register passport & passport session middleware
app.use(passport.initialize());
app.use(passport.session());

//connect authentication routes
app.use("/auth", auth);

// connect user-defined routes
app.use("/api", api);

// load the compiled react files, which will serve /index.html and /bundle.js
const reactPath = path.resolve(__dirname, "..", "client", "dist");
app.use(express.static(reactPath));

// for all other routes, render index.html and let react router handle it
app.get("*", (req, res) => {
  res.sendFile(path.join(reactPath, "index.html"));
});

// any server errors cause this function to run
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status === 500) {
    // 500 means Internal Server Error
    logger.error("The server errored when processing a request!");
    logger.error(err);
  }

  res.status(status);
  res.send({
    status: status,
    message: err.message,
  });
});

// listen to env var for port, otherwise default to 3000.
const port = process.env.PORT || 3000;
const server = http.Server(app);

server.listen(port, () => {
  logger.info(`Server running on port: ${port}`);
});
