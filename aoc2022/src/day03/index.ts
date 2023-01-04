import run from "aocrunner";

const parseInput = (rawInput: string) => {
  return rawInput
    .replace(/\r\n/g, "\n")
    .split(/\n/g)
    .map((line) => {
      const len = line.length / 2;
      const parts = [line.substring(0, len), line.substring(len)];
      return parts.map(getCandidates);
    });
};
// Lowercase item types a through z have priorities 1 through 26.
// Uppercase item types A through Z have priorities 27 through 52.
// UTF-16 A-Z: 65-90 a-z: 97-122

const getPriority = (utf16: number): [number, boolean] => {
  if (utf16 > 90) {
    return [1 << (utf16 - 97 + 1), false];
  }
  return [1 << (utf16 - 65 + 1), true];
};

const getCandidates = (line: string) => {
  let upperBits: number = 0;
  let lowerBits: number = 0;

  for (let i = 0; i < line.length; i++) {
    const [mask, upper] = getPriority(line.charCodeAt(i));
    if (upper) {
      upperBits = upperBits | mask;
    } else {
      lowerBits = lowerBits | mask;
    }
    // console.log(`${line.charAt(i)} u: ${upperBits.toString(2)} l: ${lowerBits.toString(2)}`)
  }
  // console.log(`u: ${upperBits.toString(2)}\n l: ${lowerBits.toString(2)}`)
  return [lowerBits, upperBits];
};

const getScore = (lower: number, upper: number): number => {
  let priority = 0;
  if (lower === 0) {
    priority = 26;
  } else {
    upper = lower;
  }

  let shift = 0;
  while (((upper >>> shift) & 1) === 0) {
    shift++;
    priority++;
  }

  return priority;
};

let input: number[][][];
const part1 = (rawInput: string) => {
  input = parseInput(rawInput);
  return input
    .map((candidates) => {
      const lower = candidates[0][0] & candidates[1][0];
      let upper = candidates[0][1] & candidates[1][1];

      return getScore(lower, upper);
    })
    .reduce((p, c) => p + c, 0);
};

const part2 = (rawInput: string) => {
  let sum = 0;
  const chunks = input.length / 3;

  for (let i = 0; i < chunks; i++) {
    const first = i * 3;
    const unsplit = [0, 1, 2]
      .map((line) => input[first + line])
      .map((line) => [0, 1].map((range) => line[0][range] | line[1][range])); // rejoin the parts... split for part1

    const [lower, upper] = [0, 1].map(
      (range) => unsplit[0][range] & unsplit[1][range] & unsplit[2][range],
    );
    sum += getScore(lower, upper);
  }

  return sum;
};

const testInput = `
vJrwpWtwJgWrhcsFMMfFFhFp
jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL
PmmdzqPrVvPwwTWBwg
wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn
ttgJtRGJQctTZtZT
CrZsJsPPZsGzwwsLwLmpwMDw
`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 157,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 70,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  // onlyTests: true,
});
