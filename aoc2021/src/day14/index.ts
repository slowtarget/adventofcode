import run from "aocrunner";
const unique = <T extends Object>(value: T, index: number, self: T[]) => {
  var first = self.findIndex(p => p.toString() === value.toString());
  return first === index;
}
class Counter {
  private count: { [key: string]: number } = {};
  inc(key: string, value: number) {
    if (this.count[key]) {
      this.count[key] += value;
    } else {
      this.count[key] = value;
    }
  }
  dec(key: string, value: number) {
    if (!this.count[key] || this.count[key] < value) {
      throw new Error(`cannot decrement! ${key}:${value} => ${this.count[key]}`);
    }
    this.count[key] -= value;
  }
  max() {
    return Math.max(...Object.values(this.count));
  }
  min() {
    return Math.min(...Object.values(this.count));
  }
  range() {
    return this.max() - this.min();
  }
  set(count: { [key: string]: number }) {
    this.count = { ...count };
  }
  get() {
    return this.count;
  }
  clone() {
    var copy = new Counter();
    copy.set(this.count);
    return copy;
  }
}
class Polymer {
  public elements: Counter = new Counter();
  public pairs: Counter = new Counter();
  constructor(
    public state: string
  ) {
    this.state.split('').forEach((e, i, self) => {
      this.elements.inc(e, 1);
      if (i !== 0) {
        var pair = `${self[i - 1]}${e}`;
        this.pairs.inc(pair, 1);
      }
    });
  }
  step(rules:Rules) {
    Object.entries(this.pairs.get()).forEach(([pair, count]) => {
      if (count > 0) {
        var insert = rules[pair];
        if (insert) {
          this.pairs.inc(pair[0] + insert, count);
          this.pairs.inc(insert + pair[1], count);
          this.pairs.dec(pair, count);
          this.elements.inc(insert, count);
        }
      }
    })
  }
  public clone(): Polymer {
    var copy = new Polymer('');
    copy.state = this.state;
    copy.elements = this.elements.clone();
    copy.pairs = this.pairs.clone();
    return copy;
  }

  result() {
    return this.elements.range();
  }
}
class Rule {
  public pair: string;
  public insert: string;
  constructor(
    public input: string
  ) {
    [this.pair, this.insert] = input.split(' -> ');
  }

  public clone(): Rule {
    return new Rule(this.input);
  }
}

type Rules = {
  [index: string]: string
}
class Puzzle {
  private ruleMap: Rules;

  constructor(
    public polymer: Polymer,
    public rules: Rule[]

  ) {
    this.ruleMap = rules.reduce((p, c) => ({ ...p, [c.pair]: c.insert }), {});
  }

  public clone(): Puzzle {
    return new Puzzle(this.polymer.clone(), this.rules.map(rule => rule.clone()));
  }

  public solve(steps: number): number {

    for (var step = 0; step < steps; step++) {
      this.polymer.step(this.ruleMap);
    }
    return this.polymer.result();
  }
}

const parseInput = (rawInput: string) => {
  var [template, rules] = rawInput
    .replace(/\r\n/g, '\n')
    .split(/\n\n/g);

  return new Puzzle(new Polymer(template), rules.split(/\n/).map(rule => new Rule(rule)));;
}

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  return input.solve(10);
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  return input.solve(40);
};

const testInput = `
NNCB

CH -> B
HH -> N
CB -> H
NH -> C
HB -> C
HC -> B
HN -> C
NN -> C
BH -> H
NC -> B
NB -> B
BN -> B
BB -> N
BC -> B
CC -> N
CN -> C`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 1588,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 2188189693529,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
