import run from "aocrunner";
import { dir } from "console";
const txtCode = { 
  Reset : "\x1b[0m",
  Bright : "\x1b[1m",
  Dim : "\x1b[2m",
  Underscore : "\x1b[4m",
  Blink : "\x1b[5m",
  Reverse : "\x1b[7m",
  Hidden : "\x1b[8m",
  FgBlack : "\x1b[30m",
  FgRed : "\x1b[31m",
  FgGreen : "\x1b[32m",
  FgYellow : "\x1b[33m",
  FgBlue : "\x1b[34m",
  FgMagenta : "\x1b[35m",
  FgCyan : "\x1b[36m",
  FgWhite : "\x1b[37m",
  BgBlack : "\x1b[40m",
  BgRed : "\x1b[41m",
  BgGreen : "\x1b[42m",
  BgYellow : "\x1b[43m",
  BgBlue : "\x1b[44m",
  BgMagenta : "\x1b[45m",
  BgCyan : "\x1b[46m"
  };
const {Reset, FgYellow} = txtCode;


// type DirKey = "^" | ">" | "<" | "v" | ".";
type DirKey = "N" | "E" | "W" | "S" | "NE" | "NW" | "SE" | "SW";
interface DirRecord {
  key: DirKey;
  dx: number;
  dy: number;
}

const directions: Record<DirKey, DirRecord> = {
  "N": { key: "N", dx: 0,  dy: -1},
  "S": { key: "S", dx: 0,  dy: 1 },
  "W": { key: "W", dx: -1, dy: 0 },
  "E": { key: "E", dx: 1,  dy: 0 },
  "NE": { key: "NE", dx: 1,  dy: -1 },
  "NW": { key: "NW", dx: -1,  dy: -1 },
  "SE": { key: "SE", dx: 1,  dy: 1 },
  "SW": { key: "SW", dx: -1,  dy: 1 },
};

const dirKeys = Object.keys(directions).map(key => key as DirKey);

type Rule = {dir: DirKey, check: DirKey[] } 
const initialRules: Rule[] = [
  {dir: "N", check: ["NE", "N", "NW"]},
  {dir: "S", check: ["SE", "S", "SW"]},
  {dir: "W", check: ["NW", "W", "SW"]},
  {dir: "E", check: ["NE", "E", "SE"]},
]

class Point{
  public adjacent: Partial<Record<DirKey, Point>> = {};
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
  hash() {
    return Point.getHash(this.x, this.y);
  }

  static getHash(x: number, y:number){
    return 1000 * x + y;
  }
}

interface IElf {
  initialLocation: Point;
  
  toString: () => string;
  clone: () => Elf;
}

class Elf implements IElf{
  constructor(
    public initialLocation: Point
  ){}

  toString():string {
    return this.initialLocation.toString();
  };

  clone() {
    return this;
  }
}

class Terrain {
  public layout: Record<number,{point: Point, inhabitants:Elf[]}> = {};
  
  constructor(
    public folk: Elf[]
  ) {
    folk.forEach(elf => {
      this.addHome(elf.initialLocation.x, elf.initialLocation.y, elf);
    })
  }

  addHome(x: number,y: number,elf: Elf){
    const hash = Point.getHash(x, y);
    const existing = this.layout[hash];
    if (!existing) {
      if (hash === elf.initialLocation.hash()) {
        this.layout[hash] = {point: elf.initialLocation, inhabitants: [elf]};
      } else {
        this.layout[hash] = {point: new Point(x, y), inhabitants: [elf]};
      }
    } else {
      this.layout[hash].inhabitants.push(elf);
    }

    const point = this.layout[hash].point;
    if (Object.keys(point.adjacent).length < dirKeys.length) {
      this.addAdjacent(point);
    }
  }

  addAdjacent(point: Point){
    dirKeys.map(key => directions[key])
      .map(dir => ({dir, x: point.x + dir.dx, y: point.y + dir.dy}))
      .map(dir => ({...dir, hash: Point.getHash(dir.x, dir.y)}))
      .map(dir => ({...dir, existing: this.layout[dir.hash]}))
      .forEach(adj => {
        if (!adj.existing) {
          this.layout[adj.hash] = {point: new Point(adj.x, adj.y), inhabitants: []};
        }
        point.adjacent[adj.dir.key] = this.layout[adj.hash].point;
      });
  }
  smallestRectangleSize():number {
    const occupied = Object.values(this.layout)
    .filter(value => value.inhabitants.length > 0)
    .map(value => value.point);

    const minX = Math.min(...occupied.map(point => point.x));
    const maxX = Math.max(...occupied.map(point => point.x));
    const minY = Math.min(...occupied.map(point => point.y));
    const maxY = Math.max(...occupied.map(point => point.y));
    console.log({occupied: occupied.length, minX, maxX, minY, maxY});
    return (maxX - minX + 1) * (maxY - minY + 1);
  }
  clone() {
    const clone = new Terrain([]);
    Object.entries(this.layout).forEach(([hash, entry]) => {
      clone.layout[Number(hash)] = entry;
    });
    clone.folk = this.folk.map(elf => elf.clone())
    return clone;
  }
}

