import run from "aocrunner";

type DirKey = "U" | "R" | "L" | "D";
interface DirRecord {
  key: DirKey;
  dx: number;
  dy: number;
  rKey: DirKey;
  lKey: DirKey;
  score: number;
}
interface Command {
  rotate: boolean;
  left?: boolean;
  move?: number;
}
interface Tile {
  open: boolean;
  x: number;
  y: number;
  face:number;
  adjacent: Partial<Record<DirKey, OpenTile>>;
  adjacentCubic: Partial<Record<DirKey, {tile:OpenTile, facing:DirRecord}>>;
  toString: ()=>string;
}
const directions: Record<DirKey, DirRecord> = {
  U: { key: "U", dx: 0,   dy: -1, rKey: "R", lKey: "L", score: 3 },
  R: { key: "R", dx: 1,   dy: 0,  rKey: "D", lKey: "U", score: 0 },
  L: { key: "L", dx: -1,  dy: 0,  rKey: "U", lKey: "D", score: 2 },
  D: { key: "D", dx: 0,   dy: 1,  rKey: "L", lKey: "R", score: 1 },
};


interface FaceTranslation {
  face:number;
  dir:DirKey;
  fn: (x:number, y:number, size:number)=>{x:number,y:number}
}

type FaceTranslations = {
  [key in DirKey]: FaceTranslation;
} & {
  x: number;
  y: number;
};

let faces: Record<string,FaceTranslations> = {
  "1" : {x: 2, y: 0, U: {face: 2, dir: "D", fn: (x, y, size) => ({x:size-1-x,y:0})},      R: {face: 6, dir: "L", fn: (x, y, size) => ({x:size-1,y:size-1-y})}, L: {face: 3, dir: "D", fn: (x, y, size) => ({x:y,y:0})},             D: {face: 4, dir: "D", fn: (x, y, size) => ({x, y:0})},},
  "2" : {x: 0, y: 1, U: {face: 1, dir: "D", fn: (x, y, size) => ({x:size-1-x,y:0})},      R: {face: 3, dir: "R", fn: (x, y, size) => ({x:0,y})},               L: {face: 6, dir: "U", fn: (x, y, size) => ({x:size-1-y,y:size-1})}, D: {face: 5, dir: "U", fn: (x, y, size) => ({x:size-1-x,y:size-1})}, },
  "3" : {x: 1, y: 1, U: {face: 1, dir: "R", fn: (x, y, size) => ({x:0,y:x})},             R: {face: 4, dir: "R", fn: (x, y, size) => ({x:0,y})},               L: {face: 2, dir: "L", fn: (x, y, size) => ({x:size-1,y})},          D: {face: 5, dir: "R", fn: (x, y, size) => ({x:0,y:size-1-x})},      },
  "4" : {x: 2, y: 1, U: {face: 1, dir: "U", fn: (x, y, size) => ({x,y:size-1})},          R: {face: 6, dir: "D", fn: (x, y, size) => ({x:size-1-y,y:0})},      L: {face: 3, dir: "L", fn: (x, y, size) => ({x:size-1,y})},          D: {face: 5, dir: "D", fn: (x, y, size) => ({x,y:0})},     },
  "5" : {x: 2, y: 2, U: {face: 4, dir: "U", fn: (x, y, size) => ({x,y:size-1})},          R: {face: 6, dir: "R", fn: (x, y, size) => ({x:0,y})},               L: {face: 3, dir: "U", fn: (x, y, size) => ({x:size-1-y,y:size-1})}, D: {face: 2, dir: "U", fn: (x, y, size) => ({x:size-1-x,y:size-1})}, },
  "6" : {x: 3, y: 2, U: {face: 4, dir: "L", fn: (x, y, size) => ({x:size-1,y:size-1-x})}, R: {face: 1, dir: "L", fn: (x, y, size) => ({x:size-1,y:size-1-y})}, L: {face: 5, dir: "L", fn: (x, y, size) => ({x:size-1,y})},          D: {face: 3, dir: "R", fn: (x, y, size) => ({x:0,y:size-1-x})},},
}

