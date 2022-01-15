import run from "aocrunner";
const debug = false;
const unique = <T extends Object>(value: T, index: number, self: T[]) => {
  var first = self.findIndex((p) => p.toString() === value.toString());
  return first === index;
};
var Reset = "\x1b[0m";
var Bright = "\x1b[1m";
var FgRed = "\x1b[31m";

const toKey = (x: number, y: number): string => {
  return `(${x},${y})`;
};
const numToRightJustifiedString = (num: number, length: number): string => {
  var s = num.toString(10);

  return s.padStart(length, " ");
};

class Point {
  public iteration: number = 0;
  public leastCost: number = Number.MAX_VALUE;
  public lowestCostNeighbour?: Point;
  public neighbours: Point[] = [];
  constructor(public value: number, public x: number, public y: number) {}

  public clone(): Point {
    return new Point(this.value, this.x, this.y);
  }

  public toString(): string {
    return toKey(this.x, this.y);
  }
}

class Route {
  public cost: number;
  constructor(public route: Point[]) {
    this.cost = route.reduce(
      (p: number, c, i) => p + (i === 0 ? 0 : c.value),
      0,
    );
  }

  public clone(): Route {
    return new Route(this.route.map((p) => p.clone()));
  }
}
type Points = { [key: string]: { point: Point } };
const adjacent = [-1, 0, 1];
const beside = adjacent
  .map((x) => adjacent.map((y) => ({ dx: x, dy: y })))
  .flatMap((a) => a)
  .filter((a) => a.dx | a.dy) // remove centre
  .filter((a) => Math.abs(a.dx) ^ Math.abs(a.dy)); // remove diagonals

