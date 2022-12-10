import run from "aocrunner";

const parseInput = (rawInput: string) => {
  return rawInput.replace(/\r\n/g, "\n").split(/\n/g);
};
// Lowercase item types a through z have priorities 1 through 26.
// Uppercase item types A through Z have priorities 27 through 52.
// UTF-16 A-Z: 65-90 a-z: 97-122
const priorities = [...Array.from({ length: 52 }, (_, i) => i + 1)]; // [1,2,3, ... 52]

const getPriority = (utf16: number) => {
  if (utf16 > 90) {
    return utf16 - 97 + 1;
  }
  return utf16 - 65 + 27;
};

const getCandidates = (line: string) => {
  let candidates = new Array<boolean>(53);
  for (let i = 0; i < line.length; i++) {
    const priority = getPriority(line.charCodeAt(i));
    candidates[priority] = true;
  }
  return [...candidates];
};

const chunk = <T>(size: number, list: T[]): T[][] => {
  const start: T[][] = [];
  return list.reduce((acc, curr, i, self) => {
    if (!(i % size)) {
      return [...acc, self.slice(i, i + size)];
    }
    return acc;
  }, start);
};

function allPresent(
  candidates: boolean[][],
): (value: number, index: number, obj: number[]) => unknown {
  return (i) => candidates.every((candidate) => candidate[i]);
}

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  let result = input
    .map((line) => {
      let parts = [
        line.substring(0, line.length / 2),
        line.substring(line.length / 2),
      ];
      let candidates = parts.map(getCandidates);
      return (
        priorities.find((i) => candidates.every((candidate) => candidate[i])) ||
        0
      );
    })
    .reduce((p, c) => p + c, 0);

  return result;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  let result = chunk(3, input)
    .map((group) => {
      let candidates = group.map((line) => getCandidates(line));
      return priorities.find(allPresent(candidates)) || 0;
    })
    .reduce((p, c) => p + c, 0);

  return result;
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
  onlyTests: true,
});
