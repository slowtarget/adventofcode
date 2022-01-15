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

var debug = false;
const log = (...arg: any[]) => {
  if (debug) {
    console.log("", ...arg);
  }
};
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
  if (eventName) {
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
  if (log) {
    console.log(`${duration / 1000}s`);
  }
  return duration;
};
class Coord {
  constructor(public x: number, public y: number) {}
  inRoom() {
    return this.y > 1;
  }
}
class AmphipodType {
  constructor(
    public char: string,
    public cost: number,
    public roomAt: number,
  ) {}
}
class Character {
  constructor(
    public position: Cell,
    public type: AmphipodType,
    public homeLevels: number[],
  ) {}
  isHome() {
    if (!this.position) {
      throw new Error("no position set");
    }
    return (
      this.position.x === this.type.roomAt &&
      (this.position.y === this.homeLevels[0] || this.compatriotBelow())
    );
  }

  compatriotBelow() {
    if (!this.position) {
      throw new Error("no position set");
    }
    var position = this.position;
    return this.position.neighbours
      .filter((n) => n.x === position.x)
      .filter((n) => n.y === position.y + 1)
      .some((n) => n.char === this.type.char);
  }
  moves() {
    if (this.isHome()) {
      return [];
    }

    var homeCells = this.homeLevels
      .map((y) => key(this.type.roomAt, y))
      .map((k) => this.position.cellMap[k])
      .filter((cell) => cell.char === this.type.char || cell.isEmpty());
    var homeAvailable = homeCells.length === this.homeLevels.length;
    var home: Cell | undefined = undefined;
    if (homeAvailable) {
      // if all home cells are available - then we don't want to stop on the first one.
      home = homeCells.filter((cell) => cell.isEmpty())[0];
    }
    var canStepTo: { cell: Cell; moves: number }[] = this.position.moveForward(
      this.position,
      0,
    );

    if (this.position.y === 1) {
      // if in the hall then we can only go to our room.
      return canStepTo.filter((move) => move.cell === home);
    }
    return canStepTo
      .filter((move) => move.cell.y === 1 || (move.cell.y > 1 && homeAvailable))
      .filter(
        (move) =>
          move.cell.y > 1 || (move.cell.y === 1 && !move.cell.isOutsideRoom()),
      )
      .filter((move) => move.cell.y === 1 || move.cell.x === this.type.roomAt)
      .filter(
        (move) => move.cell.y === 1 || (move.cell.y > 1 && move.cell === home),
      );
  }
}
class Cell {
  public neighbours: Cell[] = [];
  public cellMap: { [key: string]: Cell } = {};
  public outsideRoom: boolean = false;
  constructor(public x: number, public y: number, public char: string) {}
  isWall() {
    return this.char === "#";
  }
  isHall() {
    return this.char !== "#" && this.y === 1;
  }
  isOutsideRoom() {
    return this.outsideRoom;
  }
  isEmpty() {
    return this.char === ".";
  }
  isCharacter() {
    return "ABCD".indexOf(this.char) !== -1;
  }
  getKey() {
    return key(this.x, this.y);
  }
  moveForward(from: Cell, moves: number): { cell: Cell; moves: number }[] {
    return this.steps(from)
      .map((cell) => {
        return [
          { cell, moves: moves + 1 },
          ...cell.moveForward(this, moves + 1),
        ];
      })
      .flatMap((a) => a);
  }
  steps(from: Cell): Cell[] {
    return this.neighbours
      .filter((n) => n.isEmpty())
      .filter((n) => from.x != n.x || from.y != n.y);
  }
}
const key = (x: number, y: number) => `${x},${y}`;
const sides = [-1, 1];
const adjacent: { dx: number; dy: number }[] = sides
  .map((dx) => ({ dx, dy: 0 }))
  .concat(sides.map((dy) => ({ dx: 0, dy })));
class Game {
  // #############
  // #.....D.....#
  // ###.#B#C#D###
  //   #A#B#C#A#
  //   #########

  // #############
  // #12.3.4.5.67#
  // ###C#A#B#D###
  //   #C#A#D#B#
  //   #########
  public homeLevels;
  public amph: Character[] = [];
  constructor(public state: string[], public cost: number = 0) {
    var cells = state
      .map((line, y) => line.split("").map((char, x) => new Cell(x, y, char)))
      .flatMap((a) => a);
    var xRooms: number[] = state[2]
      .split("")
      .map((c, x) => ({ c, x }))
      .filter(({ c }) => c !== "#")
      .map(({ x }) => x);

    this.homeLevels = [];
    for (var y = state.length - 1; y > 1; y--) {
      if (state[y][xRooms[0]] !== "#") {
        this.homeLevels.push(y);
      }
    }

    var cellMap: { [key: string]: Cell } = {};
    cells.forEach((cell) => {
      cellMap[cell.getKey()] = cell;
      cell.cellMap = cellMap;
      if (cell.y === 1 && xRooms.includes(cell.x)) {
        cell.outsideRoom = true;
      }
    });
    cells
      .filter((cell) => !cell.isWall())
      .forEach((cell) => {
        cell.neighbours = adjacent
          .map((adj) => key(cell.x + adj.dx, cell.y + adj.dy))
          .map((k) => cellMap[k])
          .filter((n) => !!n && !n.isWall());
      });
    var costs = [1, 10, 100, 1000];
    var amphMap: { [key: string]: AmphipodType } = {};
    "ABCD"
      .split("")
      .map((a, i) => ({ amph: a, cost: costs[i], roomAt: xRooms[i] }))
      .forEach((a) => {
        amphMap[a.amph] = new AmphipodType(a.amph, a.cost, a.roomAt);
      });
    this.amph = cells
      .filter((cell) => cell.isCharacter())
      .map((cell) => new Character(cell, amphMap[cell.char], this.homeLevels));
  }