const faces2: Record<string,FaceTranslations> = {
  "1" : {x: 1, y: 0, U: {face: 6, dir: "R", fn: (x, y, size) => ({x:0, y:x})},      R: {face: 2, dir: "R", fn: (x, y, size) => ({x:0,      y})},          L: {face: 4, dir: "R", fn: (x, y, size) => ({x:0,      y:size-1-y})}, D: {face: 3, dir: "D", fn: (x, y, size) => ({x:x,      y:0})},        },
  "2" : {x: 2, y: 0, U: {face: 6, dir: "U", fn: (x, y, size) => ({x,   y:size-1})}, R: {face: 5, dir: "L", fn: (x, y, size) => ({x:size-1, y:size-1-y})}, L: {face: 1, dir: "L", fn: (x, y, size) => ({x:size-1, y})},          D: {face: 3, dir: "L", fn: (x, y, size) => ({x:size-1, y:x})},        },
  "3" : {x: 1, y: 1, U: {face: 1, dir: "U", fn: (x, y, size) => ({x,   y:size-1})}, R: {face: 2, dir: "U", fn: (x, y, size) => ({x:y,      y:size-1})},   L: {face: 4, dir: "D", fn: (x, y, size) => ({x:y,      y:0})},        D: {face: 5, dir: "D", fn: (x, y, size) => ({x,        y:0})},        },
  "4" : {x: 0, y: 2, U: {face: 3, dir: "R", fn: (x, y, size) => ({x:0, y:x})},      R: {face: 5, dir: "R", fn: (x, y, size) => ({x:0,      y})},          L: {face: 1, dir: "R", fn: (x, y, size) => ({x:0,      y:size-1-y})}, D: {face: 6, dir: "D", fn: (x, y, size) => ({x,        y:0})},        },
  "5" : {x: 1, y: 2, U: {face: 3, dir: "U", fn: (x, y, size) => ({x,   y:size-1})}, R: {face: 2, dir: "L", fn: (x, y, size) => ({x:size-1, y:size-1-y})}, L: {face: 4, dir: "L", fn: (x, y, size) => ({x:size-1, y})},          D: {face: 6, dir: "L", fn: (x, y, size) => ({x:size-1, y:x})},        },
  "6" : {x: 0, y: 3, U: {face: 4, dir: "U", fn: (x, y, size) => ({x,   y:size-1})}, R: {face: 5, dir: "U", fn: (x, y, size) => ({x:y,      y:size-1})},   L: {face: 1, dir: "D", fn: (x, y, size) => ({x:y,      y:0})},        D: {face: 2, dir: "D", fn: (x, y, size) => ({x,        y:0})},        }
};

const dirKeys = Object.keys(directions).map((k) => k as DirKey);

class OpenTile implements Tile {
  open: boolean;
  face: number = 0;
  x: number;
  y: number;
  adjacent: Partial<Record<DirKey, OpenTile>>;
  adjacentCubic: Partial<Record<DirKey, {tile:OpenTile, facing:DirRecord}>> = {};
  
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.open = true; 
    this.adjacent = {};
    this.adjacentCubic = {};
  }
  toString() {
    return `OPEN (${this.face + 1},${this.x},${this.y})`
  }
}

