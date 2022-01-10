import run from "aocrunner";

const parseInput = (rawInput: string) => {
  return rawInput
    .replace(/\r\n/g, '\n')
    .split(/\n/g)
    .map(Number);
}


const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return input
    .map(a => input
      .filter(b => b > a)
      .filter(b => (a + b) == 2020)
      .map(b => a * b))
    .filter(a => a.length > 0)[0][0]
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return input
    .map(a => input
      .filter(b => b > a)
      .map(b => input
        .filter(c => c > b)
        .filter(c => (a + b + c) == 2020)
        .map(c => a * b * c))
      .filter(a => a.length > 0))
    .filter(a => a.length > 0)[0][0][0];
};

const testInput = `
1721
979
366
299
675
1456`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 514579,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 241861950,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
