import run from "aocrunner";
// https://en.wikipedia.org/wiki/Cost_distance_analysis

var Reset = "\x1b[0m"
var Bright = "\x1b[1m"
var Dim = "\x1b[2m"
var Underscore = "\x1b[4m"
var Blink = "\x1b[5m"
var Reverse = "\x1b[7m"
var Hidden = "\x1b[8m"
var FgBlack = "\x1b[30m"
var FgRed = "\x1b[31m"
var FgGreen = "\x1b[32m"
var FgYellow = "\x1b[33m"
var FgBlue = "\x1b[34m"
var FgMagenta = "\x1b[35m"
var FgCyan = "\x1b[36m"
var FgWhite = "\x1b[37m"
var BgBlack = "\x1b[40m"
var BgRed = "\x1b[41m"
var BgGreen = "\x1b[42m"
var BgYellow = "\x1b[43m"
var BgBlue = "\x1b[44m"
var BgMagenta = "\x1b[45m"
var BgCyan = "\x1b[46m"

var debug = false;
const log = (...arg: any[]) => {
  if (debug) {
    console.log('', ...arg);
  }
}
const unique = <T extends Object>(value: T, index: number, self: T[]) => {
  var first = self.findIndex(p => p.toString() === value.toString());
  return first === index;
}

const toKey = (x: number, y: number): string => {
  return `(${x},${y})`;
}
const numToRightJustifiedString = (num: number, length: number): string => {
  var s = num.toString(10);

  return s.padStart(length, ' ');
}

// Returns current time
// (and, if provided, prints the event's name)
const now = (eventName: string | null = null) => {
  if (eventName) {
    console.log(`Started ${eventName}..`);
  }
  return new Date().getTime();
}

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
}

type Supplier = () => number;
type Operator = (x: Supplier) => void;
class ALU {
  public w: number = 0;
  public x: number = 0;
  public y: number = 0;
  public z: number = 0;
  public inp(fn: (x: () => number) => {}, get: () => number) { fn(get); }
  public add(fn: (x: () => number) => {}, get: () => number) { fn(get); }
  public mul(fn: (x: () => number) => {}, get: () => number) { fn(get); }
  public div(fn: (x: () => number) => {}, get: () => number) { fn(get); }
  public getW() { return this.w; }
  public getX() { return this.x; }
  public getY() { return this.y; }
  public getZ() { return this.z; }
  public setW(value: () => number) { this.w = value(); }
  public setX(value: () => number) { this.x = value(); }
  public setY(value: () => number) { this.y = value(); }
  public setZ(value: () => number) { this.z = value(); }
  public addW(value: () => number) { this.w += value(); }
  public addX(value: () => number) { this.x += value(); }
  public addY(value: () => number) { this.y += value(); }
  public addZ(value: () => number) { this.z += value(); }
  public mulW(value: () => number) { this.w *= value(); }
  public mulX(value: () => number) { this.x *= value(); }
  public mulY(value: () => number) { this.y *= value(); }
  public mulZ(value: () => number) { this.z *= value(); }
  public divW(value: () => number) { this.w = Math.floor(this.w / value()); }
  public divX(value: () => number) { this.x = Math.floor(this.x / value()); }
  public divY(value: () => number) { this.y = Math.floor(this.y / value()); }
  public divZ(value: () => number) { this.z = Math.floor(this.z / value()); }
  public modW(value: () => number) { this.w = this.w % value(); }
  public modX(value: () => number) { this.x = this.x % value(); }
  public modY(value: () => number) { this.y = this.y % value(); }
  public modZ(value: () => number) { this.z = this.z % value(); }
  public eqlW(value: () => number) { this.w = (this.w === value()) ? 1 : 0; }
  public eqlX(value: () => number) { this.x = (this.x === value()) ? 1 : 0; }
  public eqlY(value: () => number) { this.y = (this.y === value()) ? 1 : 0; }
  public eqlZ(value: () => number) { this.z = (this.z === value()) ? 1 : 0; }

