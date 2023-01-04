import run from "aocrunner";
type DirKey = "^" | ">" | "<" | "v" | ".";
interface DirRecord {
  key: DirKey;
  dx: number;
  dy: number;
}

const directions: Record<DirKey, DirRecord> = {
  "^": { key: "^", dx: 0,  dy: -1},
  ">": { key: ">", dx: 1,  dy: 0},
  "<": { key: "<", dx: -1, dy: 0},
  "v": { key: "v", dx: 0,  dy: 1},
  ".": { key: ".", dx: 0,  dy: 0}, // wait
};

const dirKeys = Object.keys(directions).map(k => k as DirKey);
class Point{
  public adjacent: Partial<Record<DirKey, Point>> = {};
  public wrapping: Partial<Record<DirKey, Point>> = {};
  destinationManhatten: number = Infinity;
  constructor(
    public x: number,
    public y: number
  ) {}

  manhatten(other: Point) {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
  }

  toString() {
    return `(${this.x},${this.y})`
  }
}
interface ITile {
  open: boolean;
  location: Point;
  cost: number;
  visited: boolean;
  
  moves: Partial<Record<DirKey, {tile:OpenTile, facing:DirRecord}>>; // this changes every minute
  toString: () => string;
  clone: () => ITile;
}
const isOpenTile = (tile: ITile| undefined): tile is OpenTile => {
  return !!(tile && tile.open);
}
const isWall = (tile: ITile): tile is Wall => {
  return !tile.open;
}

class Tile implements ITile{
  public cost: number = Infinity;
  public from?: ITile;
  public visited: boolean = false;
  moves: Partial<Record<DirKey, { tile: OpenTile; facing: DirRecord; }>> ={};
  
  constructor(
    public location: Point,
    public open: boolean,
  ){}

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
    location: Point, 
  ) {
    super(location, true);
  }
  toString() {
    return `.${this.location.toString()}`
  }
  clone(){
    const tile: OpenTile = new OpenTile(this.location);
    tile.blizzards = this.blizzards.map(b=>new Blizzard(tile, b.direction));
    tile.moves = {};
    return tile;
  }

}
class Wall extends Tile {
  
  constructor(
    location: Point
  ) {
    super(location, false);
  }

  toString() {
    return `#${this.location.toString()}`
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
    return `${this.direction}${this.tile.location.toString()}`
  }
}

