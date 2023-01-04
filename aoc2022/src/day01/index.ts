import run from "aocrunner";

const parseInput = (rawInput: string) => {
  return rawInput
    .replace(/\r\n/g, "\n")
    .split(/\n\n/g)
    .map((s) => s.split(/\n/).map(Number));
};

let input: number[][];
const part1 = (rawInput: string) => {
  input = parseInput(rawInput);

  return input
    .map((s) => s.reduce((p, c) => p + c, 0))
    .reduce((p2, c2) => (p2 > c2 ? p2 : c2), 0);
};

const part2 = (rawInput: string) => {
  return input
    .map((s) => s.reduce((p, c) => p + c, 0))
    .sort((a, b) => b - a)
    .slice(0, 3)
    .reduce((p, c) => p + c, 0);
};

const testInput = `
1000
2000
3000

4000

5000
6000

7000
8000
9000

10000
`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 24000,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 45000,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
