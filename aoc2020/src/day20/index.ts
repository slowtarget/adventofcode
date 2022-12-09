import run from "aocrunner";
import * as Logger from "bunyan";

const log = Logger.createLogger({ name: "2021 day4", level: "warn" });

class Character {
  static compare(a: Character, b:Character) {
      return a.getInput() < b.getInput() ? -1 : 1;
  }
  getInput() {
    return this.input;
  }
  public color: string;
  public head: boolean;
  constructor(
    private input: string
  ) {
    let headbutt: string = '';
    [this.color, headbutt] = input.split(' ');
    this.head = headbutt === 'head';
  }
  public toString() {
    return `${this.color} ${this.head?'head':'butt'}`;
  }
  public equals(other:Character) {
    return this.color === other.color && this.head === other.head;
  }
}
class Tile {
  private identity: string|undefined = undefined;
  constructor(
    public characters: Character[]
  ) { }
  public rotate(times: number) {
    let copy = [...this.characters];
    let remaining = times;
    while (remaining > 0) {
      copy = this.rotate1(copy);
      remaining--;
    }
    return new Tile(copy);
  }
  private rotate1(tile: Character[]) {
    return [tile[1], tile[2], tile[3], tile[0]];
  }
  public getTop() {
    return this.characters[0];
  }
  public getRight() {
    return this.characters[1];
  }
  public getBottom() {
    return this.characters[2];
  }
  public getLeft() {
    return this.characters[3];
  }
  public getIdentity() {
    if (this.identity === undefined) {
      let toSort = [...this.characters];
      toSort.sort(Character.compare)
      let   first = toSort[0];
      let firstIndex = this.characters.indexOf(first);
      let normalized = this.rotate(firstIndex);
      this.identity = normalized.toString();

    }
    return this.identity;
  }
  
  public equals(other:Tile) {
    if (other === null || other === undefined) {
      return false;
    }

    return this.getIdentity() === other.getIdentity(); 
  }
  toString() {
    return this.characters.map(char=>char.toString()).join(", ");
  }
  clone() {
    return new Tile(this.characters);
  }
}
//
//
//       0 top
//  3 left     1 right
//      2 bottom
//
//  0  1  2
//  3  4  5
//  6  7  8
//
const gridMap : {[index: number]:{left?: number, top?:number}}= {
  0: {},
  1: { left: 0 },
  2: { left: 1 },
  3: { top: 0 },
  4: { top: 1, left: 3 },
  5: { top: 2, left: 4 },
  6: { top: 3 },
  7: { top: 4, left: 6 },
  8: { top: 5, left: 7 }
};
class Grid {
  public tiles: Tile[] = [];
  public add(tile: Tile) {
    let newGrid =  new Grid();
    newGrid.tiles = [...this.tiles];

    if (this.tiles.length === 0) {
      newGrid.tiles.push(tile);
      return {valid: true, grid: newGrid};
    }
    // tile has to match according to gridmap[tiles.length + 1]
    let validation = gridMap[this.tiles.length];
    let valid = false;
    let rotation = 0;
    while (!valid  && rotation < 4)  {
      valid = true;
      let rotatedTile = tile.rotate(rotation);
      if (validation.left !== undefined) {
        let leftCharacter = this.tiles[validation.left].getRight();
        if (leftCharacter.color !== rotatedTile.getLeft().color ||  leftCharacter.head === rotatedTile.getLeft().head) {
          valid = false;
        }
      }
      
      if (valid && validation.top !== undefined) {
        let topCharacter = this.tiles[validation.top].getBottom();
        if (topCharacter.color !== rotatedTile.getTop().color ||  topCharacter.head === rotatedTile.getTop().head) {
          valid = false;
        }
      }
      if (valid) {
        newGrid.tiles.push(rotatedTile);
        return {valid: true, grid: newGrid};
      }
      rotation ++;
    }
    return {valid: false, grid: undefined};
  }
}
const parseInput = (rawInput: string) => {
  return rawInput
    .replace(/\r\n/g, '\n')
    .split(/\n\n/g)[0]
    .split(/\n/g)
    .map(line => new Tile(line.split(', ').map(character => new Character(character))))
}
const getValidGrids = (grid:Grid, remaining: Tile[]) : {grid:Grid, remaining: Tile[]}[] => {
  let result:  {grid:Grid, remaining: Tile[]}[] = [];

  let tileIndex = 0;
  
  while (tileIndex < remaining.length) {
    // can I add a tile?
    let response = grid.add(remaining[tileIndex]);
    if (response.valid && response.grid) {
      let remain = [...remaining];
      remain.splice(tileIndex,1);
      result.push({grid: response.grid, remaining: remain})
    }

    tileIndex ++;
  }
  // console.log(`getValidGrids: ${result.length}`)
  return result;
}

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  const firstGrid = new Grid();
  let validGrids: {grid:Grid, remaining: Tile[]}[] = [];
  for (var tileIndex1 = 0; tileIndex1 < input.length; tileIndex1++) {
    for (var orientation = 0; orientation < 4; orientation++) {
      const startingTile = input[tileIndex1].rotate(orientation);
      let response = firstGrid.add(startingTile);
      let nextGrid = response.grid!;
      var remainingTiles = [...input];
      remainingTiles.splice(tileIndex1,1);
      validGrids.push({grid: nextGrid, remaining: remainingTiles});
    }
  }
  console.log(`starting set : ${validGrids.length}`);

  while (validGrids.length > 0 && validGrids[0].grid.tiles.length < 9) {
    let newValidGrids = validGrids.map(({grid,remaining})=>getValidGrids(grid, remaining)).flatMap(a=>a);
    
    console.log(`next set :  ${validGrids.length}`);
    validGrids = [...newValidGrids];
  }

  console.log(`final set :  ${validGrids.length}`);
  validGrids.forEach(({grid})=>{
    console.log("");
    grid.tiles.forEach(tile=>{
      console.log(tile.toString());
    })
    console.log("");
    
  })
  
  console.log("centre tiles: ");
  let centres: Tile[] = [];
  validGrids.forEach(({grid})=>{
      let found = false;
      let match = grid.tiles[4];
      found = centres.some(centre=>centre.getIdentity() === match.getIdentity())
      if (!found) {
        centres.push(match);
      }
    })
  centres.forEach(centre=> {
    console.log(centre.getIdentity());
  });

  return 0;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return 0;
};

run({
  part1: {
    tests: [

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

