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
  public fall: Tile[] = [];
  constructor(public x: number, public y: number) {}
  getFall() {
    return this.fall.find((tile) => !tile.sand);
  }
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
class Air extends Tile {
  constructor(public x: number, public y: number) {
    super(x, y);
  }
  toString() {
    return this.sand ? "O" : ".";
  }
}
class Cave {
  public grid: Tile[][] = [];
  public chasm: number;
  public sand: number = 0;
  public air: number = 0;
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
  airPop(x: number, y: number) {
    if (y > this.chasm + 1) {
      return undefined;
    }
    this.grid[y] = this.grid[y] ?? [];
    const tile = this.grid[y][x];
    if (tile) {
      if (tile.rock || tile.sand) {
        return undefined;
      }
      return tile;
    }
    const air = this.addAir(x, y);
    air.fall = [0, -1, 1]
      .map((dx) => this.airPop(x + dx, y + 1))
      .filter((t) => t !== undefined)
      .map((t) => t!);
    return air;
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
  addAir(x: number, y: number) {
    this.grid[y] = this.grid[y] ?? [];
    const tile = new Air(x, y);
    this.grid[y][x] = tile;
    this.air++;
    return tile;
  }

  getFall(x: number, y: number) {
    this.grid[y + 1] = this.grid[y + 1] ?? [];
    return [0, -1, 1].find((dx) => !this.grid[y + 1][x + dx]);
  }
  toString() {
    const pic: string[][] = [];
    const points = this.grid.flat();
    const minX = Math.min(...points.map((point) => point.x));
    const maxX = Math.max(...points.map((point) => point.x));
    const minY = Math.min(...points.map((point) => point.y));
    const maxY = Math.max(...points.map((point) => point.y));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        this.grid[y] = this.grid[y] ?? [];
        const tile: Tile | undefined = this.grid[y][x];
        pic[y] = pic[y] || [];
        pic[y][x] = tile ? tile.toString() : " ";
      }
    }
    return pic.map((line) => line.join("")).join("\n");
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
const fallingSandAirPop = (input: Cave) => {
  input.airPop(500, 0);
  console.log(`air delivered ... ${input.air}`);
  part2solution=input.air;
  let origin = input.grid[0][500];

  let current = origin;
  let sand = 0;

  while (current.y <= input.chasm && !origin.sand) {
    current = origin;

    while (current && !current.sand && current.y <= input.chasm) {
      const next = current.getFall();
      if (!next) {
        // console.log(`resting next... (${current.x}, ${current.y}) :${sand}`);
        current.sand = true;
        sand++;
        // console.log(`${input.toString()}`);
      } else {
        current = next;
      }
    }
    //
  }
  return sand;
};
let part2solution:number=0;
const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  // return fallingSand(input);
  return fallingSandAirPop(input);
};

const part2old = (rawInput: string) => {
  const input = parseInput(rawInput);
  const y = input.grid.length + 1;
  const minX = 500 - (y + 2);
  const maxX = 500 + (y + 2);
  input.draw(new Line([new Point([minX, y]), new Point([maxX, y])]));
  input.chasm = y + 1;
  return fallingSand(input);
};
const part2 = (rawInput: string) => {
  // const input = parseInput(rawInput);
  // input.airPop(500, 0);
  // return input.air;
  return part2solution;
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
        expected: 93,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  // onlyTests: true
});
