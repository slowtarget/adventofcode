import run from "aocrunner";

const parseInput = (rawInput: string) => {
  return rawInput;
};

const solve = (rawInput: string, target: number) => {
  const input = parseInput(rawInput);
  let track: string[] = [];
  for (let i = 0; i < input.length; i++) {
    track.push(input.charAt(i));
    if (track.length > target) {
      track = track.slice(1);
    }
    if (track.length === target) {
      const unique = new Set<string>(track);
      if (unique.size === target) {
        return i + 1;
      }
    }
  }

  return 0;
};
const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  return solve(input, 4);
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return solve(input, 14);
};

const testInput: {
  input: string;
  part1: number;
  part2: number;
}[] = [
  { input: "mjqjpqmgbljsphdztnvjfqwrcgsmlb", part1: 7, part2: 19 },
  { input: "bvwbjplbgvbhsrlpgdmjqwftvncz", part1: 5, part2: 23 },
  { input: "nppdvjthqldpwncqszvftbrmjlhg", part1: 6, part2: 23 },
  { input: "nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg", part1: 10, part2: 29 },
  { input: "zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw", part1: 11, part2: 26 },
];

run({
  part1: {
    tests: testInput.map((x) => ({ input: x.input, expected: x.part1 })),
    solution: part1,
  },
  part2: {
    tests: testInput.map((x) => ({ input: x.input, expected: x.part2 })),
    solution: part2,
  },
  trimTestInputs: true,
  // onlyTests: true,
});
