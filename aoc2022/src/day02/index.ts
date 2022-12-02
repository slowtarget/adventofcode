import run from "aocrunner";

const parseInput = (rawInput: string) => {
  return rawInput
    .replace(/\r\n/g, "\n")
    .split(/\n/g)
    .map((line) => line.split(/ /));
};
// A X R ock
// B Y P aper
// C Z S cissors
const R = "R";
const P = "P";
const S = "S";

type Shape = "R" | "P" | "S";
type Outcome = "W" | "L" | "D";

const playMap : Record<string, Shape> = {A:R, B:P,C:S};

const responseMap : Record<string, Shape> = {X:R, Y:P,Z:S};

const outcomeMap : Record<string, Outcome> = {X:"L", Y:"D",Z:"W"};

const shapeScore: Record<Shape, number> = { R: 1, P: 2, S: 3 };

const outcomeScore: Record<Outcome, number> = {W:6, D:3, L:0};

const outcomePicker: Record<Shape, Record<Shape, Outcome>> = {
  R: { R: "D", P: "W", S: "L" },
  P: { R: "L", P: "D", S: "W" },
  S: { R: "W", P: "L", S: "D" },
};

const responsePicker: Record<Shape, Record<Outcome, Shape>> = {
  R: { L: S, D: R, W: P },
  P: { L: R, D: P, W: S },
  S: { L: P, D: S, W: R },
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const result = input
    .map((round) => {
      const [playIn, responseIn] = round;
      const play = playMap[playIn];
      const response = responseMap[responseIn];

      const outcome : Outcome = outcomePicker[play][response]
      const score = outcomeScore[outcome] + shapeScore[response];
      return score;
    })
    .reduce((p, c) => p + c, 0);
  return result;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const result = input
    .map((round) => {
      const [playIn, outcomeIn] = round;
      
      const play = playMap[playIn];
      const outcome = outcomeMap[outcomeIn];

      const response = responsePicker[play][outcome];
      const score = outcomeScore[outcome] + shapeScore[response];
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