  public getState() {
    var output: string[][] = this.state.map((line) =>
      line.split("").map((char) => ("ABCD".indexOf(char) !== -1 ? "." : char)),
    );
    this.amph.forEach((a) => {
      // console.log(a.position.y,a.position.y,a.type.char);
      output[a.position.y][a.position.x] = a.type.char;
    });
    return output.map((line) => line.join(""));
  }

  public move(x: number, y: number, toX: number, toY: number) {
    // identify the character at x,y
    var moving = this.amph.find(
      (character) => character.position.x === x && character.position.y === y,
    );
    if (!moving) {
      throw new Error("having trouble moving #1");
    }
    // identify the cell at toX,toY
    var destination = moving.position.cellMap[key(toX, toY)];
    if (!destination) {
      throw new Error("having trouble moving #2");
    }
    // move it
    moving.position.char = ".";
    moving.position = destination;
    destination.char = moving.type.char;
  }
}
type Move = {
  cell: Cell;
  moves: number;
  cost: number;
  character: Character;
};
const keyFromState = (state: string[]): string =>
  state.join("-").replace(/[#,\s]/g, "");

class Puzzle {
  private games: {
    [key: string]: {
      game: string[];
      cost: number;
      resolved: boolean;
      previous: string[] | undefined;
    };
  } = {};
  constructor(public input: Game) {
    var state = input.getState();
    var k: string;
    this.games[keyFromState(state)] = {
      game: input.getState(),
      cost: 0,
      resolved: false,
      previous: undefined,
    };
  }
  public solve() {
    var gamesSolved = 0;
    var minCost = Number.MAX_SAFE_INTEGER;
    var winningKey =
      "-...........-" + "ABCD-".repeat(this.input.homeLevels.length);
    var solved = false;
    var found = 0;
    while (!solved) {
      solved = true;
      const used = process.memoryUsage().heapUsed / 1024 / 1024;
      console.log(
        `${(elapsed() / 1000).toFixed(3).toString().padStart(10)}s ${(
          Math.round(used * 100) / 100
        )
          .toFixed(2)
          .padStart(8)} MB` +
          ` ${Object.values(this.games)
            .length.toString()
            .padStart(8)} games ${found.toString().padStart(7)} new` +
          ` solved: ${gamesSolved.toString().padStart(5)} minCost ${minCost
            .toString()
            .padStart(8)}`,
      );
      found = 0;
      for (var state of Object.values(this.games)) {
        if (!state.resolved) {
          state.resolved = true;
          // console.log(currentGameState.join("\n"));
          var currentGame = new Game(state.game, state.cost);
          var solvedCurrent = true;
          var allMoves: Move[] = currentGame.amph
            .map((a) =>
              a.moves().map((m) => ({
                cell: m.cell,
                moves: m.moves,
                cost: m.moves * a.type.cost,
                character: a,
              })),
            )
            .flatMap((x) => x);
          allMoves.forEach((move) => {
            solved = false;
            solvedCurrent = false;
            var newGame = new Game(state.game, state.cost + move.cost);
            newGame.move(
              move.character.position.x,
              move.character.position.y,
              move.cell.x,
              move.cell.y,
            );
            var newGameState = newGame.getState();
            k = keyFromState(newGameState);
            if (this.games[k]) {
              if (this.games[k].cost > newGame.cost) {
                this.games[k].cost = newGame.cost;
                this.games[k].previous = state.game;
              }
            } else {
              found++;
              this.games[k] = {
                game: newGameState,
                cost: newGame.cost,
                resolved: false,
                previous: state.game,
              };
            }
            if (k === winningKey) {
              gamesSolved++;
              minCost = Math.min(minCost, newGame.cost);
            }
          });
        }
      }
    }
    var keys = Object.keys(this.games);
    keys.sort();
    var primary = keys[0];
    // -...........-ABCD-ABCD-ABCD-ABCD-
    var moves: {
      game: string[];
      cost: number;
      resolved: boolean;
      previous: string[] | undefined;
    }[] = [];
    var winner = this.games[primary];
    moves.push(winner);
    var previous = winner.previous;
    while (previous) {
      var k = keyFromState(previous);
      winner = this.games[k];
      moves.push(winner);
      previous = winner.previous;
    }
    moves.reverse();
    var previousCost: number = 0;
    var newCost: number;
    for (var move of moves) {
      newCost = move.cost - previousCost;
      console.log(
        `${keyFromState(move.game)} + ${newCost
          .toFixed(0)
          .padStart(4)} = ${move.cost.toFixed(0).padStart(6)}\n${move.game.join(
          "\n",
        )}\n`,
      );
      previousCost = move.cost;
    }

    return this.games[primary].cost;
  }
}

const parseInput = (rawInput: string) => {
  var lines = rawInput.replace(/\r\n/g, "\n").split(/\n/g);

  return new Puzzle(new Game([...lines]));
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return input.solve();
};

const part2 = (rawInput: string) => {
  const revision = ["  #D#C#B#A#", "  #D#B#A#C#"];

  const input = parseInput(rawInput).input.state;
  const revisedPuzzle = [...input.slice(0, 3), ...revision, ...input.slice(3)];
  return new Puzzle(new Game(revisedPuzzle)).solve();
};

const testInput = `
#############
#...........#
###A#B#C#D###
  #A#B#C#D#
  #########`;

const testInput2 = `
  #############
  #...........#
  ###B#C#B#D###
    #A#D#C#A#
    #########`;

run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 0,
      },
      {
        input: testInput2,
        expected: 12521,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput2,
        expected: 44169,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
