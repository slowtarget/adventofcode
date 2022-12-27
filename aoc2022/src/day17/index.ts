import run from "aocrunner";
// coordinate base will be bottom left - ie (0,0) is bottom left.
const txtCode = () => ({ 
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
});
const {Reset, FgGreen, FgBlue, FgYellow, FgMagenta, FgRed} = txtCode();
const colors = [FgBlue,FgGreen, FgMagenta, FgRed, FgYellow];
class Point{
  constructor(
    public x: number,
    public y: number
  ){}
}
class SolidCell {
  constructor(
    public location: Point,  
    public color: string
  ) {} 
  toString() {
    return `${this.color}#${Reset}`;
  }
}
class Shape {
  public width: number;
  public bottom: number[] = []; // the heights of the bottom of the shape
  public margins: number[][] = [[],[]]; // where the left(0) and right(1) margins are - relative to (0,0)
  public cells: SolidCell[][];
  constructor(
    public lines: string[],
    public color : string
  ) {
    this.cells = lines
      .map((line, dy)=>line
        .split("")
        .map((char,x) => ({char, location: new Point(x, lines.length - 1 - dy)}))
        .filter(x => x.char==="#")
        .map(cell => new SolidCell(cell.location, this.color))
      );

    this.width = this.cells.map(row => row.length).reduce((p, c) => (c > p) ? c : p);
    for (let x = 0; x < this.width; x++) {
      this.bottom.push(this.cells
        .map(row => row[x])
        .filter(c => c !== undefined)
        .map(c => c.location.y)
        .reduce((p, c) => (c < p) ? c : p, Infinity));
    }

    this.cells.forEach((row, y)=>{
      this.margins[0].push(row.map(cell => cell.location.x).reduce((p, c) => (c < p) ? c : p, Infinity));
      this.margins[1].push(row.map(cell => cell.location.x).reduce((p, c) => (c > p) ? c : p, 0));
    });
  }
}
const shapesInput = `####

.#.
###
.#.

..#
..#
###

#
#
#
#

##
##`;

const shapes = shapesInput.replace(/\r\n/g, "\n").split(/\n\n/g).map((group,i) => {
  const lines = group.replace(/\r\n/g, "\n").split(/\n/g);
  return new Shape(lines, colors[i]);
});
interface Breeze {
  right: boolean;
  dx: number;
}
class Right implements Breeze {
  public right: boolean = true;
  public dx: number = 1;

}
class Left implements Breeze {
  public right: boolean = false;
  public dx: number = -1;
}

class Cave{
  public layout : SolidCell[][] = [];
  public jetIdx: number = 0;
  constructor(
    public jets: Breeze[],
    public width:number
  ){}

  add(shape: Shape){
    const bottomLeft = new Point(2, this.highest() + 4);
    const maxX = this.width - shape.width;
    
    // shift
    bottomLeft.x = Math.max(0, Math.min(bottomLeft.x + this.getJet().dx, maxX));

    for (let i = 0; i < 3; i++) {
      // drop
      bottomLeft.y --;
      // shift
      bottomLeft.x = Math.max(0, Math.min(bottomLeft.x + this.getJet().dx, maxX));
    }

    // can this shape drop?
    while (this.check(shape, bottomLeft, 0, -1)) {
      bottomLeft.y --;
      // shift
      let dx = this.getJet().dx
      
        if (this.check(shape, bottomLeft, dx, 0)) { 
          bottomLeft.x += dx;
        }
    }
    // dun movin, stick it in place
    this.stick(shape, bottomLeft);
  }
  private stick(shape: Shape, bottomLeft: Point) {
    shape.cells.flat().forEach(cell => {
      const x = cell.location.x + bottomLeft.x;
      const y = cell.location.y + bottomLeft.y;

      this.layout[y] = this.layout[y] || [];
      if (this.layout[y][x]) {
        throw new Error(`(${x},${y}) is already occupied! ${this.layout[y][x].color}#${Reset}`)
      }
      this.layout[y][x] = new SolidCell(new Point(x, y), shape.color);
    });
  }

  private check(shape: Shape, checkPoint: Point, dx: number, dy: number) {
    const found = shape.cells.flat().find(shapePoint => {
      const x = shapePoint.location.x + checkPoint.x + dx;
      const y = shapePoint.location.y + checkPoint.y + dy;
      if (x < 0 || x >= this.width || y < 0 ) {
        return true;
      }
      return !!this.get(x,y);
    });
    return !found;
  }

  get(x: number, y: number) {
    if (x < 0 || y < 0 || y >= this.layout.length || x >= this.layout[y].length) {
      return undefined;
    }
    return this.layout[y] && this.layout[y][x];
  }

  clearToDrop(bottomLeft: Point, shape: Shape) {
    if (bottomLeft.y === 0) {
      return false;
    }

    const found = shape.bottom.find((h, dx) => {
      const x = bottomLeft.x + dx;
      const y = bottomLeft.y + h - 1;
      const cell = this.get(x, y); 
      return cell !== undefined;
    });

    return found === undefined;
  }
  
  clearToShift(bottomLeft: Point, shape: Shape, dx: number) {
    
    const side = (dx + 1) / 2
    const margin = shape.margins[side];
    
    const found = margin.find((shapeX, h) => {
      const x = bottomLeft.x + shapeX + dx;
      const y = bottomLeft.y + h;
      if (x < 0 || x >= this.width) {
        return true;
      }
      const cell = this.get(x, y); 
      return cell !== undefined;
    });

    return found === undefined;
  }

