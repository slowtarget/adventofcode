import run from "aocrunner";

const parseInput = (rawInput: string) => {
  return rawInput
    .replace(/\r\n/g, "\n")
    .split(/\n/g)
    .map((l) => l.split(/ /));
};
// A X Rock
// B Y Paper
// C Z Scissors
const shapeScore: Record<string, number> = { X: 1, Y: 2, Z: 3 };

const outcomeScore: Record<string, Record<string, number>> = {
  A: { X: 3, Y: 6, Z: 0 },
  B: { X: 0, Y: 3, Z: 6 },
  C: { X: 6, Y: 0, Z: 3 },
};

const responsePicker: Record<string, Record<string, string>> = {
  A: { X: "Z", Y: "X", Z: "Y" },
  B: { X: "X", Y: "Y", Z: "Z" },
  C: { X: "Y", Y: "Z", Z: "X" },
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const result = input
    .map((round) => {
      const [play, response] = round;
      const score = outcomeScore[play][response] + shapeScore[response];
      return score;
    })
    .reduce((p, c) => p + c, 0);
  return result;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const result = input
    .map((round) => {
      const [play, outcome] = round;
      const response = responsePicker[play][outcome];
      const score = outcomeScore[play][response] + shapeScore[response];
      return score;
    })
    .reduce((p, c) => p + c, 0);
  return result;
};

const testInput = `
A Y
B X
C Z
`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 15,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 12,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
