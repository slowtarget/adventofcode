import run from "aocrunner";
import * as Logger from "bunyan";

const log = Logger.createLogger({ name: "2021 day4", level: "warn" });

type EdgeKey = "top"|"right"|"left"|"bottom"|"topR"|"rightR"|"leftR"|"bottomR";
const edges: Record<
  EdgeKey,
  {
    clockwise: EdgeKey,
    opposite:EdgeKey,
    location:EdgeKey,
    order:number,
    start: { x: string; y: string };
    dir: { dx: number; dy: number };
    reversed: boolean;
  }
> = {
  top: {
    clockwise:"right",
    opposite:"bottom",
    location:"top",
    order:1,
    start: { x: "min", y: "min" },
    dir: { dx: 1, dy: 0 },
    reversed: false,
  },
  topR: {
    clockwise:"right",
    opposite:"bottomR",
    location:"top",
    order:10,
    start: { x: "max", y: "min" },
    dir: { dx: -1, dy: 0 },
    reversed: true,
  },
  bottom: {
    clockwise:"left",
    opposite:"top",
    location:"bottom",
    order:3,
    start: { x: "min", y: "max" },
    dir: { dx: 1, dy: 0 },
    reversed: false,
  },
  bottomR: {
    clockwise:"left",
    opposite:"topR",
    location:"bottom",
    order:30,
    start: { x: "max", y: "max" },
    dir: { dx: -1, dy: 0 },
    reversed: true,
  },
  left: {
    clockwise:"top",
    opposite:"right",
    location:"left",
    order:4,
    start: { x: "min", y: "min" },
    dir: { dx: 0, dy: 1 },
    reversed: false,
  },
  leftR: {
    clockwise:"top",
    opposite:"rightR",
    location:"left",
    order:40,
    start: { x: "min", y: "max" },
    dir: { dx: 0, dy: -1 },
    reversed: true,
  },
  right: {
    clockwise:"bottom",
    opposite:"left",
    location:"right",
    order:2,
    start: { x: "max", y: "min" },
    dir: { dx: 0, dy: 1 },
    reversed: false,
  },
  rightR: {
    clockwise:"bottom",
    opposite:"leftR",
    location:"right",
    order:20,
    start: { x: "max", y: "max" },
    dir: { dx: 0, dy: -1 },
    reversed: true,
  },
};
const edgeOrder = Object.keys(edges).map(key => edges[key as EdgeKey]).filter(edge=>edge.order < 10).sort((a,b)=>a.order-b.order);
class Edge {
  public hash: number;
  public match?: Edge;

  constructor(public id: any, public key: EdgeKey, public border: string) {
    this.hash = border
      .split("")
      .map((c, i) => (c === "#" ? Math.pow(2, i) : 0))
      .reduce((c, p) => c + p, 0);
  }
}
class Tile {
  public x?: number;
  public y?: number;
  public edges: Edge[];
  public matched?: Edge[];
  public rotate?:number;
  public flipX?: boolean;
  public flipY?: boolean;

  constructor(public id: number, public input: string[][]) {
    this.edges = this.getEdges();
  }

