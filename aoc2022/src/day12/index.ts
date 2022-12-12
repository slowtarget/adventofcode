import run from "aocrunner";
var Reset = "\x1b[0m";
var FgYellow = "\x1b[33m";

type Neighbour = {
  name: string;
  dx: number;
  dy: number;
};
const neighbours: Neighbour[] = [
  { name: "up", dx: 0, dy: -1 },
  { name: "down", dx: 0, dy: 1 },
  { name: "left", dx: -1, dy: 0 },
  { name: "rigt", dx: 1, dy: 0 },
];
class Point {
  public adjacent: Point[] = [];
  public backwards: Point[] = [];
  public leastCost?: number;
  public path: boolean = false;
  public from?: Point;
  public distance: number = Infinity;
  public visited: boolean = false;
  constructor(
    public x: number,
    public y: number,
    public h: number,
    public isStart: boolean,
    public isEnd: boolean,
  ) {}
  travel() {
    this.adjacent
      .filter((a) => a != this.from)
      .filter((a) => !a.from)
      .forEach((a) => {
        a.leastCost = this.leastCost! + 1;
        a.from = this;
        a.travel();
      });
    this.adjacent
      .filter((a) => a != this.from)
      .filter((a) => (a.leastCost ?? 0) > (this.leastCost ?? Infinity) + 1)
      .forEach((a) => {
        // console.log(`overwrite! ${a} was ${a.leastCost} now ${this.leastCost! + 1}`);
        a.leastCost = this.leastCost! + 1;
        a.from = this;
        a.travel();
      });
  }
  walkHome(): number {
    this.path = true;
    if (this.from && !this.from.path) {
      return this.from.walkHome() + 1;
    }
    return 1;
  }
  highlight(s: string) {
    return `${FgYellow}${s}${Reset}`;
  }
  toString() {
    if (this.isStart) {
      return this.highlight("S");
    }
    if (this.isEnd) {
      return this.highlight("E");
    }
    const char = String.fromCharCode("a".charCodeAt(0) + this.h);
    if (this.path) {
      return this.highlight(char);
    }
    return char;
  }
}
class Map {
  public start: Point;
  public end: Point;
  pathLength: number = 0;
  constructor(public grid: Point[][]) {
    grid.flat().forEach((p) => {
      p.adjacent = neighbours
        .map((n) => ({ x: p.x + n.dx, y: p.y + n.dy }))
        .filter((coord) => coord.x > -1 && coord.x < grid[0].length)
        .filter((coord) => coord.y > -1 && coord.y < grid.length)
        .map((c) => this.grid[c.y][c.x])
        .filter((a) => a.h - p.h < 2);
      p.backwards = neighbours
        .map((n) => ({ x: p.x + n.dx, y: p.y + n.dy }))
        .filter((coord) => coord.x > -1 && coord.x < grid[0].length)
        .filter((coord) => coord.y > -1 && coord.y < grid.length)
        .map((c) => this.grid[c.y][c.x])
        .filter((a) => p.h - a.h < 2);
    });

    this.start =
      grid.flat().find((m) => m.isStart) ||
      (() => {
        throw new Error("could not find start");
      })();
    this.end =
      grid.flat().find((m) => m.isEnd) ||
      (() => {
        throw new Error("could not find end");
      })();
  }
  travel() {
    this.start.leastCost = 0;
    this.start.travel();
  }
  findPath() {
    this.pathLength = this.end.walkHome();
    console.log(`walk home: ${this.pathLength}`);
  }
  toString() {
    return this.grid
      .map((row) => {
        return row
          .map((p) => {
            return p.toString();
          })
          .join("");
      })
      .join("\n");
  }
}

const parseInput = (rawInput: string) => {
  const grid = rawInput
    .replace(/\r\n/g, "\n")
    .split(/\n/g)
    .map((line, y) =>
      line.split("").map((s, x) => {
        if (s === "E") {
          return new Point(x, y, 25, false, true);
        }
        if (s === "S") {
          return new Point(x, y, 0, true, false);
        }
        return new Point(
          x,
          y,
          s.charCodeAt(0) - "a".charCodeAt(0),
          false,
          false,
        );
      }),
    );
  return new Map(grid);
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  input.grid.flat().forEach((p) => {
    p.distance = Infinity;
    p.from = undefined;
  });
  input.start.distance = 0;
  let queue: Point[] = [...input.grid.flat()];
  while (queue.length) {
    queue.sort((a, b) => a.distance - b.distance);
    const min = queue.shift()!;
    min.visited = true;
    min.adjacent
      .filter((a) => a.visited === false)
      .forEach((a) => {
        a.distance = Math.min(a.distance, min.distance + 1);
      });
  }
  input.findPath();
  console.log(input.toString());
  return input.end.distance;
  // That's not the right answer; your answer is too high. 385 / 384
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  input.grid.flat().forEach((p) => {
    p.distance = Infinity;
    p.from = undefined;
  });
  input.end.distance = 0;
  let queue: Point[] = [...input.grid.flat()];
  while (queue.length) {
    queue.sort((a, b) => a.distance - b.distance);
    const min = queue.shift()!;
    min.visited = true;
    min.backwards
      .filter((a) => a.visited === false)
      .forEach((a) => {
        a.distance = Math.min(a.distance, min.distance + 1);
      });
  }
  input.findPath();
  console.log(input.toString());

  return input.grid
    .flat()
    .filter((p) => p.h === 0)
    .map((p) => p.distance)
    .reduce((p, c) => Math.min(p, c), Infinity);
};

const testInput = `
Sabqponm
abcryxxl
accszExk
acctuvwj
abdefghi
`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 31,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: -1,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  // onlyTests: true,
});
