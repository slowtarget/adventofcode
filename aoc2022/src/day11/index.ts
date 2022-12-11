import run from "aocrunner";
const op: Record<string, (value: number, previous: number) => number> = {
  "+": (value: number, previous: number) => previous + value,
  "*": (value: number, previous: number) => previous * value,
};
class Item {
  constructor(public worry: number) {}
}
class Monkey {
  public inspections: number = 0;
  public operation: (old: number) => number;
  public trueTarget?: Monkey;
  public falseTarget?: Monkey;
  public test?: (value: number) => Monkey;
  public items: Item[];
  constructor(
    public id: number,
    private starts: number[],
    public operator: string,
    public value: string,
    public testModulus: number,
    public trueId: number,
    public falseId: number,
  ) {
    console.log(`Monkey constructor ${this.id}`);
    switch (this.operator) {
      case "+":
        if (this.value === "old") {
          this.operation = (old: number) => old + old;
        } else {
          this.operation = (old: number) => old + Number(this.value);
        }
        break;
      case "*":
        if (this.value === "old") {
          this.operation = (old: number) => old * old;
        } else {
          this.operation = (old: number) => old * Number(this.value);
        }
        break;
      default:
        throw new Error(`unrecognized operation ${this.operator}`);
    }
    this.items = this.starts.map((s) => new Item(s));
  }
  turn() {
    while (this.items.length) {
      const item = this.inspect();
      item.worry = this.operation(item.worry);
      item.worry = Math.floor(item.worry / 3);
      this.test!(item.worry).catch(item);
    }
  }
  turn2(lcm: number) {
    while (this.items.length) {
      const item = this.inspect();
      item.worry = this.operation(item.worry);
      if (item.worry > lcm) {
        item.worry = (item.worry % lcm) + lcm;
      }
      this.test!(item.worry).catch(item);
    }
  }
  inspect() {
    this.inspections++;
    return this.items.shift()!;
  }
  catch(item: Item) {
    this.items.push(item);
  }
}
class Business {
  public monkeyMap: Record<number, Monkey>;
  public lcm: number;
  constructor(public monkeys: Monkey[]) {
    this.monkeyMap = {};
    monkeys.forEach((m) => (this.monkeyMap[m.id] = m));
    monkeys.forEach((m) => {
      m.trueTarget = this.monkeyMap[m.trueId];
      m.falseTarget = this.monkeyMap[m.falseId];
      m.test = (value: number) => {
        return value % m.testModulus === 0 ? m.trueTarget! : m.falseTarget!;
      };
    });
    this.lcm = monkeys.map((m) => m.testModulus).reduce((p, c) => p * c, 1);
  }
  round() {
    this.monkeys.forEach((m) => m.turn());
  }
  round2() {
    this.monkeys.forEach((m) => m.turn2(this.lcm));
  }
  toString() {
    return this.monkeys
      .map((m) => {
        return `Monkey ${m.id}: ${m.items.map((i) => i.worry).join(", ")}`;
      })
      .join("\n");
  }
}
const parseInput = (rawInput: string) => {
  return new Business(
    rawInput
      .replace(/\r\n/g, "\n")
      .split(/\n\n/g)
      .map((monkeyGroup) => {
        const [
          idLine,
          startingLine,
          operationLine,
          testLine,
          trueLine,
          falseLine,
        ] = monkeyGroup.split(/\n/g);
        const [, id] = /^Monkey (\d+):/.exec(idLine) ?? [];
        const [, startsGroup] =
          /^\s*Starting items:(.*)/g.exec(startingLine) ?? [];
        const starts = startsGroup
          .split(/,/g)
          .map((s) => s.trim())
          .map(Number);
        const [, operation, value] =
          /^\s*Operation: new = old (.) (\d+|old)/.exec(operationLine) ?? [];
        const [, test] = /^\s*Test: divisible by (\d+)/.exec(testLine) ?? [];
        const [, trueId] =
          /^\s*If true: throw to monkey (\d+)/.exec(trueLine) ?? [];
        const [, falseId] =
          /^\s*If false: throw to monkey (\d+)/.exec(falseLine) ?? [];
        return new Monkey(
          Number(id),
          starts.map(Number),
          operation,
          value,
          Number(test),
          Number(trueId),
          Number(falseId),
        );
      }),
  );
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput)!;
  for (let i = 0; i < 20; i++) {
    input.round();
    // console.log(`After round ${i+1} the monkeys...\n${input.toString()}`);
  }
  console.log(input.monkeys.map((m) => m.inspections).sort((a, b) => b - a));
  return input.monkeys
    .map((m) => m.inspections)
    .sort((a, b) => b - a)
    .slice(0, 2)
    .reduce((p, c) => p * c, 1);
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput)!;
  for (let i = 0; i < 10000; i++) {
    input.round2();
    // console.log(`After round ${i+1} the monkeys...\n${input.toString()}`);
  }
  console.log(input.monkeys.map((m) => m.inspections).sort((a, b) => b - a));
  return input.monkeys
    .map((m) => m.inspections)
    .sort((a, b) => b - a)
    .slice(0, 2)
    .reduce((p, c) => p * c, 1);
};

const testInput = `
Monkey 0:
  Starting items: 79, 98
  Operation: new = old * 19
  Test: divisible by 23
    If true: throw to monkey 2
    If false: throw to monkey 3

Monkey 1:
  Starting items: 54, 65, 75, 74
  Operation: new = old + 6
  Test: divisible by 19
    If true: throw to monkey 2
    If false: throw to monkey 0

Monkey 2:
  Starting items: 79, 60, 97
  Operation: new = old * old
  Test: divisible by 13
    If true: throw to monkey 1
    If false: throw to monkey 3

Monkey 3:
  Starting items: 74
  Operation: new = old + 3
  Test: divisible by 17
    If true: throw to monkey 0
    If false: throw to monkey 1
`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 10605,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 2713310158,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  // onlyTests: true,
});
