const fs = require("fs");

const strokeWeight = 0.75;
const radicalWeight = 0.25;
const freqWeight = 0.2;

const parseCSV = (fileName) => {
  const similarity = {};
  const data = fs.readFileSync(fileName, {
    encoding: "utf8",
  });

  for (const rawLine of data.split("\n")) {
    const line = rawLine.split(" ");
    const key = line.shift();
    if (key === "") continue;

    similarity[key] = line
      .map((v, i) => {
        if (i % 2) return null;
        return { char: v, score: parseFloat(line[i + 1]) };
      })
      .filter((v) => v);
  }

  return similarity;
};

const simStroke = parseCSV("./data/jyouyou__strokeEditDistance.csv");
const simRadical = parseCSV("./data/jyouyou__yehAndLiRadical.csv");

const frequency = JSON.parse(fs.readFileSync("./data/similarKanji.json"));
const frequencyMap = frequency.slice(1, 2000).reduce((map, kanji, i) => {
  map[kanji[0]] = i;
  return map;
}, {});

const combined = {};
for (const kanji of Object.keys(simStroke)) {
  const res = {};
  for (const k of simStroke[kanji]) {
    if (!res[k.char]) res[k.char] = {};
    res[k.char].stroke = k.score;
  }

  for (const k of simRadical[kanji]) {
    if (!res[k.char]) res[k.char] = {};
    res[k.char].radical = k.score;
  }

  combined[kanji] = Object.keys(res)
    .map((k) => ({
      char: k,
      stroke: res[k].stroke || 0,
      radical: res[k].radical || 0,
      freq: frequencyMap[k] || 2000,
    }))
    .map((k) => ({
      ...k,
      score:
        Math.round(
          1000000 *
            (1 + (2000 - k.freq) / (2000 / freqWeight)) *
            (k.stroke * strokeWeight + k.radical * radicalWeight)
        ) / 1000000,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

fs.writeFileSync("./similarKanji.json", JSON.stringify(combined));
