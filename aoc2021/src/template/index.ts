import run from "aocrunner";
class Polymer {
  public pairs: {[pair:string]:number} = {};
  public elements: {[element:string]:number} = {};
  constructor(
    public state: string
  ) { }

  public incElement(element:string, value:number) {
    if (this.elements[element]) {
      this.elements[element] += value;
    } else {
      this.elements[element] = value;
    }
  }

  public incPair(pair:string, value:number) {
    if (this.pairs[pair]) {
      this.pairs[pair] += value;
    } else {
      this.pairs[pair] = value;
    }
  }

  public decPair(pair:string, value:number) {
    if (!this.pairs[pair] || this.pairs[pair] < value) {
      throw new Error(`unexpected decrement ${pair} ${value}`);
    }
    this.pairs[pair] -= value;
  }

  max() {
    return Math.max(...Object.values(this.elements));
  }
  min() {
    return Math.min(...Object.values(this.elements));
  }

  public clone(): Polymer {
    var copy = new Polymer(this.state);
    copy.elements = {...this.elements};
    copy.pairs = {...this.pairs};
    return copy;
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

type Count = { [pair: string]: number[] };
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

  public solve(steps:number): number {
    var input = this.polymer.state;
    var step = 0;
    input.split('').map((char, i) => {
      this.polymer.incElement(char,1);
      if (i === 0) {
        return undefined;
      } else {
        return `${input[i - 1]}${char}`;
      }
    }).filter(a => !!a)
      .map(a=>a||'XX')
      .forEach(pair => this.polymer.incPair(pair,1));

    for (step = 1; step < steps; step++) {
      var next = this.polymer.clone();
      Object.entries(this.polymer.pairs).forEach(([pair, count]) => {
        var insert = this.ruleMap[pair];
        if (insert) {
          next.incElement(insert,count);
          next.incPair(pair[0] + insert, count);
          next.incPair(insert + pair[0], count);
          next.decPair(pair, count);
        }
      })
      this.polymer = next;
    }

    return this.polymer.max() - this.polymer.min();
  }

  private getInsert(pair: string) {
    return this.ruleMap[pair] || "";
  }
}
const parseInput = (rawInput: string) => {

  var [template, rules] = rawInput
    .replace(/\r\n/g, '\n')
    .split(/\n\n/g);

  return new Puzzle(new Polymer(template), rules.split(/\n/).map(rule => new Rule(rule)));
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
        expected: 0,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
