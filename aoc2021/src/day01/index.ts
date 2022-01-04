import run from "aocrunner";

const parseInput = (rawInput: string) => rawInput.replace(/\r\n/g, '\n').split('\n').map(x => parseInt(x, 10));

type Result = { previous: number, increases: number };
const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return input.reduce((p, c) => (
    <Result>{ increases: p.increases + (p.previous < c ? 1 : 0), previous: c }),
    { previous: Number.MAX_VALUE, increases: 0 }).increases;
};
type Result2 = { p3: number, p2: number, p1: number, increases: number };
const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return input.reduce((p, c) => (
    <Result2>{ increases: p.increases + ((p.p3 + p.p2 + p.p1) < (c + p.p2 + p.p1) ? 1 : 0), p3: p.p2, p2: p.p1, p1: c }),
    { p1: Number.MAX_VALUE / 4, p2: Number.MAX_VALUE / 4, p3: Number.MAX_VALUE / 4, increases: 0 }).increases;
};

run({
  part1: {
    tests: [
      {
        input: `
        199
        200
        208
        210
        200
        207
        240
        269
        260
        263
`,
        expected: 7,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
        199
        200
        208
        210
        200
        207
        240
        269
        260
        263
`,
        expected: 5,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
