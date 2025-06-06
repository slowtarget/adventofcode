import run from "aocrunner";
import fs from "fs";
import {addIndex, flatten, map, pipe, split } from "ramda";

const parseInput = (rawInput: string) => rawInput;
const indexedMapSplit= addIndex(map);

class Point {
  x: number;
  y: number;
  constructor(x:number, y:number) {
    this.x = x;
    this.y = y;
  }
}
class ForwardMirror extends Point {
    constructor(x:number, y:number) {
        super(x,y);
    }
}
class BackwardMirror extends Point {
  constructor(x:number, y:number) {
    super(x,y);
  }
}
class HorizontalSplitter extends Point {
  constructor(x:number, y:number) {
    super(x,y);
  }
}
class VerticalSplitter extends Point {
  constructor(x:number, y:number) {
    super(x,y);
  }
}

class Cave {
  grid : Point[];
  constructor(coords:{x:number, y: number, char: string}[]) {
    this.grid = coords.map(({x,y,char})=>{
      switch (char) {
        case "/":
          return new ForwardMirror(x,y);
        case "\\":
          return new BackwardMirror(x,y);
        case "-":
          return new HorizontalSplitter(x,y);
        case "|":
          return new VerticalSplitter(x,y);
        default:
          throw new Error(`unknown char ${char}`)
      }
    });
  }
}

const part1 = pipe(
    split("\n"),
    (lines) => lines.map((line, y, lines)=>line.split("")
          .map((char, x, chars)=>char === "." ? null : {x,y,char})
            .filter((x)=>x)
        ),
    flatten,
    (coords) => new Cave(coords),

);


const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return;
};

const testInput = fs.readFileSync("./src/day05/testInput.txt", 'utf8');
console.log(testInput);

run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 46,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      // {
      //   input: ``,
      //   expected: "",
      // },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
