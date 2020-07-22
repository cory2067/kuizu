const similarity = require("../similarKanji.json");
const parse = require("./parse.js");
const wanakana = require("wanakana");
const _ = require("lodash");

const key = (w) => `<${w.reading}|${w.word}>`;

async function kanjiQuiz(analyzer, text) {
  const res = await (analyzer === "mecab" ? parse.getMecab(text) : parse.getKuromoji(text));

  const words = [];
  const seenWords = {};

  let index = 0;
  for (const w of res) {
    if (seenWords[key(w)]) {
      words.push(seenWords[key(w)]);
      continue;
    }

    const rawTokens = wanakana.tokenize(w.word, { detailed: true });
    const hasKanji = rawTokens.some((t) => t.type === "kanji");

    if (!hasKanji) {
      words.push({ content: w.word, isQuestion: false });
      continue;
    }

    // split up kanji into separate tokens
    const tokens = rawTokens.reduce((acc, cur) => {
      if (cur.type === "kanji") {
        return [...acc, ...[...cur.value].map((ch) => ({ type: "kanji", value: ch }))];
      }
      return [...acc, cur];
    }, []);

    const wordParts = [];
    for (const token of tokens) {
      const char = token.value;
      if (!similarity[char]) {
        wordParts.push({ content: char, isQuestion: false });
        continue;
      }

      const choices = similarity[char]
        .slice(0, 5)
        .map((c) => c.char)
        .concat([char])
        .sort(() => Math.random() - 0.5);

      wordParts.push({
        isQuestion: true,
        choices,
        answer: char,
      });
    }

    const word = {
      content: w.reading,
      isQuestion: true,
      parts: wordParts,
      answer: w.word,
      base: w.base,
      index: ++index,
    };
    words.push(word);
    seenWords[key(w)] = word;
  }

  return words;
}

async function particleQuiz(analyzer, text) {
  const particles = "はがものにでとをも".split("");
  const res = await (analyzer === "mecab" ? parse.getMecab(text) : parse.getKuromoji(text));

  const words = [];

  let index = 0;
  for (const w of res) {
    if (w.pos === "助詞" && particles.includes(w.word)) {
      words.push({
        content: "？",
        isQuestion: true,
        parts: [{ isQuestion: true, choices: particles, answer: w.word }],
        answer: w.word,
        base: w.word,
        index: ++index,
      });
    } else {
      words.push({
        content: w.word,
        isQuestion: false,
      });
    }
  }

  return words;
}

const maxInterval = 10;
const hiragana =
  "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ";
const katakana = wanakana.toKatakana(hiragana);

async function deletionQuiz(analyzer, text) {
  //const res = await (analyzer === "mecab" ? parse.getMecab(text) : parse.getKuromoji(text));

  const words = [];

  let index = 0;
  let interval = maxInterval;
  for (const w of text) {
    if (interval <= 0) {
      const token = wanakana.tokenize(w, { detailed: true })[0];

      let choices = [];
      if (token.type === "kanji") {
        if (!similarity[w]) {
          words.push({
            content: w,
            isQuestion: false,
          });
          continue;
        }

        choices = similarity[w]
          .slice(0, 5)
          .map((c) => c.char)
          .concat([w])
          .sort(() => Math.random() - 0.5);
      } else if (token.type === "hiragana") {
        choices = _.sampleSize(
          [...hiragana].filter((char) => char !== w),
          5
        )
          .concat([w])
          .sort(() => Math.random() - 0.5);
      } else if (token.type === "katakana") {
        choices = _.sampleSize(
          [...katakana].filter((char) => char !== w),
          5
        )
          .concat([w])
          .sort(() => Math.random() - 0.5);
      } else {
        words.push({
          content: w,
          isQuestion: false,
        });
        continue;
      }

      words.push({
        content: `[${index}]`,
        isQuestion: true,
        parts: [{ isQuestion: true, choices, answer: w }],
        answer: w,
        base: w,
        index: ++index,
      });
      interval = maxInterval;
    } else {
      words.push({
        content: w,
        isQuestion: false,
      });
    }

    interval--;
  }

  return words;
}

module.exports = {
  kanjiQuiz,
  particleQuiz,
  deletionQuiz,
};
