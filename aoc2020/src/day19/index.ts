import run from "aocrunner";
import * as Logger from "bunyan";

var log = Logger.createLogger({ name: "2021 day4", level: "warn" });
type Rules = { [key: string]: Rule };
interface Rule {
  getId(): string;
}
class LetterRule implements Rule {
  constructor(public id: string, public letter: string) { }
  getId(): string { return this.id; }
}
class PairRule implements Rule {
  constructor(public id: string, public rule1: string, public rule2: string) { }
  getId(): string { return this.id; }
}
class EitherPairRule implements Rule {
  constructor(public id: string, public pair1: PairRule, public pair2: PairRule) { }
  getId(): string { return this.id; }
}
class SingleRule implements Rule {
  constructor(public id: string, public ruleId: string) { }
  getId(): string { return this.id; }
}
class TripletRule implements Rule {
  constructor(public id: string, public rule1: string,  public rule2: string,  public rule3: string) { }
  getId(): string { return this.id; }
}
const parseInput = (rawInput: string) => {
  const [rulesInput, messages] = rawInput
    .replace(/\r\n/g, '\n')
    .split(/\n\n/g).map(section => section.split(/\n/g).map(line=>line.trim()));
  const regex = /^(\d+): (?:"(\w)"|(?:(\d+) (\d+))|(?:(\d+) (\d+) \| (\d+) (\d+))|(\d+)|(?:(\d+) (\d+) (\d+)))$/

  var rules: Rules = {};

  rulesInput.map(ruleInput => {
    var matches = regex.exec(ruleInput);
    if (matches == null) {
      throw new Error(`null! could not parse ${ruleInput}`)
    }
    var [, id, letter, p1, p2, e1, e2, f1, f2, x1, t1, t2, t3] = matches;
    if (letter !== undefined) {
      return new LetterRule(id, letter)
    } else if (p1 !== undefined) {
      return new PairRule(id, p1, p2);
    } else if (e1 !== undefined) {
      return new EitherPairRule(id, new PairRule(`${id}_a`, e1, e2), new PairRule(`${id}_a`, f1, f2));
    } else if (x1 !== undefined) {
      return new SingleRule(id, x1)
    } else if (t1 !== undefined) {
      return new TripletRule(id, t1, t2, t3);
    } else {
      throw new Error(`could not parse ${ruleInput} : ${matches}`)
    }
  }).forEach(rule => {
    rules[rule.getId()] = rule;
  });

  Object.values(rules).filter(rule=>rule instanceof EitherPairRule).forEach(ep=>{
    if (ep instanceof EitherPairRule) {
      rules[ep.pair1.getId()] = ep.pair1;
      rules[ep.pair2.getId()] = ep.pair2;
    }
  });

  return { rules, messages };
}
// return an array of possibles
class RulesEngine {
  constructor(public rules: Rules, public message: string) { }

  validate() {
    return this.buildTargetFromRule("0", 0).includes(this.message);
  }

  buildTargetFromRule(ruleId: string, depth: number): string[] {
    var rule = this.rules[ruleId];
    if (rule instanceof LetterRule) {
      return [`${rule.letter}`];
    } else if (rule instanceof PairRule) {
      var rule1s = this.buildTargetFromRule(rule.rule1, depth + 1);
      var rule2s = this.buildTargetFromRule(rule.rule2, depth + 1);
      return rule1s.map(rule1 => rule2s.map(rule2 => `${rule1}${rule2}`)).flatMap(a => a);
    } else if (rule instanceof EitherPairRule) {
      return [this.buildTargetFromRule(rule.pair1.getId(), depth + 1), this.buildTargetFromRule(rule.pair2.getId(), depth + 1)].flatMap(a => a);
    } else if (rule instanceof SingleRule) {
      return [this.buildTargetFromRule(rule.ruleId, depth + 1)].flatMap(a => a);
    } else if (rule instanceof TripletRule) {
      rule1s = this.buildTargetFromRule(rule.rule1, depth + 1);
      rule2s = this.buildTargetFromRule(rule.rule2, depth + 1);
      var rule3s = this.buildTargetFromRule(rule.rule3, depth + 1);
      return rule1s.map(rule1 => rule2s.map(rule2 => rule3s.map(rule3=>`${rule1}${rule2}${rule3}`))).flatMap(a => a).flatMap(a => a);
    } else {
      log.error({rule},'invalid rule type');
      throw new Error(`invalid rule type ${rule} ${ruleId}`);
    }
  }
}

const isValidForRule0 = (rules: Rules, message: string) => {
  return new RulesEngine(rules, message).validate();
}
const part1 = (rawInput: string) => {
  const { rules, messages } = parseInput(rawInput);
  return messages.filter(message => isValidForRule0(rules, message)).length;
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
  onlyTests: true,
});
