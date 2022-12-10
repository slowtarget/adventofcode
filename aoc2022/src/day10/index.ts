import run from "aocrunner";
const fullBlock = String.fromCharCode(0xfeff2588);

const parseInput = (rawInput: string) => {
  return rawInput
    .replace(/\r\n/g, "\n")
    .split(/\n/g)
    .map((line) => {
      const [operation, value] = line.split(" ");
      return { operation, value: Number(value) };
    });
};

class Register {
  public x: number = 1;
  constructor() {}
  add(val: number) {
    this.x += val;
  }
}
class Op {
  public ticks: number = 0;

  tick(): void {
    this.ticks++;
  }
  finishExecution(): void {
    throw new Error("not implemented");
  }
  isComplete(): boolean {
    throw new Error("not implemented");
  }
}
class Noop extends Op {
  public ticks: number = 0;
  constructor() {
    super();
  }

  // Override
  finishExecution() {}

  // Override
  isComplete() {
    return this.ticks === 1;
  }
}
class Addx extends Op {
  constructor(public val: number, public x: Register) {
    super();
  }
  // Override
  finishExecution() {
    this.x.add(this.val);
  }
  // Override
  isComplete() {
    return this.ticks === 2;
  }
}
class OpFactory {
  public op: Op;
  constructor(operation: string, value: number, x: Register) {
    switch (operation) {
      case "noop":
        this.op = new Noop();
        break;
      case "addx":
        this.op = new Addx(value, x);
        break;
      default:
        throw new Error(`unknown operation ${operation}`);
    }
  }
}
const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  let cycle = 1;
  let x = new Register();
  let i = 0;
  let sum = 0;
  let measure = (cycle: number) => (cycle - 20) % 40 === 0;
  let { operation, value } = input[i];
  let op: Op | undefined = new OpFactory(operation, value, x).op;

  while (op) {
    if (measure(cycle)) {
      sum += cycle * x.x;
    }
    op.tick();
    if (op.isComplete()) {
      op.finishExecution();
      i++;
      if (i < input.length) {
        const { operation: nextOperation, value: nextValue } = input[i];
        op = new OpFactory(nextOperation, nextValue, x).op;
      } else {
        op = undefined;
      }
    }
    cycle++;
  }

  return sum;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  let cycle = 1;
  let x = new Register();
  let i = 0;
  let screen: string[][] = [];
  let getRow = (cycle: number) => Math.floor((cycle - 1) / 40);
  let getCol = (cycle: number) => (cycle - 1) % 40;
  let getPixel = (col: number, x: number) =>
    Math.abs(col - x) < 2 ? fullBlock : " ";
  let { operation, value } = input[i];
  let op: Op | undefined = new OpFactory(operation, value, x).op;

  while (op) {
    const col = getCol(cycle);
    const row = getRow(cycle);
    screen[row] = screen[row] || [];
    screen[row][col] = getPixel(col, x.x);

    op.tick();
    if (op.isComplete()) {
      op.finishExecution();
      i++;
      if (i < input.length) {
        const { operation: nextOperation, value: nextValue } = input[i];
        op = new OpFactory(nextOperation, nextValue, x).op;
      } else {
        op = undefined;
      }
    }
    cycle++;
  }

  return screen.map((line) => line.join("")).join("\n");
  // "PBZGRAZA";
};

const testInput = `
addx 15
addx -11
addx 6
addx -3
addx 5
addx -1
addx -8
addx 13
addx 4
noop
addx -1
addx 5
addx -1
addx 5
addx -1
addx 5
addx -1
addx 5
addx -1
addx -35
addx 1
addx 24
addx -19
addx 1
addx 16
addx -11
noop
noop
addx 21
addx -15
noop
noop
addx -3
addx 9
addx 1
addx -3
addx 8
addx 1
addx 5
noop
noop
noop
noop
noop
addx -36
noop
addx 1
addx 7
noop
noop
noop
addx 2
addx 6
noop
noop
noop
noop
noop
addx 1
noop
noop
addx 7
addx 1
noop
addx -13
addx 13
addx 7
noop
addx 1
addx -33
noop
noop
noop
addx 2
noop
noop
noop
addx 8
noop
addx -1
addx 2
addx 1
noop
addx 17
addx -9
addx 1
addx 1
addx -3
addx 11
noop
noop
addx 1
noop
addx 1
noop
noop
addx -13
addx -19
addx 1
addx 3
addx 26
addx -30
addx 12
addx -1
addx 3
addx 1
noop
noop
noop
addx -9
addx 18
addx 1
addx 2
noop
noop
addx 9
noop
noop
noop
addx -1
addx 2
addx -37
addx 1
addx 3
noop
addx 15
addx -21
addx 22
addx -6
addx 1
noop
addx 2
addx 1
noop
addx -10
noop
noop
addx 20
addx 1
addx 2
addx 2
addx -6
addx -11
noop
noop
noop
`;
const testInput20 = `
addx 15
addx -11
addx 6
addx -3
addx 5
addx -1
addx -8
addx 13
addx 4
noop
addx -1`;
run({
  part1: {
    tests: [
      {
        input: testInput20,
        expected: 420,
      },
      {
        input: testInput,
        expected: 13140,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: `##..##..##..##..##..##..##..##..##..##..
###...###...###...###...###...###...###.
####....####....####....####....####....
#####.....#####.....#####.....#####.....
######......######......######......####
#######.......#######.......#######.....`
          .replace(/#/g, fullBlock)
          .replace(/\./g, " "),
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  // onlyTests: true,
});
