import run from "aocrunner";

var debug = false;

interface Cuke { type: string, in: Cell, blocked: boolean, look: () => void, move: () => void }
class South implements Cuke {
  public type: string = 'v';
  public in: Cell = new Cell(-1, -1, undefined);
  public blocked = true;
  public look() {
    this.blocked = !this.in.south!.isEmpty();
  }
  public move() {
    this.in.c = undefined;
    this.in.south!.c = this;
    this.in = this.in.south!;
  }
}
class East implements Cuke {
  public type: string = '>';
  public in: Cell = undefinedCell;
  public blocked = true;
  public look() {
    this.blocked = !this.in.east!.isEmpty();
  }
  public move() {
    this.in.c = undefined;
    this.in.east!.c = this;
    this.in = this.in.east!;
  }
}
class Cell {
  public south?: Cell;
  public east?: Cell;
  constructor(
    public x: number,
    public y: number,
    public c: Cuke | undefined
  ) {
    if (this.c) {
      this.c.in = this;
    }
  }
  isEmpty() {
    return this.c === undefined;
  }
}

const undefinedCell = new Cell(-1, -1, undefined)

const parseInput = (rawInput: string) => {
  var easts: East[] = [];
  var souths: South[] = [];

  var grid = rawInput
    .replace(/\r\n/g, '\n')
    .split(/\n/g)
    .map((line, y) => line.split('').map((char, x) => {
      var character: Cuke | undefined = undefined;
      switch (char) {
        case '.': break;
        case '>': character = new East(); easts.push(character); break;
        case 'v': character = new South(); souths.push(character); break;
      }
      return new Cell(x, y, character);
    }));
  var width = grid[0].length;
  var height = grid.length;

  grid.forEach((line, y) => line.forEach((cell, x) => {
    cell.east = grid[y][(x + 1) % width];
    cell.south = grid[(y + 1) % height][x];
  }))

  return { easts, souths };

}

const part1 = (rawInput: string) => {
  const { easts, souths } = parseInput(rawInput);
  var moved = true;
  var moves = 0;
  while (moved) {

    moved = false;
    [easts, souths].forEach(cukes => {
      // look
      cukes.forEach(cuke => cuke.look());
      // then move
      cukes.filter(cuke => !cuke.blocked).forEach(cuke => { moved = true; cuke.move(); })
    });
    moves++;
  }
  return moves;
};

const part2 = (rawInput: string) => {
  // const input = parseInput(rawInput);

  return 0;
};

const testInput = `
v...>>.vv>
.vv>>.vv..
>>.>v>...v
>>v>>.>.v.
v>v.vv.v..
>.>>..v...
.vv..>.>v.
v.v..>>v.v
....v..v.>`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 58,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [

    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
