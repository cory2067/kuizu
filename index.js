const MeCab = require("mecab-async");
const similarity = require("./similarKanji.json");
const parse = require("./parse.js");
const wanakana = require("wanakana");

/*const neighbors = require("./neighbors.js");
neighbors.init();*/

const seen = {};

const getQuestion = async (sentence) => {
  const res = await parse.getKuromoji(sentence);
  const words = [];

  let index = 0;
  for (const w of res) {
    const rawTokens = wanakana.tokenize(w.word, { detailed: true });
    const hasKanji = rawTokens.some((t) => t.type === "kanji");

    if (!hasKanji || seen[w.base]) {
      words.push({ content: w.word, isQuestion: false });
      continue;
    }

    // split up kanji into separate tokens
    const tokens = rawTokens.reduce((acc, cur) => {
      if (cur.type === "kanji") {
        return [
          ...acc,
          ...[...cur.value].map((ch) => ({ type: "kanji", value: ch })),
        ];
      }
      return [...acc, cur];
    }, []);

    seen[w.base] = true;

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
      chars: word,
      index: ++index,
    });
  }

  const prompt = words
    .map((word) => {
      if (!word.isQuestion) {
        return word.content;
      }

      return `❰${word.index} ${word.content}❱`;
    })
    .join("");

  console.log(prompt);
  console.log();

  const questions = words
    .filter((w) => w.isQuestion)
    .map((word) => {
      const parts = word.chars.map((ch) =>
        ch.isQuestion ? ch.choices.join("・") : ch.content
      );
      return `${word.index}. ${parts.join(" | ")}`;
    });

  console.log(questions.join("\n"));
};

const main = async () => {
  const input = `皆さんは寄付をしたことがあるだろうか。異常気象で食べる物が不足して困っている人や、地震で家を失った人のためにわずかながらもお小遣いから寄付した経験を持つ人は多いだろう。その寄付に対する考え方に、今、新しい動きが起こっている。ある会社では、社員食堂で低カロリーの定食を食べると代金の一部が寄付金となって途上国の子供たちの食生活を支援する、というシステムを取り入れている。社員としては体調管理につながるだけでなく、人を助けることができ、会社としては社員の健康を支えながら社会貢献ができるので、社員にとっても会社にとっても一石二鳥というわけだ。また、「寄付つき」の商品を販売する企業も増えている。特定の商品を買うと売り上げの一部が寄付されるというもので、他の商品と比べるとやや値段は高いが、商品を買えば、同時に寄付できるという手軽さが消費者に歓迎され、売り上げを伸ばしているという。これまでの寄付はわざわざ募金の場所へ足を運んだり、銀行からお金を振り込んだりしなければならないものが多く、社会貢献に関心はあっても寄付をするのは面倒だと実際の行動には移さない人も少なくなかった。そこに目をつけたのが新しい寄付の形で、これまでと比べ手軽に寄付できるようになり、社会貢献がしやすくなった。さらに、企業にとっても自社のイメージの向上や売り上げの増加などメリットの多い取り組みとなっている。このように寄付は慈善のためというばかりでなく、寄付をする側にもプラスになる活動としてとらえ直され始めている。`;

  const sentences = input
    .split(/[.。]/)
    .map((s) => s.trim())
    .filter((s) => s);

  for (const sentence of sentences) {
    console.log("Complete the kanji for this sentence:");
    await getQuestion(sentence);
    console.log("\n-------\n");
  }

  /*
  console.log("\n~ Nearest-Neighbor Analysis ~");
  for (const w of mecabRes) {
    if (["動詞", "形容詞", "名詞"].includes(w.pos)) {
      const similar = await neighbors.get(w.word);
      console.log(
        `${w.word} (${w.pos}) is related to ${similar
          .map((w) => w.word)
          .join(", ")}`
      );
    }
  }
  */

  //neighbors.close();
};

main();
