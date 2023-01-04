import run from "aocrunner";

type Op = (a: number, b: number) => number;
const getOp = (operation: string): Op =>  {
  switch (operation) {
    case "+":
      return (a: number, b:number) => a + b;
    case "-":
      return (a: number, b:number) => a - b;
    case "/":
      return (a: number, b:number) => a / b;
    case "*":
      return (a: number, b:number) => a * b;
    default:
      throw new Error(`unrecognised operation : ${operation}`);
  }
}

class Monkey {
  public num?: number;
  public resolved: boolean = false;
  constructor(
    public id: number,
    public name: string
    ) {}
  get(): number {
    throw new Error("not implemented");
  }
}
class MonkeyNum extends Monkey {
  constructor(id:number, name: string, num: number) {
    super(id, name);
    this.num = num;
    this.resolved = true;
  }
  get(): number {
    if (this.num === undefined) {
      throw new Error("num undefined on MonkeyNum");
    }
    return this.num;
  }
}
class MonkeyOp extends Monkey {
  public monkey1?: Monkey;
  public monkey2?: Monkey;
  public op: Op;
  constructor(
    id: number,
    name: string,
    operation: string,
    public first: string,
    public second: string,
  ) {
    super(id, name);
    this.op = getOp(operation);
  }

  get(): number {
    if (this.monkey1 === undefined) {
      throw new Error("monkey1 undefined on MonkeyOp");
    }
    if (this.monkey2 === undefined) {
      throw new Error("monkey2 undefined on MonkeyOp");
    }
    return this.op(this.monkey1.get(), this.monkey2.get());
  }
}
class Business {
  public monkeyMap: Record<string, Monkey>;
  constructor(public monkeys: Monkey[]) {
    this.monkeyMap = {};
    monkeys.forEach((m) => (this.monkeyMap[m.name] = m));
    monkeys.forEach((m) => {
      if (!m.resolved && m instanceof MonkeyOp) {
        m.monkey1 = this.monkeyMap[m.first];
        m.monkey2 = this.monkeyMap[m.second];
      }
    });
  }

  root() {
    const root = this.monkeyMap["root"];
    return root.get();
  }

  getLeftFor(humnValue: number, humn: Monkey, rootMonkey: Monkey) {
    humn.num = humnValue;
    return rootMonkey.get();
  }

  humn() {
    const root = this.monkeyMap["root"];
    const rootLeft = (root as MonkeyOp).monkey1!;
    const rootRight = (root as MonkeyOp).monkey2!;
    const humn = this.monkeyMap["humn"];

    const target = rootRight.get();

    let low = Number.MIN_SAFE_INTEGER;
    let high = Number.MAX_SAFE_INTEGER;

    let loValue = this.getLeftFor(low, humn, rootLeft)! - target;
    let hiValue = this.getLeftFor(high, humn, rootLeft)! - target;

    if (loValue > 0 ) {
      let swap = loValue;
      loValue = hiValue;
      hiValue = swap;
      swap = low;
      low = high;
      high = swap;
    }

    if ((loValue < 0 && hiValue < 0) || (loValue > 0 && hiValue > 0)) {
        throw new Error(`\nta: ${target}\nlo: ${low} ${loValue} \nhi: ${high} ${hiValue} are both the same side of zero...`)
    }

    let loops = 0;
    while (low !== high && loops < 100) {
      let guess = Math.floor((high + low)/2);
      let guessValue = this.getLeftFor(guess, humn, rootLeft)! - target;
      // console.log({loops, guess, guessValue});

      if (guessValue === 0) {
        return guess;
      } 

      if (guessValue > 0) {
        high = guess;
      } else {
        low = guess;
      }

      loops ++;
    }
    return low;
  }
}
const parseInput = (rawInput: string) => {
  return new Business(
    rawInput
      .replace(/\r\n/g, "\n")
      .split(/\n/g)
      .map((line, id) => {
        const [name, job] = line.split(/: /);
        const [first, operation, second] = job.split(/ /);
        if (operation) {
          return new MonkeyOp(id, name, operation, first, second);
        } else {
          return new MonkeyNum(id, name, Number(first));
        }
      }),
  );
};

let business: Business;
const part1 = (rawInput: string) => {
  business = parseInput(rawInput);
  return business.root();
};

const part2 = (rawInput: string) => {
  return business.humn();
};

const testInput = `
root: pppw + sjmn
dbpl: 5
cczh: sllz + lgvd
zczc: 2
ptdq: humn - dvpt
dvpt: 3
lfqf: 4
humn: 5
ljgn: 2
sjmn: drzm * dbpl
sllz: 4
pppw: cczh / lfqf
lgvd: ljgn * ptdq
drzm: hmdt - zczc
hmdt: 32
`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 152,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 301,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  // onlyTests: true,
});
