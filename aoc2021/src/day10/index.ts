import run from "aocrunner";
const scores: { [symbol: string]: number } = {
  ")": 3,
  "]": 57,
  "}": 1197,
  ">": 25137
};
const completion: { [symbol: string]: number } = {
  "(": 1,
  "[": 2,
  "{": 3,
  "<": 4
}
const regex = /^.*?([\}\>\)\]])/gm;
const removeValid = (s: string) => {
  var oldString = "";
  var newString = s;
  while (oldString != newString) {

    oldString = newString;
    newString = oldString.replace(/\<\>/g, "").replace(/\(\)/g, "").replace(/\{\}/g, "").replace(/\[\]/g, "");
  }
  return newString;
}
const reverseString = (s: string): string => {
  return s.split("").reverse().join('');
}

const parseInput = (rawInput: string) => rawInput
  .replace(/\r\n/g, '\n')
  .split(/\n/g)
  .map(v => v.trim())
  .map(a => removeValid(a))
  .filter(a => a !== "");

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const matched = input.map(d => { var m = regex.exec(d); regex.lastIndex = 0; return m });
  const symbols = matched.filter(d => d !== null).map(d => d !== null && d.length > 0 && d[1]);
  const score = symbols.map(s => s ? scores[s] : 0);

  return score.reduce((p, c) => p + c, 0)
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const incomplete = input.filter(d => { var m = regex.exec(d); regex.lastIndex = 0; return m == null });
  const autocompleteScores = incomplete.map(s => reverseString(s)).map(s => s.split("").map(c => completion[c]).reduce((p, c) => p * 5 + c, 0));
  autocompleteScores.sort((a, b) => a - b)
  return autocompleteScores[((autocompleteScores.length + 1) / 2) - 1];
};

const testInput = `
[({(<(())[]>[[{[]{<()<>>
[(()[<>])]({[<{<<[]>>(
{([(<{}[<>[]}>{[]{[(<()>
(((({<>}<{<{<>}{[]{[]{}
[[<[([]))<([[{}[[()]]]
[{[{({}]{}}([{[{{{}}([]
{<[[]]>}<{[{[{[]{()[[[]
[<(<(<(<{}))><([]([]()
<{([([[(<>()){}]>(<<{{
<{([{{}}[<[[[<>{}]]]>[]]`;
run({
  part1: {
    tests: [
      { input: `)`, expected: 3 },
      { input: `]`, expected: 57 },
      { input: `}`, expected: 1197 },
      { input: `>`, expected: 25137 },
      {
        input: testInput,
        expected: 26397,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 288957,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
