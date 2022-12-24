import run from "aocrunner";
type DirKey = "^" | ">" | "<" | "v" | ".";
interface DirRecord {
  key: DirKey;
  dx: number;
  dy: number;
}

interface ITile {
  open: boolean;
  x: number;
  y: number;
  adjacent?: Partial<Record<DirKey, ITile>>; // this gets set up once and doesnt change
  adjacentBlizzard?: Partial<Record<DirKey, OpenTile>>; // this gets set up once and doesnt change
  adjacentMovement: Partial<Record<DirKey, {tile:OpenTile, facing:DirRecord}>>; // this changes every minute
  toString: ()=>string;
  clone: ()=>ITile;
}
const isOpenTile = (tile: ITile| undefined): tile is OpenTile => {
  return !!(tile && tile.open);
}
const isWall = (tile: ITile): tile is Wall => {
  return !tile.open;
}

class Tile implements ITile{
  constructor(
    public x: number,
    public y: number,
    public open: boolean,
  ){}

  adjacent?: Partial<Record<DirKey, ITile>> | undefined;
  adjacentBlizzard?: Partial<Record<DirKey, OpenTile>> | undefined;
  adjacentMovement: Partial<Record<DirKey, { tile: OpenTile; facing: DirRecord; }>> ={};

  toString():string {
    throw new Error("not implemented");
  };
  clone():ITile {
    throw new Error("not implemented");
  }
}
class OpenTile extends Tile {
  tmpBlizzards: Blizzard[] = [];
  public blizzards: Blizzard[] = [];
  constructor(
    x: number, 
    y: number, 
  ) {
    super(x, y, true);
  }
  toString() {
    return `.(${this.x},${this.y})`
  }
  clone(){
    const tile: OpenTile = new OpenTile(this.x, this.y);
    tile.blizzards = this.blizzards.map(b=>new Blizzard(tile, b.direction));
    tile.adjacent = this.adjacent;
    tile.adjacentBlizzard = this.adjacentBlizzard;
    tile.adjacentMovement = {};
    return tile;
  }

}
class Wall extends Tile {
  
  constructor(x: number, y: number) {
    super(x, y, false);
  }
  toString() {
    return `#(${this.x},${this.y})`
  }
  clone() {
    // don't need to copy walls... 
    return this;
  }

}
class Blizzard {  
  constructor(
    public tile: ITile,
    public direction: DirKey
  ) {
  }
  toString() {
    return `${this.tile.toString()} ${this.direction}`
  }
}

const directions: Record<DirKey, DirRecord> = {
  "^": { key: "^", dx: 0,  dy: -1},
  ">": { key: ">", dx: 1,  dy: 0},
  "<": { key: "<", dx: -1, dy: 0},
  "v": { key: "v", dx: 0,  dy: 1},
  ".": { key: ".", dx: 0,  dy: 0}, // wait
};

const dirKeys = Object.keys(directions).map(k => k as DirKey);