  getJet() {
    const jet = this.jets[this.jetIdx];
    this.jetIdx ++;
    this.jetIdx = this.jetIdx % this.jets.length;
    return jet;
  }

  highest(){
    return this.layout.flat().map(cell=>cell.location.y).reduce((p,c)=> (c > p) ? c : p, -1);
  }

  toString(){
    const yMax = this.highest();
    let result = "";
    for (let y=yMax; y > -1; y--) {
      result += "|";
      for (let x = 0; x < this.width; x++) {
        const cell = this.get(x, y);
        if (cell) {
          result += cell.toString();
        } else {
          result += ".";
        }
      }
      result += "|\n";
    }
    result += "+" + "-".repeat(this.width) + "+";
    return result;
  }
}

const parseInput = (rawInput: string) => {
  const line = rawInput.replace(/\r\n/g, "\n").split(/\n/g)[0];
  
  const commands: Breeze[] = line.split("").map(x=>{
    switch (x) {
      case ">":
        return new Right()
      default:
        return new Left()
    }
  });
  console.log ({line: line.length, commands:commands.length})
  return commands;
}

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const cave = new Cave(input, 7);

  let rocks = 0;
  while (rocks < 2022) {
    const shape = shapes[rocks % shapes.length];
    cave.add(shape);
    // console.log(`rocks : ${rocks + 1}\n${cave.toString()}`);
    rocks ++;
  }

  console.log({highest: cave.highest(), length:cave.layout.length})
  return cave.highest() + 1;
  // That's not the right answer; your answer is too low. (You guessed 3129.)
  // That's not the right answer; your answer is too high. (You guessed 3157.)
  // That's not the right answer; your answer is too high. (You guessed 3152.)
};

const part2_1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const cave = new Cave(input, 7);

  let rocks = 0;
  let pheight = 0;
  let procks = 0;
  while (rocks < (1757 + 1403)) {
    const shape = shapes[rocks % shapes.length];
    cave.add(shape);
    // console.log(`rocks : ${rocks + 1}\n${cave.toString()}`);
    
    rocks ++;
    if (cave.jetIdx === 0) {
      console.log(`Rocks : ${rocks}, height: ${cave.layout.length} jetIdx : ${cave.jetIdx} delta rocks = ${rocks - procks}, height : ${cave.layout.length - pheight}`)
      pheight = cave.layout.length;
      procks = rocks;
    }
    if (rocks === ( 1757 + 1403 )) {
      console.log(`height gained by 1403 rocks is ${cave.layout.length - pheight}`)
    }
  }
// { line: 10091, commands: 10091 }
// Rocks : 1757, height: 2722 jetIdx : 0 delta rocks = 1757, height : 2722
// Rocks : 3512, height: 5469 jetIdx : 0 delta rocks = 1755, height : 2747
// Rocks : 5267, height: 8216 jetIdx : 0 delta rocks = 1755, height : 2747
// Rocks : 7022, height: 10963 jetIdx : 0 delta rocks = 1755, height : 2747
// Rocks : 8777, height: 13710 jetIdx : 0 delta rocks = 1755, height : 2747
// Rocks : 10532, height: 16457 jetIdx : 0 delta rocks = 1755, height : 2747
// Rocks : 12287, height: 19204 jetIdx : 0 delta rocks = 1755, height : 2747
// Rocks : 14042, height: 21951 jetIdx : 0 delta rocks = 1755, height : 2747
// Rocks : 15797, height: 24698 jetIdx : 0 delta rocks = 1755, height : 2747
// Rocks : 17552, height: 27445 jetIdx : 0 delta rocks = 1755, height : 2747
// Rocks : 19307, height: 30192 jetIdx : 0 delta rocks = 1755, height : 2747
  console.log({highest: cave.highest(), length:cave.layout.length})
  return cave.layout.length - 2722;
};
const part2 = (rawInput: string) => {
  
  //  so part2_1 gave us the pattern
  //  2722 + ( 1_000_000_000_000 - 1757 ) / 1755 * 2747 to give us the height
  //  ... hopefully the result is an integer ... otherwise will have to dig in to some more detail...
  //  364035247.0902803
  // That's not the right answer; your answer is too low. (You guessed 364035248.) // forgot to multiply by one of the factors
  // That's not the right answer; your answer is too low. (You guessed 638878776866.) // was trying to work out how many rocks to reach a height of 1_000_000_000_000
  // That's not the right answer; your answer is too high. (You guessed 1565242165215.) // maybe round down instead ... nope ... 214 also too high
  // 1565242165201 yay! // stopped rounding and woked it out... 
  
  const whole1755 = Math.floor(( 1_000_000_000_000 - 1757 ) / 1755);
  const wholeReaches = 2722 + whole1755 * 2747;
  const wholeReachesRocks = 1757 + whole1755 * 1755;
  
  const short = 1_000_000_000_000 - wholeReachesRocks; // 1403 
  const makeup = part2_1(rawInput);
  
  // const result = 2722 + ( 1_000_000_000_000 - 1757 ) / 1755 * 2747;
  const result = wholeReaches + makeup;
  console.log({result, whole1755, wholeReaches, wholeReachesRocks, short, makeup})
  return Math.round((result));
}
const testInput = `
>>><<><>><<<>><>>><<<>>><<<><<<>><>><<>>
`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 3068,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 1_514_285_714_288,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  // onlyTests: true,
});
