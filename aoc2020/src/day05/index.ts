import run from "aocrunner";

const parseInput = (rawInput: string) => {
  return rawInput
    .replace(/\r\n/g, '\n')
    .split(/\n/g)
    .map(s => seat(s));
}
const seat = (input: string) => {
  const b = input.replace(/[L,F]/g, "0").replace(/[R,B]/g, "1");
  // console.log(`${input} => ${parseInt(b,2)}`);
  return parseInt(b, 2);
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return Math.max(...input);
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  input.sort((a, b) => a - b);
  var previous = input[0];
  for (var s = 1; s < input.length; s++) {
    if (previous + 1 === input[s]) {
      previous = input[s];
    } else {
      return previous + 1;
    }
  }
  return 0;
};

const testInput = `
FBFBBBBRLR
FBFBBBBRRL
FBFBBBBRRR
FBBFFFFLLR
`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 385,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 384,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
