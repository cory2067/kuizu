const kuromoji = require("kuromoji");
const MeCab = require("mecab-async");
const fs = require("fs");
const mecab = new MeCab();

const similarity = require("./similarKanji.json");

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
  const input = "日本語で話すのは楽しい";
  const [kuroRes, mecabRes] = await Promise.all([
    getKuromoji(input),
    getMecab(input),
  ]);

  console.log("Analysis from kuromoji:");
  console.log(kuroRes);

  console.log("Analysis from mecab:");
  console.log(mecabRes);

  console.log("\n~ Similar Kanji Quiz ~");
  for (const w of mecabRes) {
    console.log(`Choose the correct kanji for ${w.reading}`);
    const res = [...w.word].map((char) => {
      if (similarity[char])
        return similarity[char]
          .slice(0, 5)
          .map((c) => c.char)
          .concat([char])
          .sort(() => Math.random() - 0.5)
          .join("・");
      return char;
    });
    console.log(res.join("、　"));
  }

  console.log("\n~ Nearest-Neighbor Analysis ~");
  for (const w of mecabRes) {
    if (["動詞", "形容詞", "名詞"].includes(w.pos)) {
      const similar = await getNeighbors(w.word);
      console.log(
        `${w.word} (${w.pos}) is related to ${similar
          .map((w) => w.word)
          .join(", ")}`
      );
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
