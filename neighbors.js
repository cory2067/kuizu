const PythonShell = require("python-shell").PythonShell;

let pyshell;
const requests = {};

module.exports = {
  // starts the neighbors script (this uses a ton of memory!)
  init: () => {
    pyshell = new PythonShell("neighbors.py");
    pyshell.on("message", (message) => {
      const res = JSON.parse(message);

      requests[res.request].resolve(res.result);
      delete requests[res.request];
    });
  },

  // returns a promise for the nearest neighbors of this word
  get: (word) =>
    new Promise((resolve, reject) => {
      requests[word] = { resolve, reject };
      pyshell.send(word);
    }),

  // gracefully shut down the neighbors script
  close: () => {
    pyshell.send("$kill");
    pyshell.end((err, code, signal) => {
      if (err) console.log(err);
      console.log(`Neighbors exited with code ${code}`);
    });
  },
};