  public getOperation(op: string, register: string): Operator {
    switch (op) {
      case 'inp':
        switch (register) {
          case 'w': return this.setW.bind(this);
          case 'x': return this.setX.bind(this);
          case 'y': return this.setY.bind(this);
          case 'z': return this.setZ.bind(this);
          default:
            throw new Error(`${op} : ${register} unexpected register`);
        }
      case 'add':
        switch (register) {
          case 'w': return this.addW.bind(this);
          case 'x': return this.addX.bind(this);
          case 'y': return this.addY.bind(this);
          case 'z': return this.addZ.bind(this);
          default:
            throw new Error(`${op} : ${register} unexpected register`);
        }
      case 'mul':
        switch (register) {
          case 'w': return this.mulW.bind(this);
          case 'x': return this.mulX.bind(this);
          case 'y': return this.mulY.bind(this);
          case 'z': return this.mulZ.bind(this);
          default:
            throw new Error(`${op} : ${register} unexpected register`);
        }
      case 'div':
        switch (register) {
          case 'w': return this.divW.bind(this);
          case 'x': return this.divX.bind(this);
          case 'y': return this.divY.bind(this);
          case 'z': return this.divZ.bind(this);
          default:
            throw new Error(`${op} : ${register} unexpected register`);
        }
      case 'mod':
        switch (register) {
          case 'w': return this.modW.bind(this);
          case 'x': return this.modX.bind(this);
          case 'y': return this.modY.bind(this);
          case 'z': return this.modZ.bind(this);
          default:
            throw new Error(`${op} : ${register} unexpected register`);
        }
      case 'eql':
        switch (register) {
          case 'w': return this.eqlW.bind(this);
          case 'x': return this.eqlX.bind(this);
          case 'y': return this.eqlY.bind(this);
          case 'z': return this.eqlZ.bind(this);
          default:
            throw new Error(`${op} : ${register} unexpected register`);
        }
      default:
        throw new Error(`${op} : ${register} unexpected op`);
    }
  }

}
class Instruction {
  constructor(
    public op: Operator,
    public value: Supplier
  ) {

  }

}
class InstructionBuilder {
  public op: Operator;
  public value: Supplier;
  constructor(
    public line: string,
    public alu: ALU,
    public input: Supplier
  ) {
    // inp w
    // mul x 0
    // add x z
    // mod x 26
    // div z 1
    // add x 13
    var [op, register, value] = line.trim().split(/ /g);
    //console.log(`${op} ${register} ${value}`)
    this.op = alu.getOperation(op, register);
    if (op === 'inp') {
      this.value = this.input;
    } else {
      this.value = this.getSupplier(value);
    }

  }
  getSupplier(value: string) {
    switch (value) {
      case 'w': return this.alu.getW.bind(this.alu);
      case 'x': return this.alu.getX.bind(this.alu);
      case 'y': return this.alu.getY.bind(this.alu);
      case 'z': return this.alu.getZ.bind(this.alu);
      default:
        return () => parseInt(value, 10);
    }
  }
  get() {
    return new Instruction(this.op, this.value);
  }
}

const key = (x: number, y: number) => `${x},${y}`;
const sides = [-1, 1];
const adjacent: { dx: number, dy: number }[] = sides.map(dx => ({ dx, dy: 0 })).concat(sides.map(dy => ({ dx: 0, dy })));

const keyFromState = (state: string[]): string => state.join("-").replace(/[#,\s]/g, '');

class Program {
  public alu: ALU = new ALU();
  private instructions: Instruction[] = [];
  public input: Supplier = () => 0;

  constructor(
    public lines: string[]
  ) {
    this.instructions = lines.map(line => new InstructionBuilder(line, this.alu, this.nextInput.bind(this)).get())
  }
  public nextInput() {
    return this.input();
  }
  public run() {
    this.instructions.forEach(instruction => {
      instruction.op(instruction.value);
    });
    return this.alu.z;
  }
}
class Runner {
  public inputIndex: number = 0;
  public input: number[] = [];
  constructor(
    public program: Program
  ) {

  }
  public nextInput() {
    return this.input[this.inputIndex++];
  }
  public run(input: number, z: number) {
    this.input = [input];
    this.inputIndex = 0;
    this.program.input = this.nextInput.bind(this);
    this.program.alu.w = 0;
    this.program.alu.x = 0;
    this.program.alu.y = 0;
    this.program.alu.z = z;
    this.program.run();

    // console.log(`w: ${this.program.alu.w} x: ${this.program.alu.x} y: ${this.program.alu.y} z: ${this.program.alu.z}`);

    return this.program.alu.z;
  }
}
const parseInput = (rawInput: string) => {
  return rawInput
    .replace(/\r\n/g, '\n')
    .split(/inp w\n/g)
    .map(section => section.split(/\n/g).filter(line => !!line))
    .filter(s => s.length > 1)
    .map(s => ['inp w', ...s])
    .map(s => new Program(s));
}


const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  // var input = 13579246899999;
  var zMap: { [z: string]: number } = { 0: 0 }
  var remaining = input.length;
  for (var prog of input) {
    var zMapCopy = { ...zMap };
    var runner = new Runner(prog);
    var prune = 26 ** remaining;
    remaining--;
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`prune :${prune.toFixed(0).padStart(20)} ${(elapsed() / 1000).toFixed(3).padStart(10)}s  ${(Math.round(used * 100) / 100).toFixed(2).padStart(8)} MB ${Object.keys(zMap).length.toFixed(0).padStart(10)}`);
    zMap = {}
    for (var i = 9; i > 0; i--) {
      for (var prev of Object.entries(zMapCopy)) {
        var [zPrev, prefix] = prev;
        var z = runner.run(i, parseInt(zPrev, 10));
        if (z < prune) {
          if (!zMap[z]) {
            zMap[z] = prefix * 10 + i;
          }
        }
      }
    }
  }
  console.log(zMap['0']);
  return zMap['0'];
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  // var input = 13579246899999;
  var zMap: { [z: string]: number } = { 0: 0 }
  var remaining = input.length;
  for (var prog of input) {
    var zMapCopy = { ...zMap };
    var runner = new Runner(prog);
    var prune = 26 ** remaining;
    remaining--;
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`prune :${prune.toFixed(0).padStart(20)} ${(elapsed() / 1000).toFixed(3).padStart(10)}s  ${(Math.round(used * 100) / 100).toFixed(2).padStart(8)} MB ${Object.keys(zMap).length.toFixed(0).padStart(10)}`);
    zMap = {}
    for (var i = 1; i < 10; i++) {
      for (var prev of Object.entries(zMapCopy)) {
        var [zPrev, prefix] = prev;
        var z = runner.run(i, parseInt(zPrev, 10));
        if (z < prune) {
          if (!zMap[z]) {
            zMap[z] = prefix * 10 + i;
          }
        }
      }
    }
  }
  console.log(zMap['0']);
  return zMap['0'];
};

const testInput = `
`;
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
