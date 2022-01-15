import run from "aocrunner";
import cluster from "cluster";
const DIGITS = {
  0: { count: 6, segments: "abcefg" },
  1: { count: 2, segments: "cf" },
  2: { count: 5, segments: "acdeg" },
  3: { count: 5, segments: "acdfg" },
  4: { count: 4, segments: "bcdf" },
  5: { count: 5, segments: "abdfg" },
  6: { count: 6, segments: "abdefg" },
  7: { count: 3, segments: "acf" },
  8: { count: 7, segments: "abcdefg" },
  9: { count: 6, segments: "abcdfg" },
};
const segmentFrequency = {
  4: "e",
  6: "b",
  7: "dg",
  8: "ac",
  9: "f",
};

type Input = {
  clues: string[];
  puzzle: string[];
};

const parseInput = (rawInput: string) => {
  return rawInput
    .replace(/\r\n/g, "\n")
    .split(/\n/g)
    .map((line) =>
      line.split(/\|/g).map((v) =>
        v
          .trim()
          .split(/\s+/)
          .map((s) => {
            var a = s.split("");
            a.sort();
            return a.join("");
          }),
      ),
    )
    .map(([clues, puzzle]) => <Input>{ clues, puzzle });
};

const decode = (input: Input): number => {
  var byLengthInit: { [idx: number]: string[][] } = Object.values(DIGITS)
    .map((v) => v.count)
    .reduce((p, c) => ({ ...p, [c]: [] }), {});
  var byLength = input.clues.reduce((p, c) => {
    p[c.length].push(c.split(""));
    return p;
  }, byLengthInit);
  const initFreq: { [freq: number]: string[] } = {
    4: [],
    6: [],
    7: [],
    8: [],
    9: [],
  };
  var letterfrequency = input.clues
    .join("")
    .split("")
    .reduce(
      (p, c) => {
        p[c]++;
        return p;
      },
      <{ [l: string]: number }>{ a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0 },
    );
  var distribution = Object.entries(letterfrequency).reduce(
    (prev, [letter, freq]) => {
      prev[freq].push(letter);
      return prev;
    },
    initFreq,
  );

  var [e, b, f, dg, ac] = [
    distribution[4][0],
    distribution[6][0],
    distribution[9][0],
    distribution[7],
    distribution[8],
  ];

  var cf = byLength[2][0]; // one
  var c = cf.filter((l) => l !== f)[0];

  var bcdf = byLength[4][0]; // four
  var d = bcdf.filter((l) => ![b, c, f].includes(l))[0];

  var a = ac.filter((l) => ![c].includes(l))[0];
  var g = dg.filter((l) => ![d].includes(l))[0];

  var wireEncoder: { [l: string]: string } = {
    a: a,
    b: b,
    c: c,
    d: d,
    e: e,
    f: f,
    g: g,
  };

  var segmentsDecoder: { [l: string]: number } = Object.entries(DIGITS)
    .map(([digit, { segments }]): [encoded: string, digit: number] => {
      var encoded = segments.split("").map((l) => wireEncoder[l]);
      encoded.sort();
      return [encoded.join(""), parseInt(digit, 10)];
    })
    .reduce(
      (p, [encoded, digit]) => ({ ...p, [encoded]: digit }),
      <{ [l: string]: number }>{},
    );

  var result = parseInt(
    input.puzzle.map((segments) => segmentsDecoder[segments]).join(""),
    10,
  );
  // console.log(`segments decoder : ${JSON.stringify(segmentsDecoder)} : ${input.puzzle} : ${input.puzzle.map(segments=>segmentsDecoder[segments]).join("")} : ${result}`);
  return result;
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return input
    .map((i) => i.puzzle)
    .reduce(
      (prev, cur) =>
        prev +
        cur.reduce((p, c) => p + ([2, 3, 4, 7].includes(c.length) ? 1 : 0), 0),
      0,
    );
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return input.map((i) => decode(i)).reduce((p, c) => p + c, 0);
};

const testInputs = [
  `acedgfb cdfbe gcdfa fbcad dab cefabd cdfgeb eafb cagedb ab | cdfeb fcadb cdfeb cdbaf`,
  `
be cfbegad cbdgef fgaecd cgeb fdcge agebfd fecdb fabcd edb | fdgacbe cefdb cefbgd gcbe
edbfga begcd cbg gc gcadebf fbgde acbgfd abcde gfcbed gfec | fcgedb cgb dgebacf gc
fgaebd cg bdaec gdafb agbcfd gdcbef bgcad gfac gcb cdgabef | cg cg fdcagb cbg
fbegcd cbd adcefb dageb afcb bc aefdc ecdab fgdeca fcdbega | efabcd cedba gadfec cb
aecbfdg fbg gf bafeg dbefa fcge gcbea fcaegb dgceab fcbdga | gecf egdcabf bgf bfgea
fgeab ca afcebg bdacfeg cfaedg gcfdb baec bfadeg bafgc acf | gebdcfa ecba ca fadegcb
dbcfg fgd bdegcaf fgec aegbdf ecdfab fbedc dacgb gdcebf gf | cefg dcbef fcge gbcadfe
bdfegc cbegaf gecbf dfcage bdacg ed bedf ced adcbefg gebcd | ed bcgafe cdgba cbgef
egadfb cdbfeg cegd fecab cgb gbdefca cg fgcdab egfdb bfceg | gbdfcae bgc cg cgb
gcafb gcf dcaebfg ecagb gf abcdeg gaef cafbge fdbac fegbdc | fgae cfgab fg bagce`,
];

run({
  part1: {
    tests: [
      {
        input: testInputs[0],
        expected: 0,
      },
      {
        input: testInputs[1],
        expected: 26,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInputs[0],
        expected: 5353,
      },
      {
        input: testInputs[1],
        expected: 61229,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