const parseInput = (rawInput: string) => {
  const blizzards : Blizzard[] = [];
  const tiles: ITile[][] = rawInput.replace(/\r\n/g, "\n").split(/\n/g).map((line,y)=>line.split("").map((char,x)=>{
    switch (char) {
      case "#":
        return new Wall(new Point(x, y));
      case ".":
        return new OpenTile(new Point(x, y));
      case "^":
      case "v":
      case "<":
      case ">":
        const tile:OpenTile = new OpenTile(new Point(x, y));
        const blizzard = new Blizzard(tile, char as DirKey);
        tile.blizzards = [blizzard];
        blizzards.push(blizzard);
        return tile;
      default:
        throw new Error(`unrecognized char at x:${x} y:${y} : ${char} `);
    }
  }));

  const get = (x: number, y: number): ITile | undefined => {
    if (x < 0 || y < 0 || y >= tiles.length || x > tiles[y].length) {
      return undefined;
    }
    return tiles[y] && tiles[y][x];
  } 
    // what is actually next to each tile. (time to populate adjacent on points) only open points and open tiles ...
  tiles.flat()
    .filter(tile => tile.open)
    .forEach(tile => {
      tile.location.adjacent=dirKeys
        .map(key=>directions[key])
        .map(direction=>({key: direction.key, tile: get(tile.location.x + direction.dx, tile.location.y + direction.dy)}))
        .filter(dir => dir.tile !== undefined)
        .filter(dir => dir.tile?.open)
        .reduce((prev: Partial<Record<DirKey, Point>>, dir) => {
          prev[dir.key] = dir.tile!.location;
          return prev;
        },{});
  });

  // if a blizzard is moving where can it go next? (time to populate wrapping on points)
  tiles.flat()
  .filter(tile => tile.open)
  .forEach(tile=>{
    tile.location.wrapping = {...tile.location.adjacent}; // this wont have dir's populated that hit walls etc
    dirKeys
      .map(key=>({dir:directions[key], point: tile.location.adjacent![key]}))
      .filter(adj => !adj.point)
      .map(adj => adj.dir)
      .forEach(direction => {
          // we hit a wall
          // walk backwards till we hit another wall...
          let p = tile;
          let n = get(p.location.x - direction.dx, p.location.y - direction.dy);
          while (n && n.open) {
            p = n;
            n = get(p.location.x - direction.dx, p.location.y - direction.dy);
          }
          tile.location.wrapping[direction.key] = p.location;
      });
  });
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
  }

  get(x:number, y:number): ITile | undefined {
    if (x < 0 || y < 0 || y >= this.tiles.length || x > this.tiles[y].length) {
      return undefined;
    }
    return this.tiles[y] && this.tiles[y][x];
  }

  theWindBloweth() {
    this.open.forEach(tile => tile.tmpBlizzards=[]);
    
    this.open
    .filter(tile => tile.blizzards.length > 0)
    .forEach(tile => tile.blizzards
      .forEach(blizzard=>{
        const next = tile.location.wrapping![blizzard.direction]!;
        const temp = this.get(next.x, next.y);
        if (!temp || !isOpenTile(temp)) {
          throw new Error("blizzard cannot move!");
        }
        blizzard.tile = temp;
        temp.tmpBlizzards.push(blizzard);
      })
    );
    
    this.open.forEach(tile => tile.blizzards=tile.tmpBlizzards);
    this.open.forEach(tile => tile.tmpBlizzards=[]);
  }

  checkMovement(){
    this.open.forEach(tile => {
      tile.moves = {};
      dirKeys
        .map(key=>({dir:directions[key], point: tile.location.adjacent[key]}))
        .filter(adj => !!adj.point)
        .map(adj => ({...adj, tile: this.get(adj.point?.x!, adj.point?.y!)!}))
        .filter(adj => isOpenTile(adj.tile!))
        .map(adj=>({...adj, tile: adj.tile as OpenTile}))
        .forEach(adj=>{
          if (!adj.tile.blizzards.length) {
            tile.moves[adj.dir.key] = {tile: adj.tile, facing: adj.dir};
          }
        })
    })
  }

  clone() {
    const board = new Board(this.tiles.map(row=>row.map(tile=>tile.clone())));
    board.start = this.get(this.start.location.x,this.start.location.y)!;
    board.end = this.get(this.end.location.x,this.end.location.y)!;
    return board;
  }

}
let boardCount = 0;
const nextBoard = (previous: Board) => {
  boardCount++;
  // console.log(`creating a board! ${boardCount}`);
  const next = previous.clone();
  next.theWindBloweth();
  next.checkMovement();
  return next;
}
type Move = {
  tile: OpenTile;
  minute: number;
}
class Journey{
  public boards: Board[] = [];
  public queue: Move[] = [];
  public destinationCost: number = Infinity;
  public loops = 0;
  public start = (new Date()).getTime();
  public iteration = this.start;
  constructor(
    public initial: Board,
    public origin: Point,
    public destination: Point
  ) {
    this.boards.push(initial);
    // persist the manhatten distance to the destination from each location - its used all the time...
    initial.tiles.flat()
    .filter(tile => isOpenTile(tile))
    .map(tile => tile.location)
    .forEach(point=>{
      point.destinationManhatten = point.manhatten(destination);
    });
    // initialize costs and visited flags 
    initial.tiles.flat()
    .filter(tile => isOpenTile(tile))
    .forEach(tile=>{
      tile.cost = Infinity;
      tile.visited = false;
    });
    // start the queue 
    const originTile = initial.get(origin.x, origin.y)! as OpenTile;
    originTile.cost = 0;
    this.queue.push({tile: originTile , minute: 0});
  }
  travel() { //dijkstra
    this.destinationCost = Infinity;
    while (this.queue.length > 0) {
      this.loops++;
      // sorting reduces the number of loops needed by 3/4 but doubles the time taken.
      // const min = this.queue.sort((a, b) => a.tile.cost - b.tile.cost).shift()!;
      const min = this.queue.shift()!;
      if (!min.tile.visited && (min.minute + min.tile.location.destinationManhatten) < this.destinationCost ) { // truncate any that won't make the grade
        min.tile.visited = true;
  
        this.boards[min.minute] = (this.boards[min.minute] || nextBoard(this.boards[min.minute - 1]));
        this.boards[min.minute + 1] = (this.boards[min.minute + 1] || nextBoard(this.boards[min.minute]));
        const next = this.boards[min.minute + 1];
        const moves = next.get(min.tile.location.x, min.tile.location.y)!.moves; // look at the spaces available next turn.
  
        if (moves === undefined) {
          throw new Error("moves undefined");
        }
  
        Object.values(moves)
          .filter(m => !m.tile.visited)
          .forEach(m => {
            m.tile.cost = Math.min(m.tile.cost, min.minute + 1 + 4 * m.tile.location.destinationManhatten); // weighted to get a quick answer to start truncating
            if (m.tile.location === this.destination) {
              this.destinationCost = Math.min(this.destinationCost, m.tile.cost)
            }
            this.queue.push({
              tile: m.tile,
              minute: min.minute + 1
            });
          });
        const now = (new Date()).getTime();
        if (now - this.iteration > 5000) {
          this.iteration = now;
          console.log({
            lps: this.loops,
            elapsed: Math.floor((now - this.start) / 1000),
            len: this.queue.length,
            min: min.minute,
            lst: min.minute + min.tile.location.destinationManhatten,
            cst: min.tile.cost,
            tl: min.tile.toString(),
            add: Object.values(moves).length,
            end: this.destinationCost === Infinity ? "X" : this.destinationCost
          });
        }
      }
    }
    console.log({loops: this.loops, cost: this.destinationCost}); 
  }
}

const part1 = (rawInput: string) => {
  const {tiles, blizzards} = parseInput(rawInput);
  const board = new Board(tiles);

  const outbound = new Journey(board, board.start.location, board.end.location);
  outbound.travel();
  return outbound.destinationCost;
};

const part2 = (rawInput: string) => {
  const {tiles, blizzards} = parseInput(rawInput);
  const board = new Board(tiles);

  const outbound = new Journey(board, board.start.location, board.end.location);
  outbound.travel();

  const arrival = outbound.boards.find(board => board.get(board.end.location.x, board.end.location.y)?.cost === outbound.destinationCost)?.clone()!;
  const inbound = new Journey(arrival, arrival.end.location, arrival.start.location);
  inbound.travel();

  const restart = inbound.boards.find(board => board.get(board.start.location.x, board.start.location.y)?.cost === inbound.destinationCost)?.clone()!;
  const outboundAgain = new Journey(restart, restart.start.location, restart.end.location);
  outboundAgain.travel();
  const total = outbound.destinationCost + inbound.destinationCost + outboundAgain.destinationCost;
  console.log({outbound: outbound.destinationCost, inbound: inbound.destinationCost, outboundAgain: outboundAgain.destinationCost, total});
  return total;
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
        expected: 54,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  // onlyTests: true,
});

