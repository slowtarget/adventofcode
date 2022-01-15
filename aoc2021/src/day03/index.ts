import run from "aocrunner";

const parseInput = (rawInput: string) =>
  rawInput.replace(/\r\n/g, "\n").split("\n");
const mostPopular = (freq: number[], mid: number) => {
  return parseInt(freq.map((x, i) => (x > mid ? "1" : "0")).join(""), 2);
};
const leastPopular = (freq: number[], mid: number) => {
  return parseInt(freq.map((x, i) => (x > mid ? "0" : "1")).join(""), 2);
};
const getFrequencies = (input: string[]) => {
  return input.reduce((frequencies, c) => {
    c.split("").forEach((x, i) => {
      if (x === "1") {
        frequencies[i]++;
      }
    });
    return frequencies;
  }, new Array(input[0].length).fill(0));
};

const getFrequenciesII = (input: string[]) => {
  return [...Array(input[0].length).keys()].map(
    (y) => input.filter((s) => s.charAt(y) === "1").length,
  );
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  var frequencies = getFrequenciesII(input);
  return (
    mostPopular(frequencies, input.length / 2) *
    leastPopular(frequencies, input.length / 2)
  );
};
const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  // most popular
  var next = [...input];
  for (var y = 0; y < input[0].length && next.length !== 1; y++) {
    var remainder = [...next];
    var bit =
      remainder.filter((s) => s.charAt(y) === "1").length >=
      remainder.length / 2
        ? "1"
        : "0";
    next = remainder.filter((s) => s.charAt(y) === bit);
  }
  var most = next[0];
  // least popular
  next = [...input];
  for (y = 0; y < input[0].length && next.length !== 1; y++) {
    remainder = [...next];
    bit =
      remainder.filter((s) => s.charAt(y) === "1").length >=
      remainder.length / 2
        ? "0"
        : "1";
    next = remainder.filter((s) => s.charAt(y) === bit);
  }
  var least = next[0];
  return parseInt(most, 2) * parseInt(least, 2);
};

run({
  part1: {
    tests: [
      {
        input: `
        00100
        11110
        10110
        10111
        10101
        01111
        00111
        11100
        10000
        11001
        00010
        01010
`,
        expected: 198,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
        00100
        11110
        10110
        10111
        10101
        01111
        00111
        11100
        10000
        11001
        00010
        01010
`,
        expected: 230,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
