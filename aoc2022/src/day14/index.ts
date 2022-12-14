import run from "aocrunner";
class Point {
  public x: number;
  public y: number;
  constructor(coords: number[]) {
    this.x = coords[0];
    this.y = coords[1];
  }
}
class Line {
  constructor(public points: Point[]) {}
}
class Tile {
  public rock: boolean = false;
  public sand: boolean = false;
  constructor(public x: number, public y: number) {}
  toString() {
    return "x";
  }
}
class Rock extends Tile {
  constructor(public x: number, public y: number) {
    super(x, y);
    this.rock = true;
  }
  toString() {
    return "#";
  }
}
class Sand extends Tile {
  constructor(public x: number, public y: number) {
    super(x, y);
    this.sand = true;
  }
  toString() {
    return "o";
  }
}
class Cave {
  public grid: Tile[][] = [];
  public chasm: number;
  public sand: number = 0;
  public minX: number = 0;
  constructor(public lines: Line[]) {
    lines.forEach((line) => this.draw(line));
    this.chasm = this.grid.length - 1;
    console.log(`chasm starts at ${this.chasm}`);
    this.minX = Math.min(
      ...lines.map((line) => line.points.map((point) => point.x)).flat(),
    );
  }
  getDelta(from: number, to: number) {
    return from === to ? 0 : (to - from) / Math.abs(to - from);
  }
  draw(line: Line) {
    let from = line.points[0];
    let i = 1;
    while (i < line.points.length) {
      let to = line.points[i];
      let dx = this.getDelta(from.x, to.x);
      let dy = this.getDelta(from.y, to.y);

      this.addRock(from.x, from.y);
      let x = from.x;
      let y = from.y;
      while (
        x >= Math.min(from.x, to.x) &&
        x <= Math.max(from.x, to.x) &&
        y >= Math.min(from.y, to.y) &&
        y <= Math.max(from.y, to.y)
      ) {
        this.addRock(x, y);
        x += dx;
        y += dy;
      }

      i++;
      from = to;
    }
  }
  addRock(x: number, y: number) {
    this.grid[y] = this.grid[y] ?? [];
    this.grid[y][x] = new Rock(x, y);
  }
  addSand(x: number, y: number) {
    this.grid[y] = this.grid[y] ?? [];
    this.grid[y][x] = new Sand(x, y);
    this.sand++;
  }

  getFall(x: number, y: number) {
    this.grid[y + 1] = this.grid[y + 1] ?? [];
    return [0, -1, 1].find((dx) => !this.grid[y + 1][x + dx]);
  }
  toString() {
    return this.grid
      .map((line) =>
        line
          .slice(this.minX)
          .map((tile) => (tile ? tile.toString() : " "))
          .join(""),
      )
      .join("\n");
  }
}
const parseInput = (rawInput: string) => {
  return new Cave(
    rawInput
      .replace(/\r\n/g, "\n")
      .split(/\n/g)
      .map((line) => {
        return new Line(
          line
            .split(/ -> /g)
            .map((point) => new Point(point.split(/,/).map(Number))),
        );
      }),
  );
};

const fallingSand = (input: Cave) => {
  let y = 0;
  let x = 500;
  input.grid[0] = input.grid[0] ?? [];
  while (y <= input.chasm && !input.grid[0][500]) {
    y = -1;
    x = 500;
    let resting = false;
    while (!resting && y <= input.chasm) {
      const dx = input.getFall(x, y);
      if (dx === undefined) {
        resting = true;
        input.addSand(x, y);
      } else {
        x += dx;
      }
      y++;
    }
    // console.log(`${input.toString()}`);
  }
  return input.sand;
};
const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  return fallingSand(input);
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const y = input.grid.length + 1;
  const minX = 500 - (y + 2);
  const maxX = 500 + (y + 2);
  input.draw(new Line([new Point([minX, y]), new Point([maxX, y])]));
  input.chasm = y + 1;
  return fallingSand(input);
};

const testInput = `
498,4 -> 498,6 -> 496,6
503,4 -> 502,4 -> 502,9 -> 494,9
`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 24,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 98,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  // onlyTests: true,S
});
