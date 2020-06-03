const similarity = require("../similarKanji.json");
const parse = require("./parse.js");
const wanakana = require("wanakana");

async function kanjiQuiz(analyzer, text) {
  const res = await (analyzer === "mecab" ? parse.getMecab(text) : parse.getKuromoji(text));

  const words = [];

  let index = 0;
  for (const w of res) {
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

    const word = [];
    for (const token of tokens) {
      const char = token.value;
      if (!similarity[char]) {
        word.push({ content: char, isQuestion: false });
        continue;
      }

      const choices = similarity[char]
        .slice(0, 5)
        .map((c) => c.char)
        .concat([char])
        .sort(() => Math.random() - 0.5);

      word.push({
        isQuestion: true,
        choices,
        answer: char,
      });
    }

    words.push({
      content: w.reading,
      isQuestion: true,
      parts: word,
      answer: w.word,
      index: ++index,
    });
  }

  return words;
}

module.exports = {
  kanjiQuiz,
};
