import run from "aocrunner";
class Op {
  constructor(public first: number, public second: number) {}
  op(): number {
    throw new Error("not implemented");
  }
}
class Plus extends Op {
  constructor(first: number, second: number) {
    super(first, second);
  }
  op() {
    return this.first + this.second;
  }
}
class Minus extends Op {
  constructor(first: number, second: number) {
    super(first, second);
  }
  op() {
    return this.first - this.second;
  }
}
class Divide extends Op {
  constructor(first: number, second: number) {
    super(first, second);
  }
  op() {
    return this.first / this.second;
  }
}
class Multiply extends Op {
  constructor(first: number, second: number) {
    super(first, second);
  }
  op() {
    return this.first * this.second;
  }
}
class OpFactory {
  constructor(
    public operation: string,
    public first: number,
    public second: number,
  ) {}
  get() {
    switch (this.operation) {
      case "+":
        return new Plus(this.first, this.second);
      case "-":
        return new Minus(this.first, this.second);
      case "/":
        return new Divide(this.first, this.second);
      case "*":
        return new Multiply(this.first, this.second);
    }
  }
}
class Monkey {
  public num?: number;
  public resolved: boolean = false;
  constructor(public name: string) {}
}
class MonkeyNum extends Monkey {
  constructor(name: string, num: number) {
    super(name);
    this.num = num;
    this.resolved = true;
  }
}
class MonkeyOp extends Monkey {
  public monkey1?: Monkey;
  public monkey2?: Monkey;
  constructor(
    name: string,
    public op: string,
    public first: string,
    public second: string,
  ) {
    super(name);
  }
  resolve(): boolean {
    if (this.monkey1?.resolved && this.monkey2?.resolved) {
      const op = new OpFactory(
        this.op,
        this.monkey1.num!,
        this.monkey2.num!,
      ).get();
      this.num = op?.op();
      this.resolved = true;
      return true;
    }
    return false;
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
    return this.discover(root);
  }
  discover(root: Monkey) {
    const stack: Monkey[] = [];
    this.monkeys
      .filter((m) => m instanceof MonkeyOp)
      .forEach((m) => (m.resolved = false));
    stack.push(root);
    while (stack.length) {
      const m = stack.pop();
      if (m && !m.resolved && m instanceof MonkeyOp) {
        if (!m.resolve()) {
          stack.push(m);
          if (!m.monkey1?.resolved) {
            stack.push(m.monkey1!);
          }
          if (!m.monkey2?.resolved) {
            stack.push(m.monkey2!);
          }
        }
      }
    }
    return root.num;
  }
  getLeftFor(humnValue: number, humn: Monkey, rootMonkey: Monkey) {
    humn.num = humnValue;
    return this.discover(rootMonkey);
  }

  humn() {
    const root = this.monkeyMap["root"];
    const rootLeft = (root as MonkeyOp).monkey1!;
    const rootRight = (root as MonkeyOp).monkey2!;
    const humn = this.monkeyMap["humn"];

    const target = this.discover(rootRight)!;

    let found = false;

    let low = 0;
    let high = 999999999999999;

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
    while (!found && loops < 100) {
      let guess = Math.floor((high + low)/2);
      let guessValue = this.getLeftFor(guess, humn, rootLeft)! - target;
      console.log({loops, guess, guessValue});

      if (guessValue === 0) {
        return guess;
      } 

      if (guessValue > 0) {
        high = guess
      } else {
        low = guess
      }
      loops ++;
    }
  }
}
const parseInput = (rawInput: string) => {
  return new Business(
    rawInput
      .replace(/\r\n/g, "\n")
      .split(/\n/g)
      .map((line) => {
        const [name, job] = line.split(/: /);
        const [first, operation, second] = job.split(/ /);
        if (operation) {
          return new MonkeyOp(name, operation, first, second);
        } else {
          return new MonkeyNum(name, Number(first));
        }
      }),
  );
};

const part1 = (rawInput: string) => {
  const business = parseInput(rawInput);

  return business.root();
};

const part2 = (rawInput: string) => {
  const business = parseInput(rawInput);
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
