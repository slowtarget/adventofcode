import run from "aocrunner";

var Reset = "\x1b[0m";
var Bright = "\x1b[1m";
var Dim = "\x1b[2m";
var Underscore = "\x1b[4m";
var Blink = "\x1b[5m";
var Reverse = "\x1b[7m";
var Hidden = "\x1b[8m";
var FgBlack = "\x1b[30m";
var FgRed = "\x1b[31m";
var FgGreen = "\x1b[32m";
var FgYellow = "\x1b[33m";
var FgBlue = "\x1b[34m";
var FgMagenta = "\x1b[35m";
var FgCyan = "\x1b[36m";
var FgWhite = "\x1b[37m";
var BgBlack = "\x1b[40m";
var BgRed = "\x1b[41m";
var BgGreen = "\x1b[42m";
var BgYellow = "\x1b[43m";
var BgBlue = "\x1b[44m";
var BgMagenta = "\x1b[45m";
var BgCyan = "\x1b[46m";

const hex: { [idx: string]: string } = {
  "0": "0000",
  "1": "0001",
  "2": "0010",
  "3": "0011",
  "4": "0100",
  "5": "0101",
  "6": "0110",
  "7": "0111",
  "8": "1000",
  "9": "1001",
  A: "1010",
  B: "1011",
  C: "1100",
  D: "1101",
  E: "1110",
  F: "1111",
};

type Range = { min: number; max: number };
type Target = { x: Range; y: Range };
var debug = false;

//  X RANGE	157	 14
//  Y RANGE	145	-146

const unique = <T extends Object>(value: T, index: number, self: T[]) => {
  var first = self.findIndex((p) => p.toString() === value.toString());
  return first === index;
};

const toKey = (x: number, y: number): string => {
  return `(${x},${y})`;
};
const numToRightJustifiedString = (num: number, length: number): string => {
  var s = num.toString(10);

  return s.padStart(length, " ");
};

// Returns current time
// (and, if provided, prints the event's name)
const now = (eventName: string | null = null) => {
  if (eventName && debug) {
    console.log(`Started ${eventName}..`);
  }
  return new Date().getTime();
};

// Store current time as `start`
let begunAt = now();

// Returns time elapsed since `beginning`
// (and, optionally, prints the duration in seconds)
const elapsed = (beginning: number = begunAt, log: boolean = false) => {
  const duration = new Date().getTime() - beginning;
  if (log && debug) {
    console.log(`${duration / 1000}s`);
  }
  return duration;
};

class Puzzle {
  xR: Range;
  yR: Range;
  expected?: number;
  maxHeight: number = 0;
  result: number = 0;
  constructor(public input: Target) {
    this.yR = { max: Math.abs(input.y.min) - 1, min: input.y.min };
    var sum = 0;
    var i = 1;
    var list: number[] = [];
    while (sum < input.x.min) {
      sum += i;
      list.push(sum);
      i++;
    }
    this.xR = { max: input.x.max, min: list.length };
  }
  public get(x: number, y: number): number {
    var dx = 0;
    var dy = 0;

    var velocity: { x: number; y: number } = { x, y };
    var hit = false;
    while (dx <= this.input.x.max && dy >= this.input.y.min && !hit) {
      dx += velocity.x;
      dy += velocity.y;
      if (dy > this.maxHeight) {
        this.maxHeight = dy;
      }
      hit =
        dx >= this.input.x.min &&
        dx <= this.input.x.max &&
        dy >= this.input.y.min &&
        dy <= this.input.y.max;
      if (debug) {
        console.log(`${dx},${dy} :${velocity} ${hit}`);
      }
      velocity = { x: Math.max(velocity.x - 1, 0), y: velocity.y - 1 };
    }
    return hit ? 1 : 0;
  }
  public solve() {
    var result = 0;

    for (var x = this.xR.min; x <= this.xR.max; x++) {
      if (debug) {
        console.log(`${x} :${result}`);
      }
      for (var y = this.yR.min; y <= this.yR.max; y++) {
        result += this.get(x, y);
      }
    }

    elapsed(begunAt, true);
    this.result = result;
    return result;
  }
}
// target area: x=102..157, y=-146..-90
const regex =
  /^target area: x=((?:-?)\d+)\.\.((?:-?)\d+), y=((?:-?)\d+)\.\.((?:-?)\d+)/;
const parseInput = (rawInput: string) => {
  var [, x1, x2, y1, y2] = regex.exec(rawInput).map(Number);
  var puzzle = new Puzzle(<Target>{
    x: { min: x1, max: x2 },
    y: { min: y1, max: y2 },
  });
  puzzle.solve();
  return puzzle;
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return input.maxHeight;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return input.result;
};

const testInput = `target area: x=20..30, y=-10..-5`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 45,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 112,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