class Scatter{
  public terrain: Terrain;
  public ruleStart = -1;
  constructor(
    public rounds: number,
    public initialTerrain: Terrain
  ) {
    this.terrain = initialTerrain.clone();
  }
  run() {
    for (let i = 0; i < this.rounds; i++){
      this.round();
    }
  }
  round() {
    let moved = 0;
    this.ruleStart ++;
    
    const next = this.terrain.clone();
    Object.entries(next.layout).forEach(([hash, entry]) => {
      next.layout[Number(hash)] = {point: entry.point, inhabitants:[]};
    });

    const occupied = Object.entries(this.terrain.layout)
      .map(([hash, entry]) => ({ hash: Number(hash), point: entry.point, inhabitants: entry.inhabitants }))
      .filter(obj => obj.inhabitants.length > 0);
    
    occupied
      .forEach(({hash, point, inhabitants}) => {
        const elf = inhabitants[0];
        elf.initialLocation = point;
        let found = Object.values(point.adjacent)
          .find((p: Point) => this.terrain.layout[p.hash()].inhabitants.length > 0);

        if (found) {
          let index = 0;
          let valid = false;
          while (index < initialRules.length && !valid) {
            const rule = this.getRule(this.ruleStart, index);
            valid = this.valid(rule.check, point);

            if (valid) {
              const destination = point.adjacent[rule.dir]!;
              next.addHome(destination.x, destination.y, elf);
              moved ++;
            }
            index ++;
          }
          if (!valid) {
            // none of the rules matched ... don't move
            next.addHome(point.x, point.y, elf);
          }
        } else {
          // don't move
          next.addHome(point.x, point.y, elf);
        }
    });
    
    const collisions = Object.entries(next.layout)
      .map(([hash, entry]) => ({ hash: Number(hash), inhabitants: entry.inhabitants }))
      .filter(obj => obj.inhabitants.length > 1);
    // find collisions
    // console.log({collisions: collisions.length});

    collisions
    .forEach(({hash, inhabitants}) => {

      inhabitants.forEach(elf => {
        next.addHome(elf.initialLocation.x, elf.initialLocation.y, elf);
        moved --;
      });
      next.layout[hash].inhabitants = [];
    });

    this.terrain = next;
    return moved;
  }
  valid(check: DirKey[], point: Point) {

    const occupied =  check
      .map(dir=>point.adjacent[dir]!)
      .map(adj => adj.hash())
      .map(hash => this.terrain.layout[hash])
      .map(entry => entry.inhabitants)
      .find(inhabitants => inhabitants.length !==0 );
    
    return !occupied;
  }

  getRule(start:number, index: number): Rule {
    return initialRules[(start + index) % initialRules.length];
  }
}
const parseInput = (rawInput: string) => {
  return rawInput
    .replace(/\r\n/g, "\n")
    .split(/\n/g)
    .map((line, y) => line.split("")
      .map((char, x) => ({char, x, y}))
      .filter(position => position.char !== ".")
      .map(position => new Point(position.x, position.y))
      .map(point => new Elf(point)))
    .flat();
}

const part1 = (rawInput: string) => {
  const folk = parseInput(rawInput);
  const scatter = new Scatter(10, new Terrain(folk));
  scatter.run();
  const smallest = scatter.terrain.smallestRectangleSize();
  console.log(`complete, folk: ${folk.length} smallest: ${smallest} diff: ${smallest - folk.length}`)
  return smallest - folk.length;
};

const part2 = (rawInput: string) => {
  const folk = parseInput(rawInput);
  const scatter = new Scatter(0, new Terrain(folk));
  let round = 1;
  while (scatter.round() !== 0) {
    round ++
  };
  return round;
};

const testInput = `
....#..
..###.#
#...#.#
.#...##
#.###..
##.#.##
.#..#..
`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 110,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 20,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  // onlyTests: true,
});