const shortest = (point: Point): Point[] => {
  if (point.lowestCostNeighbour) {
    return [point, ...shortest(point.lowestCostNeighbour!)];
  } else {
    return [point];
  }
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
let start = now();
let started = now();

// Returns time elapsed since `beginning`
// (and, optionally, prints the duration in seconds)
const elapsed = (beginning: number = start, log: boolean = false) => {
  const duration = new Date().getTime() - beginning;
  if (log && debug) {
    console.log(`${duration / 1000}s`);
  }
  return duration;
};

class Puzzle {
  public pointMap: Points = {};
  public start: Point;
  public destination: Point;
  public grid: Point[][];

  constructor(public points: Point[]) {
    elapsed(start, true);
    start = now("mapping");
    // this.pointMap = this.points.reduce((p, c) => ({ ...p, [c.toString()]: { point: c } }), {}); 35 seconds!

    this.points.forEach((c) => {
      this.pointMap[c.toString()] = { point: c };
    });
    elapsed(start, true);
    start = now("grid");
    this.start = this.pointMap[toKey(0, 0)].point;
    var maxX = 0,
      maxY = 0;
    for (var point of this.points) {
      if (point.x > maxX) {
        maxX = point.x;
      }
      if (point.y > maxY) {
        maxY = point.y;
      }
    }

    const destinationKey = toKey(maxX, maxY);
    this.destination = this.pointMap[destinationKey].point;
    this.grid = [];
    for (var y = 0; y < this.destination.y + 1; y++) {
      this.grid[y] = [];
      for (var x = 0; x < this.destination.x + 1; x++) {
        this.grid[y][x] = this.pointMap[toKey(x, y)].point;
      }
    }
    elapsed(start, true);
    start = now("neighbours");

    this.points.forEach((point) => {
      point.neighbours = beside
        .map(
          ({ dx, dy }) =>
            this.pointMap[toKey(point.x + dx, point.y + dy)]?.point,
        )
        .filter((a) => !!a);
    });
    elapsed(start, true);
  }

  public solve(): number {
    // Inputs: cost field raster, source location, destination location (most implementations can solve for multiple sources and destinations simultaneously)

    // Accumulation: Starting at the source location compute the lowest total cost needed to reach every other cell in the grid.
    // Although there are several algorithms, such as those published by Eastman and Douglas,[8][9] they generally follow a similar strategy.[13]
    //  This process also creates, as an important byproduct, a second raster grid usually called the backlink grid (Esri) or movement direction grid (GRASS),
    //   in which each cell has a direction code (0-7) representing which of its eight neighbors had the lowest cost.
    // Find a cell that is adjacent to at least one cell that already has an accumulated cost assigned (initially, this is only the source cell)
    // Determine which neighbor has the lowest accumulated cost. Encode the direction from the target to the lowest-cost neighbor in the backlink grid.
    // Add the cost of the target cell (or an average of the costs of the target and neighbor cells) to the neighbor accumulated cost,
    // to create the accumulated cost of the target cell. If the neighbor is diagonal, the local cost is multiplied by √2
    // The algorithm must also take into account that indirect routes may have lower cost, often using a hash table to keep track of temporary cost values along the
    // expanding fringe of computation that can be reconsidered.
    // Repeat the procedure until all cells are assigned.

    // work from the start to the end assigning initial costs
    this.start.leastCost = 0;
    this.start.iteration = 1;
    // this.assignCostsToNeighbours(this.start)

    // work from the destination to the start and attempt to reduce journey cost

    var iteration = 2;
    var changed = 1;
    while (changed && iteration < 150) {
      start = now(`iteration ${iteration}`);
      changed = this.points
        .map((a) => this.reducedCostJourney(a, iteration))
        .reduce((p, c) => p + c, 0);

      // console.log(`iteration ${iteration} changed: ${changed} shortest is ${this.destination.leastCost}`);
      iteration++;
      elapsed(start, debug);
    }
    // console.log(this.toDots());
    // Find a cell that is adjacent to at least one cell that already has an accumulated cost assigned (initially, this is only the source cell)
    // Determine which neighbor has the lowest accumulated cost. Encode the direction from the target to the lowest-cost neighbor in the backlink grid.
    // Add the cost of the target cell (or an average of the costs of the target and neighbor cells) to the neighbor accumulated cost, to create the accumulated cost of the target cell. If the neighbor is diagonal, the local cost is multiplied by √2
    // The algorithm must also take into account that indirect routes may have lower cost, often using a hash table to keep track of temporary cost values along the expanding fringe of computation that can be reconsidered.
    // Repeat the procedure until all cells are assigned.

    elapsed(started, debug);
    return this.destination.leastCost;
  }
  reducedCostJourney(point: Point, iteration: number): number {
    var leastCost = Math.min(...point.neighbours.map((a) => a.leastCost || 0));
    point.iteration = iteration;
    var changed = 0;
    if (leastCost + point.value < point.leastCost) {
      point.lowestCostNeighbour = point.neighbours.filter(
        (a) => a.leastCost === leastCost,
      )[0];
      point.leastCost = leastCost + point.value;
      changed++;
    }
    return changed;
  }
  // assignCostsToNeighbours(point: Point) {
  //     point.neighbours.filter(a=>a.iteration===0).forEach(a=>{
  //         a.leastCost= point.leastCost + a.value;
  //         a.iteration = 1;
  //         this.assignCostsToNeighbours(a);
  //     })
  // }
  toString(): string {
    var result = "\n";

    var short = shortest(this.destination);

    for (var y = 0; y < this.destination.y + 1; y++) {
      for (var x = 0; x < this.destination.x + 1; x++) {
        var point = this.pointMap[toKey(x, y)].point;
        var cell =
          numToRightJustifiedString(point.leastCost ?? 0, 4) +
          ` (${numToRightJustifiedString(point.value, 1)})`;
        if (short.includes(point)) {
          cell = `${Bright}${FgRed}${cell}${Reset}`;
        }
        result += cell;
      }
      result += "\n";
    }
    return result;
  }
  toDots(): string {
    var result = "\n";

    var short = shortest(this.destination);

    for (var y = 0; y < this.destination.y + 1; y++) {
      for (var x = 0; x < this.destination.x + 1; x++) {
        var point = this.pointMap[toKey(x, y)].point;
        var cell = " ";
        if (short.includes(point)) {
          cell = `${Bright}${FgRed}${point.value}${Reset}`;
        }
        result += cell;
      }
      result += "\n";
    }
    return result;
  }
}
const bumped: { [idx: number]: number } = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 1,
  11: 2,
  12: 3,
  13: 4,
  14: 5,
  15: 6,
  16: 7,
  17: 8,
  18: 9,
};

const parseInput = (rawInput: string) => {
  var points = rawInput
    .replace(/\r\n/g, "\n")
    .split(/\n/g)
    .map((a, y) =>
      a
        .split("")
        .map((a) => parseInt(a))
        .map((a, x) => new Point(a, x, y)),
    )
    .flatMap((a) => a);

  var puzzle = new Puzzle(points);

  return puzzle;
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return input.solve();
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  var width = input.destination.x + 1;
  var height = input.destination.y + 1;
  var points2 = [
    [0, 1, 2, 3, 4],
    [1, 2, 3, 4, 5],
    [2, 3, 4, 5, 6],
    [3, 4, 5, 6, 7],
    [4, 5, 6, 7, 8],
  ]
    .map((row, mY) =>
      row
        .map((bump, mX) =>
          input.points.map(
            (point) =>
              new Point(
                bumped[point.value + bump],
                point.x + mX * width,
                point.y + mY * height,
              ),
          ),
        )
        .flatMap((a) => a),
    )
    .flatMap((a) => a);

  var puzzle2 = new Puzzle(points2);
  return puzzle2.solve();
};

const testInput = `
1163751742
1381373672
2136511328
3694931569
7463417111
1319128137
1359912421
3125421639
1293138521
2311944581`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 40,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 315,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