class SolidTile implements Tile {
  open: boolean;
  face: number = 0;
  x: number;
  y: number;
  adjacent: Partial<Record<DirKey, OpenTile>>;
  adjacentCubic: Partial<Record<DirKey, {tile:OpenTile, facing:DirRecord}>> = {};
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.open = false;
    this.adjacent = {};
    this.adjacentCubic = {};
  }
  toString() {
    return `SOLID (${this.face + 1},${this.x},${this.y})`
  }
}
class Player {
  constructor(public position: Tile, public facing: DirRecord) {}
  move(command: Command) {
    const facing = this.facing;
    if (command.rotate) {
      if (command.left) {
        this.facing = directions[facing.lKey]!;
      } else {
        this.facing = directions[facing.rKey]!;
      }
      return;
    }
    let steps = 1;
    let prev = this.position;
    let next: Tile | undefined = prev.adjacent[facing.key];
    while (next && steps < command.move!) {
      prev = next;
      next = prev.adjacent[facing.key];
      steps++;
    }
    this.position = next || prev;
  }
  moveCubic(command: Command) {
    let facing = this.facing;
    if (command.rotate) {
      if (command.left) {
        this.facing = directions[facing.lKey]!;
        // console.log(`${this.position.toString()} facing: ${this.facing.key} Left Turn`)
      } else {
        this.facing = directions[facing.rKey]!;
        // console.log(`${this.position.toString()} facing: ${this.facing.key} Right Turn`)
      }
      return;
    }
    // console.log(`${this.position.toString()} facing: ${this.facing.key} moving ${command.move}`)
    let steps = 1;
    let prev = {tile: this.position, facing};
    let next: {tile: Tile, facing:DirRecord} | undefined = prev.tile.adjacentCubic[facing.key];
    while (next && steps < command.move!) {
      prev = next;
      facing = next.facing;
      next = prev.tile.adjacentCubic[facing.key];
      steps++;
      // console.log(`prev ${prev.tile.toString()} next ${next && next.tile.toString()} facing: ${facing.key}`)
    }
    const destination = next || prev;
    this.position = destination.tile;
    this.facing = destination.facing;
    // console.log(`${this.position.toString()} facing: ${this.facing.key}`)
  }
  password() {
    return (
      (this.position.y + 1) * 1000 +
      (this.position.x + 1) * 4 +
      this.facing.score
    );
  }
  passwordCubic(size:number) {
    const face = faces[`${this.position.face + 1}`];
    return (
      ((face.y * size) + this.position.y + 1) * 1000 +
      ((face.x * size) + this.position.x + 1) * 4 +
      this.facing.score
    );
  }
}
class Board {
  public layout: Tile[][] = [];
  public player1: Player;
  constructor(public tiles: Tile[]) {
    tiles.forEach((t) => {
      this.layout[t.y] = this.layout[t.y] || [];
      this.layout[t.y][t.x] = t;
    });
    tiles
      .filter((t) => t.open)
      .forEach((tile) => {
        dirKeys.forEach((key) => {
          const dir = directions[key] as DirRecord;
          const neighbour = this.get(tile.x + dir.dx, tile.y + dir.dy);
          if (neighbour) {
            if (neighbour.open) {
              // its clear - carry on
              tile.adjacent[key] = neighbour as OpenTile;
            }
          } else {
            // empty space! time to wrap! (walk backwards to find the opposite edge)
            let prev = tile;
            let next = this.get(prev.x - dir.dx, prev.y - dir.dy);
            while (next) {
              prev = next!;
              next = this.get(prev.x - dir.dx, prev.y - dir.dy);
            }
            if (prev.open) {
              tile.adjacent[key] = prev  as OpenTile;
            }
          }
        });
      });

    // You begin the path in the leftmost open tile of the top row of tiles. Initially, you are facing to the right (from the perspective of how the map is drawn).
    const topRow = this.layout[0];
    const leftMostOpen = topRow.find((t) => t && t.open)!;
    this.player1 = new Player(leftMostOpen, directions["R"]);
  }
  get(x: number, y: number): Tile | undefined {
    return this.layout[y] && this.layout[y][x];
  }
}
class Left implements Command {
  rotate: boolean;
  left?: boolean | undefined;
  move?: number | undefined;
  constructor() {
    this.rotate = true;
    this.left = true;
  }
}
class Right implements Command {
  rotate: boolean;
  left?: boolean | undefined;
  move?: number | undefined;
  constructor() {
    this.rotate = true;
    this.left = false;
  }
}
class Move implements Command {
  rotate: boolean;
  left?: boolean | undefined;
  move?: number | undefined;
  constructor(move: number) {
    this.rotate = false;
    this.move = move;
  }
}


