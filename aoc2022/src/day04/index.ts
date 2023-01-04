import run from "aocrunner";

class Range {
  max: number;
  min: number;

  constructor(limits: number[]) {
    [this.min, this.max] = limits;
  }
  contains(b: Range) {
    if (this.min <= b.min && this.max >= b.max) {
      return true;
    }
    return false;
  }
  intersects(b: Range) {
    if (this.min <= b.max && this.max >= b.min) {
      return true;
    }
    return false;
  }
}

class Pair {
  a: Range;
  b: Range;

  constructor(
    pair: number[][]
    ) {
    [this.a, this.b] = pair.map((p) => new Range(p));
  }
}

const parseInput = (rawInput: string) => {
  return rawInput
    .replace(/\r\n/g, "\n")
    .split(/\n/g)
    .map((line) => line.split(",").map((pair) => pair.split("-").map(Number)))
    .map((x) => new Pair(x));
};
let input: Pair[];
const part1 = (rawInput: string) => {
  input = parseInput(rawInput);
  const start: number = 0;
  return input
    .map((pair) => {
      if (pair.a.contains(pair.b) || pair.b.contains(pair.a)) {
        return 1;
      }
      return 0;
    })
    .reduce((p, c) => p + c, start);
};

const part2 = (rawInput: string) => {
  const start: number = 0;
  return input
    .map((pair) => {
      return pair.a.intersects(pair.b) ? 1 : 0;
    })
    .reduce((p, c) => p + c, start);
};

const testInput = `
2-4,6-8
2-3,4-5
5-7,7-9
2-8,3-7
6-6,4-6
2-6,4-8
`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 2,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 4,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  // onlyTests: true,
});
