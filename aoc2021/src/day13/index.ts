import run from "aocrunner";
const unique = <T extends Object>(value: T, index: number, self: T[]) => {
  var first = self.findIndex(p => p.toString() === value.toString());
  return first === index;
}
class Instruction {
  constructor(
    private direction: 'x' | 'y',
    private position: number,
  ) { }

  public getDirection() {
    return this.direction;
  }
  public getPosition() {
    return this.position;
  }

  public clone(): Instruction {
    return new Instruction(this.direction, this.position);
  }
}
class Point {

  constructor(
    private x: number,
    private y: number,
  ) { }

  public getX() {
    return this.x;
  }
  public getY() {
    return this.y;
  }

  public clone(): Point {
    return new Point(this.x, this.y);
  }

  // fold left / fold up = only points > position get translated
  // 01234567890
  //      5       // position
  //       6      // x
  //     4        // translated
  public translateX(position: number) {
    if (this.x > position) {
      this.x = 2 * position - this.x;
    }
  }
  public translateY(position: number) {
    if (this.y > position) {
      this.y = 2 * position - this.y;
    }
  }
  public equals(b: Point) {
    return this.toString() === b.toString();
  }
}
Point.prototype.toString = function () { return `[${this.getX()},${this.getY()}]` };
Point.prototype.equals = function (b: Point) { return this.toString() === b.toString(); };


class Page {

  constructor(
    private page: Point[]
  ) { }

  public clone(): Page {
    return new Page(this.page.map(point => point.clone()));
  }

  public foldX(position: number) {
    this.page.forEach(point => point.translateX(position));
    this.page = this.page.filter(unique);
  }

  public foldY(position: number) {
    this.page.forEach(point => point.translateY(position));
    this.page = this.page.filter(unique);
  }

  public getNumberOfPoints(): number {
    return this.page.length;
  }

  public toString(): string {
    var maxX = Math.max(...this.page.map(point => point.getX()));
    var maxY = Math.max(...this.page.map(point => point.getY()));
    var p = new Array(maxY + 1).fill([]);
    p = p.map((r) => {
      return new Array(maxX + 1).fill(' ');
    });
    this.page.forEach(point => {
      if (p[point.getY()][point.getX()] === String.fromCharCode(9608)) {
        p[point.getY()][point.getX()] = '2';
      } else {
        p[point.getY()][point.getX()] = String.fromCharCode(9608);
      }
    });
    return p.map(r => console.log(r.join(""))).join(`\n`);
  }
}

const regExp = /^fold along (\w)=(\d+)$/;
const parseDirection = (direction: string): 'x' | 'y' => {
  if (direction === 'x' || direction === 'y') {
    return direction;
  }
  throw new Error(`no such direction ${direction}`);
}

const parseInput = (rawInput: string) => {
  var [page, instructions] = rawInput
    .replace(/\r\n/g, '\n')
    .split(/\n\n/g);

  var inputPage = page.split(/\n/)
    .map(p => p.split(',').map(a => parseInt(a, 10)))
    .map(([x, y]) => new Point(x, y));

  var inputInstructions = instructions.split(/\n/)
    .map(s => regExp.exec(s))
    .map(s => s || ["", "X", "10"])
    .map(([, direction, position]) => (new Instruction(parseDirection(direction), parseInt(position, 10))))

  return { page: new Page(inputPage), instructions: inputInstructions };
}

const part1 = (rawInput: string) => {
  const { instructions, page } = parseInput(rawInput);
  var instruction = instructions[0];
  if (instruction.getDirection() === 'x') {
    page.foldX(instruction.getPosition());
  } else {
    page.foldY(instruction.getPosition());
  }
  // console.log(page.toString());
  return page.getNumberOfPoints();
};

const part2 = (rawInput: string) => {
  const { instructions, page } = parseInput(rawInput);

  instructions.forEach(instruction => {
    if (instruction.getDirection() === 'x') {
      page.foldX(instruction.getPosition());
    } else {
      page.foldY(instruction.getPosition());
    }
  });

  console.log(page.toString());
  return page.getNumberOfPoints();
};

const testInput = `
6,10
0,14
9,10
0,3
10,4
4,11
6,0
6,12
4,1
0,13
10,12
3,4
3,0
8,4
1,10
2,14
8,10
9,0

fold along y=7
fold along x=5`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 17,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 16,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
