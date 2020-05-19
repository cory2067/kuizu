const kuromoji = require("kuromoji");
const MeCab = require("mecab-async");
const mecab = new MeCab();

const PythonShell = require("python-shell").PythonShell;
const pyshell = new PythonShell("neighbors.py");

const getKuromoji = (input) =>
  new Promise((resolve, reject) => {
    kuromoji
      .builder({ dicPath: "node_modules/kuromoji/dict" })
      .build((err, tokenizer) => {
        if (err) return reject(err);
        const result = tokenizer.tokenize(input);
        const parsed = result.map((word) => ({
          word: word.surface_form,
          pos: word.pos,
          base: word.basic_form,
          reading: word.reading,
        }));
        return resolve(parsed);
      });
  });

const getMecab = (input) =>
  new Promise((resolve, reject) => {
    mecab.parse(input, (err, result) => {
      if (err) return reject(err);
      const parsed = result.map((word) => ({
        word: word[0],
        pos: word[1],
        base: word[5],
        reading: word[6],
      }));
      resolve(parsed);
    });
  });

const main = async () => {
  const input = "私はマサチューセッツ工科大学で日本語を勉強しています";
  const [kuroRes, mecabRes] = await Promise.all([
    getKuromoji(input),
    getMecab(input),
  ]);

  console.log("Analysis from kuromoji:");
  console.log(kuroRes);

  console.log("Analysis from mecab:");
  console.log(mecabRes);

  for (const w of mecabRes) {
    if (w.pos === "名詞") {
      const similar = await getNeighbors(w.word);
      console.log(`Similar words to: ${w.word}`);
      console.log(similar);
    }
  }

  closeNeighbors();
};

const requests = {};

const getNeighbors = (word) =>
  new Promise((resolve, reject) => {
    requests[word] = { resolve, reject };
    pyshell.send(word);
  });

const closeNeighbors = () => {
  pyshell.send("$kill");
  pyshell.end((err, code, signal) => {
    if (err) console.log(err);
    console.log(`Neighbors exited with code ${code}`);
  });
};

pyshell.on("message", (message) => {
  const res = JSON.parse(message);

  requests[res.request].resolve(res.result);
  delete requests[res.request];
});

main();
