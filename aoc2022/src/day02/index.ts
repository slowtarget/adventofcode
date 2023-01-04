import run from "aocrunner";

const parseInput = (rawInput: string) => {
  return rawInput
    .replace(/\r\n/g, "\n")
    .split(/\n/g)
    .map((line) => line.split(/ /))
    .map(([play, response]) => ({play: playMap[play], response: responseMap[response], outcome: outcomeMap[response]}));
};
// A X R ock
// B Y P aper
// C Z S cissors

enum Outcome {
  W = 6,
  D = 3,
  L = 0
}
enum Shape {
  R = 1,
  P = 2,
  S = 3
}
const playMap: Record<string, Shape> = { A: Shape.R, B: Shape.P, C: Shape.S };

const responseMap: Record<string, Shape> = { X: Shape.R, Y: Shape.P, Z: Shape.S };
const outcomeMap: Record<string, Outcome> = { X: Outcome.L, Y: Outcome.D, Z: Outcome.W };

const outcomePicker: Record<Shape, Record<Shape, Outcome>> = {
  [Shape.R]: { [Shape.R]: Outcome.D, [Shape.P]: Outcome.W, [Shape.S]: Outcome.L },
  [Shape.P]: { [Shape.R]: Outcome.L, [Shape.P]: Outcome.D, [Shape.S]: Outcome.W },
  [Shape.S]: { [Shape.R]: Outcome.W, [Shape.P]: Outcome.L, [Shape.S]: Outcome.D },
};
const responsePicker: Record<Shape, Record<Outcome, Shape>> = {
  [Shape.R]: { [Outcome.L]: Shape.S, [Outcome.D]: Shape.R, [Outcome.W]: Shape.P },
  [Shape.P]: { [Outcome.L]: Shape.R, [Outcome.D]: Shape.P, [Outcome.W]: Shape.S },
  [Shape.S]: { [Outcome.L]: Shape.P, [Outcome.D]: Shape.S, [Outcome.W]: Shape.R },
};

let input : {play: Shape, response: Shape, outcome: Outcome}[];
const part1 = (rawInput: string) => {
  input = parseInput(rawInput);
  return input
    .map(({play, response}) => outcomePicker[play][response] + response)
    .reduce((p, c) => p + c, 0);
};

const part2 = (rawInput: string) => {
  return input
    .map(({play, outcome}) => outcome + responsePicker[play][outcome])
    .reduce((p, c) => p + c, 0);
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