  getEdges(): Edge[] {
    return Object.keys(edges).map((inKey) => {
      const key = inKey as EdgeKey;
      const edge = edges[key];
      let x = edge.start.x === "min" ? 0 : this.input[0].length - 1;
      let y = edge.start.y === "min" ? 0 : this.input.length - 1;
      let border = "";

      while (
        x > -1 &&
        x < this.input[0].length &&
        y > -1 &&
        y < this.input.length
      ) {
        border += this.input[y][x];
        x += edge.dir.dx;
        y += edge.dir.dy;
      }
      return new Edge(this.id, key, border);
    });
  }
}
class Image {
  public edges: Edge[];
  public tileMap: Record<number, Tile> = {};
  public cornerTiles: Tile[] = [];
  constructor(public tiles: Tile[]) {
    this.edges = tiles.map((tile) => tile.edges).flat();
    this.tiles.forEach((tile) => (this.tileMap[tile.id] = tile));
    console.log(`total edges: ${this.edges.length}`);

    let hashes: Record<number, Edge[]> = {};
    this.edges.forEach((edge) => {
      hashes[edge.hash] = hashes[edge.hash] ?? [];
      hashes[edge.hash].push(edge);
    });

    Object.values(hashes)
      .filter((edges) => edges.length > 1)
      .forEach((edges) => {
        if (edges.length > 2) {
          console.log(`unexpected number of matches! `, edges);
        }
        edges[0].match = edges[1];
        edges[1].match = edges[0];
      });

    this.tiles.forEach((tile) => {
      tile.matched = tile.edges
        .filter((edge: Edge): boolean => (!!edge.match));
    });

    this.cornerTiles = this.tiles.filter((tile) => tile.matched?.length === 4);
  }
  stitch() {
    const tile1 = this.cornerTiles[0];


    // need bottom and right in place ... 
    const sortedEdges:Edge[] = tile1.matched?.filter(e=>edges[e.key].order<10).sort((a,b)=>edges[a.key].order-edges[b.key].order) ?? [];
    let toBeRight: Edge;
    if (sortedEdges.length > 1) {
        if (edges[sortedEdges[1].key].order - edges[sortedEdges[0].key].order > 1) {
          toBeRight = sortedEdges[1];
        } else {
          toBeRight = sortedEdges[0];
        }
        let edge = edges[toBeRight.key];
        tile1.x=0;
        tile1.y=0;
        tile1.rotate=0;
        tile1.flipX =false;
        tile1.flipY =false;

        switch (edge.location) {
          case "top":
            tile1.rotate = 1;
            break;   
          case "right":
            break;   
          case "bottom":
            tile1.rotate = 1;
            tile1.flipX=true;
            break;                              
          case "left":
            tile1.flipX=true;
        }
        let toBeLeft = toBeRight.match;
        while (toBeLeft) {
          const next = this.tileMap[toBeLeft?.id];
          edge = edges[toBeLeft.key];
          const oppositeKey = edges[toBeLeft.key].opposite;
          const opposite = edges[oppositeKey];
          switch (edge.location) { // needs to be left to match the right id.
            case "top":
              next.rotate = 1;
              next.flipX=true;
              break;   
            case "right":
              next.flipX=true;
              break;   
            case "bottom":
              next.rotate = 1;
              next.flipX=false;
              break;                              
            case "left":
              next.flipX=false;
              break;  
          } 
          toBeLeft = (next.matched ?? []).find(e => e.key === oppositeKey);
        }
    }
  }
}

const parseInput = (rawInput: string) => {
  return new Image(
    rawInput
      .replace(/\r\n/g, "\n")
      .split(/\n\n/g)
      .map((tileIn) => {
        const [idIn, ...imageIn] = tileIn.split(/\n/g);
        const id = Number(idIn.split(/ /)[1].split(/:/)[0]);
        return new Tile(
          id,
          imageIn.map((line) => line.split("")),
        );
      }),
  );
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return input.cornerTiles.map((tile) => tile.id).reduce((p, c) => p * c, 1);
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  input.stitch();
  return 0;
};

run({
  part1: {
    tests: [
      {
        input: `
Tile 2311:
..##.#..#.
##..#.....
#...##..#.
####.#...#
##.##.###.
##...#.###
.#.#.#..##
..#....#..
###...#.#.
..###..###

Tile 1951:
#.##...##.
#.####...#
.....#..##
#...######
.##.#....#
.###.#####
###.##.##.
.###....#.
..#.#..#.#
#...##.#..

Tile 1171:
####...##.
#..##.#..#
##.#..#.#.
.###.####.
..###.####
.##....##.
.#...####.
#.##.####.
####..#...
.....##...

Tile 1427:
###.##.#..
.#..#.##..
.#.##.#..#
#.#.#.##.#
....#...##
...##..##.
...#.#####
.#.####.#.
..#..###.#
..##.#..#.

Tile 1489:
##.#.#....
..##...#..
.##..##...
..#...#...
#####...#.
#..#.#.#.#
...#.#.#..
##.#...##.
..##.##.##
###.##.#..

Tile 2473:
#....####.
#..#.##...
#.##..#...
######.#.#
.#...#.#.#
.#########
.###.#..#.
########.#
##...##.#.
..###.#.#.

Tile 2971:
..#.#....#
#...###...
#.#.###...
##.##..#..
.#####..##
.#..####.#
#..#.#..#.
..####.###
..#.#.###.
...#.#.#.#

Tile 2729:
...#.#.#.#
####.#....
..#.#.....
....#..#.#
.##..##.#.
.#.####...
####.#.#..
##.####...
##..#.##..
#.##...##.

Tile 3079:
#.#.#####.
.#..######
..#.......
######....
####.#..#.
.#...#.##.
#.#####.##
..#.###...
..#.......
..#.###...        
        `,
        expected: 20899048083289,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [],
    solution: part2,
  },
  trimTestInputs: true,
  // onlyTests: true,
});