class Cube{
  public layout: Tile[][][] = [];
  public size: number;
  public player1: Player;
  constructor(
    public board:Board
  ){
    this.size = board.layout.length > 50 ? 50 : 4;

    const topRow = this.board.layout[0];
    const leftMostOpen = topRow.find((t) => t && t.open)!;
    this.player1 = new Player(leftMostOpen, directions["R"]);

    const faceKeys = Object.keys(faces);

    faceKeys.map(key=>({key, face:faces[key]})).forEach(({key, face})=>{

      const minX = face.x * this.size;
      const minY = face.y * this.size;

      const faceIdx = Number(key) - 1; 

      for (let y=minY; y < (minY + this.size); y++) {
        for (let x=minX; x < (minX + this.size); x++) {
          if (board.layout[y] && board.layout[y][x]) {
            const tile = board.layout[y][x];
            tile.face = faceIdx;
            tile.x = tile.x - minX;
            tile.y = tile.y - minY;
            this.layout[faceIdx] = this.layout[faceIdx] || [];
            this.layout[faceIdx][tile.y] = this.layout[faceIdx][tile.y] || [];
            this.layout[faceIdx][tile.y][tile.x] = tile;
          }
        }
      }
    });

    // populate adjacent open tiles
    this.board.tiles
      .filter((t) => t.open)
      .forEach((tile) => {
        dirKeys.forEach((key) => {
          let dir = directions[key] as DirRecord;
          const neighbour = this.get(tile.face!, tile.x + dir.dx, tile.y + dir.dy, dir.key);
          if (neighbour) {
            if (neighbour.tile.open) {
              // its clear - carry on
              tile.adjacentCubic[key] = {tile:neighbour.tile, facing:directions[neighbour.dir]};
            }
          } else {
            // empty space! time to wrap! (walk backwards to find the opposite edge)
            let prev = {tile, dir: dir.key};
            dir = directions[prev.dir]
            let next = this.get(prev.tile.face!, prev.tile.x - dir.dx, prev.tile.y - dir.dy, dir.key);
            while (next) {
              prev = next!;
              dir = directions[prev.dir]
              next = this.get(prev.tile.face!, prev.tile.x - dir.dx, prev.tile.y - dir.dy, dir.key);
            }
            if (prev.tile.open) {
              tile.adjacentCubic[key] = {tile:prev.tile as OpenTile, facing: dir};
            }
          }
        });
      });
  }
  get(face:number, x:number, y:number, dir:DirKey) {
    if ((x<0) || (x >= this.size) || (y < 0) || (y >= this.size) ) {
      let faceTranslation = faces[`${face + 1}`][dir];
      const faceCoord = faceTranslation.fn(x,y,this.size);
      const faceIdx = faceTranslation.face - 1;
      const tile = this.layout[faceIdx] && this.layout[faceIdx][faceCoord.y] && this.layout[faceIdx][faceCoord.y][faceCoord.x];
      return tile ? {tile, dir: faceTranslation.dir} : undefined;
    } else {
      // in range ... 
      const tile = this.layout[face] && this.layout[face][y] && this.layout[face][y][x];
      return tile ? {tile, dir} : undefined;
    }
  }
}
const parseInput = (rawInput: string) => {
  const [mapInput, commandInput] = rawInput
    .replace(/\r\n/g, "\n")
    .split(/\n\n/g);

  // hack the issue with the test runner banjaxing whitespace at the start of the input.
  const lines = mapInput.split(/\n/g);
  const line0Start = lines[0].split("").map((c,i)=>(c==="." || c=== "#")?i:undefined).find(x=>x!==undefined)!;
  const line1Start = lines[1].split("").map((c,i)=>(c==="." || c=== "#")?i:undefined).find(x=>x!==undefined)!;
  if (line0Start < line1Start) {
    const pad = " ".repeat(line1Start-line0Start);
    lines[0] = pad + lines[0];
  }
  
  const board = new Board(
    lines
      .map((line, y) =>
        line.split("").map((char, x) => {
          switch (char) {
            case " ":
              return undefined;
            case ".":
              return new OpenTile(x, y);
            case "#":
              return new SolidTile(x, y);
          }
        }),
      )
      .flat()
      .filter((x) => !!x)
      .map((x) => x as Tile),
  );
  const regex = /(\d+)|([RL])/gm;

  // Alternative syntax using RegExp constructor
  // const regex = new RegExp('(\\d+)|([RL])', 'gm')

  const str = commandInput;
  let m;
  const commands: Command[] = [];
  while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
      if (groupIndex === 0) {
        // console.log(`Found match, group ${groupIndex}: ${match}`);
        switch (match) {
          case "L":
            commands.push(new Left());
            break;
          case "R":
            commands.push(new Right());
            break;
          default:
            commands.push(new Move(Number(match)));
            break;
        }
      }
    });
  }
  return {board, commands};
};

const part1 = (rawInput: string) => {
  const {board, commands} = parseInput(rawInput);
  commands.forEach(command => board.player1.move(command));
  return (board as Board).player1.password();
};

const part2 = (rawInput: string) => {
  
  const {board, commands} = parseInput(rawInput);
  if (board.layout.length > 100) {
    faces = faces2;
  }
  const cube = new Cube(board);

  commands.forEach((command) => cube.player1.moveCubic(command));
  return cube.player1.passwordCubic(cube.size);
// Part 2:
// Status: WRONG ANSWER
// 
// That's not the right answer; your answer is too high.  If you're stuck, make sure you're using the full input data; there are also some general tips on the about page,
//  or you can ask for hints on the subreddit.  Please wait one minute before trying again. (You guessed 42484.)
};

const testInput = `        ...#
        .#..
        #...
        ....
...#.......#
........#...
..#....#....
..........#.
        ...#....
        .....#..
        .#......
        ......#.

10R5L5R10L4R5L5`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 6032,
      },
    ],
    solution: part1, 
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 5031,
      },
    ],
    solution: part2,
  },
  // trimTestInputs: true,
  // onlyTests: true,
});
