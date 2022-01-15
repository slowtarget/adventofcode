import run from "aocrunner";
import * as Logger from "bunyan";

var log = Logger.createLogger({ name: "2021 day4", level: "warn" });

const parseInput = (rawInput: string) => {
  return rawInput
    .replace(/\r\n/g, '\n')
    .split(/\n\n/g);
}


const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return 0;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return 0;
};

const testInput = `
`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 0,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 0,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