const parseInput = (rawInput: string) => {
  const blizzards : Blizzard[] = [];
  const tiles: ITile[][] = rawInput.replace(/\r\n/g, "\n").split(/\n/g).map((line,y)=>line.split("").map((char,x)=>{
    switch (char) {
      case "#":
        return new Wall(x, y);
      case ".":
        return new OpenTile(x, y);
      case "^":
      case "v":
      case "<":
      case ">":
        const tile:OpenTile = new OpenTile(x, y);
        const blizzard = new Blizzard(tile, char as DirKey);
        tile.blizzards = [blizzard];
        blizzards.push(blizzard);
        return tile;
      default:
        throw new Error(`unrecognized char at x:${x} y:${y} : ${char} `);
    }
  }));
  return {tiles, blizzards}
};
class Board {
  public start: ITile;
  public end: ITile;
  public open: OpenTile[] =[];
  constructor(
    public tiles: ITile[][]
  ) {
    // start tile is first open tile in first row.
    this.start = this.tiles[0].find(t => t.open)!;
    
    // end tile is first open tile in last row.
    this.end = this.tiles[this.tiles.length - 1].find(t => t.open)!;
    
    // setup a shortcut to all open tiles.
    this.open = this.tiles
      .flat()
      .filter(tile=>isOpenTile(tile))
      .map(tile=>(tile as OpenTile));

    // what is actually next to each tile.
    tiles.flat().forEach(tile=>{
      tile.adjacent=dirKeys
        .map(key=>directions[key])
        .map(direction=>({key: direction.key, tile: this.get(tile.x + direction.dx, tile.y + direction.dy)}))
        .filter(dir=>dir.tile !== undefined)
        .reduce((prev: Partial<Record<DirKey, ITile>>, dir) => {
          prev[dir.key] = dir.tile!;
          return prev;
        },{});
    });

    // if a blizzard is moving where can it go next?
    tiles.flat()
    .filter(tile => tile.open)
    .forEach(tile=>{
      tile.adjacentBlizzard=dirKeys
        .map(key=>(({dir:directions[key], tile: tile.adjacent![key]})))
        .filter(adj => !!adj.tile)
        .reduce((prev: Partial<Record<DirKey, OpenTile>>, adj) => {
          if (isOpenTile(adj.tile)) {
            prev[adj.dir.key] = adj.tile as OpenTile;
          } else {
            // we hit a wall
            // walk backwards till we hit another wall... (or start or end)
            let p = adj.tile!;
            let n = this.get(p.x - adj.dir.dx, p.y - adj.dir.dy);
            while (n && n.open && n !== this.start && n !== this.end) {
              p = n;
              n = this.get(p.x - adj.dir.dx, p.y - adj.dir.dy);
            }
            prev[adj.dir.key] = p as OpenTile;
          }
          return prev;
        },{})
    });


  }

  get(x:number, y:number) {
    if (x < 0 || y < 0 || y >= this.tiles.length || x > this.tiles[y].length) {
      return undefined;
    }
    return this.tiles[y] && this.tiles[y][x];
  }

  theWindBloweth() {
    this.open.forEach(tile => tile.tmpBlizzards=[]);
    
    this.open
    .filter(tile => tile.blizzards.length > 0)
    .forEach(tile => tile.blizzards.forEach(blizzard=>{
      const next = tile.adjacentBlizzard![blizzard.direction]!;
       blizzard.tile = next;
       next.tmpBlizzards.push(blizzard);
    }));
    
    this.open.forEach(tile => tile.blizzards=tile.tmpBlizzards);
    this.open.forEach(tile => tile.tmpBlizzards=[]);
  }

  checkMovement(){
    this.open.forEach(tile => {
      tile.adjacentMovement = {};
      dirKeys
        .map(key=>({dir:directions[key], tile:tile.adjacent![key]}))
        .filter(adj => isOpenTile(adj.tile!))
        .map(adj=>({dir:adj.dir, tile: adj.tile as OpenTile}))
        .forEach(adj=>{
          if (!adj.tile.blizzards.length) {
            tile.adjacentMovement[adj.dir.key] = {tile: adj.tile, facing: adj.dir};
          }
        })
    })
  }

  clone() {
    const board = new Board(this.tiles.map(row=>row.map(tile=>tile.clone())));
    board.start = board.tiles[this.start.y][this.start.x];
    board.end = board.tiles[this.end.y][this.end.x];
    return board;
  }

}
const nextBoard = (previous: Board) => {
  const next = previous.clone();
  next.theWindBloweth();
  next.checkMovement();
  return next;
}
const part1 = (rawInput: string) => {
  const {tiles, blizzards} = parseInput(rawInput);
  const board = new Board(tiles);
  
  const boards: Board[] = [board];
  boards.push(nextBoard(board));

  const position = board.start;





  return 0;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return 0;
};

const testInput = `
#.######
#>>.<^<#
#.<..<<#
#>v.><>#
#<^v^^>#
######.#
`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 18,
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
  onlyTests: true,
});
