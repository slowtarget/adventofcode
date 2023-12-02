import run from "aocrunner";
import {Draw, Game} from "./Game.js";
const parseInput = (rawInput: string) => rawInput.split("\n").map((line) => new Game(line));

const part1 = (rawInput: string) => {
  const test: Draw = {"blue": 14, "green": 13, "red": 12};
  const input: Game[] = parseInput(rawInput);
  // console.log(input.map(g=>({id: g.id, first:g.draws[0], max:g.max,
  //   possible: g.isPossible(test)})));
  return input.filter((game) => game.isPossible(test))
      .reduce((acc, curr) => acc + curr.id, 0);
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return input.map((game) => game.power()).reduce((acc, curr) => acc + curr, 0);
};

const input1 = `Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green`;
run({
  part1: {
    tests: [
      {
        input: input1,
        expected: 8,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: input1,
        expected: 2286,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
