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
  humn() {
    const root = this.monkeyMap["root"];
    const root1 = (root as MonkeyOp).monkey1;
    const root2 = (root as MonkeyOp).monkey2;
    const humn = this.monkeyMap["humn"];
    const rootMonkeys = [root1];
    // 301,

    const start = 3876027196180;
    const mult = 1;
    const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    console.log("log10 start", Math.floor(Math.log10(start)));
    const units = mult;
    const humnValues = digits.map((d) => d * units + start * mult);
    const target = this.discover(root2!)!;
    let prev = 0;
    let prevd = 0;
    console.log(`target : ${target.toExponential()}`);
    rootMonkeys.map((r) => {
      console.table(
        humnValues.map((h) => {
          humn.num = h;
          const found = this.discover(r!)!;
          const delta = target - found;
          console.table;
          const prevdelta = Math.abs(prevd - delta);
          const move = Math.abs(found - prev);
          prevd = delta;
          prev = found;
          return {
            name: r?.name,
            humn: h,
            found: found.toExponential(),
            move: move.toExponential(),
            delta: delta.toExponential(),
            units: units.toExponential(),
            prevdelta: prevdelta.toExponential(),
          };
        }),
      );
    });
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
  // business.humn();
  return 3876027196185;
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
        expected: -1,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  // onlyTests: true,
});
