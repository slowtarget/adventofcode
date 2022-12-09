import run from "aocrunner";
import * as Logger from "bunyan";

const log = Logger.createLogger({ name: "2021 day4", level: "warn" });
type Rules = { [key: string]: Rule };
type Evaluation = {evaluation: (Rule)[] , alternate?: (Rule)[]};
type Resolution = string[];
interface Rule {
  resolve(): string[];
  getId(): string;
  evaluate(rules: Rules): Evaluation;
  get(rules: Rules): Evaluation ;
}
class BaseRule implements Rule {
  public evaluated:boolean = false;
  constructor(private id: string) { }
  protected ruleKeys: string[] = [];
  protected letter?: string;
  protected evaluation: Evaluation = {evaluation:[]}; 
  protected resolution: string[] = [];

  getId(): string {
    return this.id;
  }
  evaluate(rules: Rules): Evaluation {
    throw new Error("Method not implemented.");
  }
  get(rules: Rules):Evaluation {
    this.evaluation = this.evaluated ?  this.evaluation : this.evaluate(rules);
    this.evaluated = true;
    return this.evaluation;
  }
  resolve(): string[] {
    if (this.letter) {
      return [this.letter];
    }
    const evaluated = this.evaluation.evaluation
        .map(rule => rule.resolve())
        .reduce((p, c) => {
          return p.map(prefix => {
            return c.map(suffix => prefix + suffix);
          }).flat();
        },[""] );
        const alternate = (this.evaluation.alternate ?? [])
        .map(rule => rule.resolve())
        .reduce((p, c) => {
          return p.map(prefix => {
            return c.map(suffix => prefix + suffix);
          }).flat();
        },[""] );
    return [...evaluated, ...alternate];
  }
}

class LetterRule extends BaseRule {
  constructor( id: string, letter: string) {
    super(id)
    this.letter = letter;
   }
  evaluate() {return {evaluation:[this]}}
}
class PairRule extends BaseRule {
  rule1(rule1: any, arg1: number) {
    throw new Error("Method not implemented.");
  }
  rule2(rule2: any, arg1: number) {
    throw new Error("Method not implemented.");
  }
  constructor( id: string,  rule1: string,  rule2: string) {
    super(id);
    this.ruleKeys = [rule1, rule2];
   }
  evaluate(rules: Rules) {
    return {evaluation:this.ruleKeys.map(key => rules[key])};
  }
}
class EitherPairRule extends BaseRule {
  constructor(id: string, private pair1: PairRule, private pair2: PairRule) {
    super(id);
   }
  evaluate(rules: Rules) {
    return {evaluation: [this.pair1], alternate: [this.pair2]};
  }
}
class SingleRule extends BaseRule {
  constructor(id: string, private ruleId: string) {  super(id);}
  evaluate(rules: Rules) {
    return {evaluation: [rules[this.ruleId]]};
  }
}
class TripletRule extends BaseRule {
  constructor(id: string, private rule1: string, private rule2: string,  private rule3: string) { super(id); }
  evaluate(rules: Rules) {
    return {evaluation: [rules[this.rule1],rules[this.rule2],rules[this.rule3]]};
  }
}
const parseInput = (rawInput: string) => {
  const [rulesInput, messages] = rawInput
    .replace(/\r\n/g, '\n')
    .split(/\n\n/g).map(section => section.split(/\n/g).map(line=>line.trim()));
  const regex = /^(\d+): (?:"(\w)"|(?:(\d+) (\d+))|(?:(\d+) (\d+) \| (\d+) (\d+))|(\d+)|(?:(\d+) (\d+) (\d+)))$/

  let rules: Rules = {};

  const rulesList = rulesInput.map(ruleInput => {
    let matches = regex.exec(ruleInput);
    if (matches == null) {
      throw new Error(`null! could not parse ${ruleInput}`)
    }
    let [, id, letter, p1, p2, e1, e2, f1, f2, x1, t1, t2, t3] = matches;
    if (letter !== undefined) {
      return new LetterRule(id, letter)
    } else if (p1 !== undefined) {
      return new PairRule(id, p1, p2);
    } else if (e1 !== undefined) {
      const ruleA = new PairRule(`${id}_a`, e1, e2);
      const ruleB = new PairRule(`${id}_b`, f1, f2);
      return [new EitherPairRule(id, ruleA, ruleB ), ruleA, ruleB];
    } else if (x1 !== undefined) {
      return new SingleRule(id, x1)
    } else if (t1 !== undefined) {
      return new TripletRule(id, t1, t2, t3);
    } else {
      throw new Error(`could not parse ${ruleInput} : ${matches}`)
    }
  }).flat();
  rulesList.forEach(rule => {
    rules[rule.getId()] = rule ;
  });
  
  
  rulesList.forEach(rule => {
    rule.get(rules);
  });

  return { rules, messages };
}
// return an array of possibles
class RulesEngine {

  constructor(public rules: Rules, public message: string) { }
  public valid: string[] = [];

}


const part1 = (rawInput: string) => {
  const { rules, messages } = parseInput(rawInput);
  const allValid = rules["0"].resolve();
  console.log({allValid});
  return messages.filter(message => allValid.includes(message)).length;
};

const part2 = (rawInput: string) => {
  const { rules, messages } = parseInput(rawInput);

  return 0;
};

const testInput = `
0: 4 1 5
1: 2 3 | 3 2
2: 4 4 | 5 5
3: 4 5 | 5 4
4: "a"
5: "b"

ababbb
bababa
abbbab
aaabbb
aaaabbb`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 2,
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
  // onlyTests: true,
});
