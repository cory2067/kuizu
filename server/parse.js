const kuromoji = require("kuromoji");
const MeCab = require("mecab-async");
const wanakana = require("wanakana");
const mecab = new MeCab();

let kuroTokenizer;
module.exports = {
  getKuromoji: async (input) => {
    if (!kuroTokenizer) {
      kuroTokenizer = await new Promise((resolve, reject) => {
        kuromoji.builder({ dicPath: "node_modules/kuromoji/dict" }).build((err, tokenizer) => {
          if (err) return reject(err);
          return resolve(tokenizer);
        });
      });
    }

    const result = kuroTokenizer.tokenize(input);
    const parsed = result.map((word) => ({
      word: word.surface_form,
      pos: word.pos,
      base: word.basic_form,
      reading: wanakana.toHiragana(word.reading),
    }));
    return parsed;
  },

  getMecab: (input) =>
    new Promise((resolve, reject) => {
      mecab.parse(input, (err, result) => {
        if (err) return reject(err);
        const parsed = result.map((word) => ({
          word: word[0],
          pos: word[1],
          base: word[7],
          reading: wanakana.toHiragana(word[8]),
        }));
        resolve(parsed);
      });
    }),
};
