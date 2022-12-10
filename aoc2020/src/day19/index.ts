import run from "aocrunner";
import * as Logger from "bunyan";

const log = Logger.createLogger({ name: "2021 day4", level: "warn" });
const onlyUnique = <T>(value: T, index: number, self: T[]) => {
  return self.indexOf(value) === index;
};
const regex = /^(?:"(\w)"|(?:(\d+) (\d+))|(\d+)|(?:(\d+) (\d+) (\d+)))$/;
type Rules = { [key: string]: Rule };
type Evaluation = { evaluation: Rule[]; alternate?: Rule[] };
type Resolution = string[];
interface Rule {
  resolve(): string[];
  getId(): string;
  getEvaluation(): Evaluation;
  getResolution(): string[];
}
class BaseRule implements Rule {
  public evaluated: boolean = false;
  public resolved: boolean = false;
  constructor(public id: string, public rules: Rules) {}
  protected keys: string[] = [];
  protected letter?: string;
  protected evaluation: Evaluation = { evaluation: [] };
  protected resolution: string[] = [];

  getId(): string {
    return this.id;
  }
  getEvaluation(): Evaluation {
    throw new Error("Method not implemented.");
  }

  getResolution(): string[] {
    throw new Error("Method not implemented.");
  }

  resolve() {
    if (!this.evaluated) {
      this.evaluation = this.getEvaluation();
      this.evaluated = true;
    }
    if (!this.resolved) {
      this.resolution = this.getResolution();
      this.resolved = true;
    }
    return this.resolution;
  }
}

class LetterRule extends BaseRule {
  constructor(id: string, letter: string, rules: Rules) {
    super(id, rules);
    this.letter = letter;
  }
  getEvaluation() {
    return { evaluation: [this] };
  }
  getResolution() {
    console.log(`letter ${this.id} resolved to ${this.letter}`);

    return [this.letter!];
  }
}
class ConcatRule extends BaseRule {
  constructor(id: string, keys: string[], rules: Rules) {
    super(id, rules);
    this.keys = keys;
  }
  getEvaluation() {
    return { evaluation: this.keys.map((key) => this.rules[key]) };
  }
  getResolution() {
    const result = this.evaluation.evaluation
      .map((rule) => rule.resolve())
      .reduce(
        (p, c) => {
          return p
            .map((prefix) => {
              return c.map((suffix) => prefix + suffix);
            })
            .flat();
        },
        [""],
      )
      .filter((s) => s.length > 0)
      .filter(onlyUnique);
    console.log(`concatenation ${this.id} resolved to ${result.length}`);
    return result;
  }
}
class AlternativesRule extends BaseRule {
  constructor(id: string, private alternatives: Rule[], rules: Rules) {
    super(id, rules);
  }
  getEvaluation() {
    return { evaluation: this.alternatives };
  }
  getResolution() {
    const result = this.alternatives
      .map((alternative) => alternative.resolve())
      .flat()
      .filter(onlyUnique);
    console.log(`alternative ${this.id} resolved to ${result.length}`);
    return result;
  }
}

const ruleFactory = (id: string, input: string, rules: Rules): Rule => {
  let matches = regex.exec(input);
  if (matches == null) {
    throw new Error(`null! could not parse ${input}`);
  }
  let [, letter, p1, p2, x1, t1, t2, t3] = matches;
  if (letter !== undefined) {
    return new LetterRule(id, letter, rules);
  } else if (p1 !== undefined) {
    return new ConcatRule(id, [p1, p2], rules);
  } else if (x1 !== undefined) {
    return new ConcatRule(id, [x1], rules);
  } else if (t1 !== undefined) {
    return new ConcatRule(id, [t1, t2, t3], rules);
  } else {
    throw new Error(`could not parse ${input} : ${matches}`);
  }
};
const suffix = "abcdefgh";
const parseInput = (rawInput: string) => {
  const [rulesInput, messages] = rawInput
    .replace(/\r\n/g, "\n")
    .split(/\n\n/g)
    .map((section) => section.split(/\n/g).map((line) => line.trim()));

  let rules: Rules = {};
  const rulesList = rulesInput
    .map((ruleInput) => {
      const [id, ruleText] = ruleInput.split(/: /);

      const alternatives = ruleText.split(" | ");
      if (alternatives.length === 1) {
        return ruleFactory(id, alternatives[0], rules);
      } else {
        const alternativeRules = alternatives.map((alternative, i) => {
          return ruleFactory(
            `${id}_${suffix.substring(i, i + 1)}`,
            alternative,
            rules,
          );
        });
        return [
          new AlternativesRule(id, alternativeRules, rules),
          ...alternativeRules,
        ];
      }
    })
    .flat();
  rulesList.forEach((rule) => {
    rules[rule.getId()] = rule;
  });

  return { rules, messages };
};
// return an array of possibles
class RulesEngine {
  constructor(public rules: Rules, public message: string) {}
  public valid: string[] = [];
}
const match = (candidate: string, input: string, start: number): boolean => {
  const result =
    input.length >= start + candidate.length &&
    input.substring(start, start + candidate.length) === candidate;
  return result;
};

const part1 = (rawInput: string) => {
  const { rules, messages } = parseInput(rawInput);

  const maxlen = messages
    .map((m) => m.length)
    .reduce((p, c) => Math.max(p, c), 0);

  const resolve42 = rules["42"]?.resolve() ?? [];
  const resolve31 = rules["31"]?.resolve() ?? [];
  console.log({
    len31: resolve31.length,
    len42: resolve42.length,
    resolve31,
    resolve42,
    maxlen,
  });

  // rule 0: 8 11
  // to match rule 0 we can have any number of 42's followed by at least one 31, but no more 31's than the number of 42's less 1

  // 0: 8 11 --> 0: 42 42 31
  const match42 = (input: string, start: number) =>
    resolve42.find((candidate) => match(candidate, input, start));
  const match31 = (input: string, start: number) =>
    resolve31.find((candidate) => match(candidate, input, start));
  const result = messages
    .map((message: string): number => {
      let i = 0;
      let matching = true;
      let match42Count = 0;
      let match31Count = 0;
      while (i < message.length) {
        const found42 = match42(message, i);
        if (found42) {
          i += found42.length;
          match42Count++;
        } else {
          while (i < message.length) {
            const found31 = match31(message, i);
            if (found31) {
              i += found31.length;
              match31Count++;
            } else {
              matching = false;
              break;
            }
          }
          break;
        }
      }
      const isMatch =
        matching &&
        match42Count > 0 &&
        match31Count > 0 &&
        match31Count < match42Count &&
        match42Count == 2 &&
        match31Count == 1;
      console.log({ matching, message, match42Count, match31Count, isMatch });
      return isMatch ? 1 : 0;
    })
    .reduce((p, c) => p + c, 0);

  return result;
};

const part2 = (rawInput: string) => {
  const { rules, messages } = parseInput(rawInput);
  const maxlen = messages
    .map((m) => m.length)
    .reduce((p, c) => Math.max(p, c), 0);
  const resolve42 = rules["42"].resolve();
  const resolve31 = rules["31"].resolve();
  console.log({
    len31: resolve31.length,
    len42: resolve42.length,
    resolve31,
    resolve42,
    maxlen,
  });

  // rule 0: 8 11
  // to match rule 0 we can have any number of 42's followed by at least one 31, but no more 31's than the number of 42's less 1

  const match42 = (input: string, start: number) =>
    resolve42.find((candidate) => match(candidate, input, start));
  const match31 = (input: string, start: number) =>
    resolve31.find((candidate) => match(candidate, input, start));

  resolve42.filter(message => resolve31.includes(message)).forEach((message) =>
    console.log({ inboth: message }),
  );

  const result = messages
    .map((message: string): number => {
      let i = 0;
      let matching = true;
      let match42Count = 0;
      let match31Count = 0;
      while (i < message.length) {
        const found42 = match42(message, i);
        if (found42) {
          i += found42.length;
          match42Count++;
        } else {
          while (i < message.length) {
            const found31 = match31(message, i);
            if (found31) {
              i += found31.length;
              match31Count++;
            } else {
              matching = false;
              break;
            }
          }
          break;
        }
      }
      const isMatch =
        matching &&
        match42Count > 0 &&
        match31Count > 0 &&
        match31Count < match42Count;
      return isMatch ? 1 : 0;
    })
    .reduce((p, c) => p + c, 0);

  return result;
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
const testInput2 = `
42: 9 14 | 10 1
9: 14 27 | 1 26
10: 23 14 | 28 1
1: "a"
11: 42 31
5: 1 14 | 15 1
19: 14 1 | 14 14
12: 24 14 | 19 1
16: 15 1 | 14 14
31: 14 17 | 1 13
6: 14 14 | 1 14
2: 1 24 | 14 4
0: 8 11
13: 14 3 | 1 12
15: 1 | 14
17: 14 2 | 1 7
23: 25 1 | 22 14
28: 16 1
4: 1 1
20: 14 14 | 1 15
3: 5 14 | 16 1
27: 1 6 | 14 18
14: "b"
21: 14 1 | 1 14
25: 1 1 | 1 14
22: 14 14
8: 42
26: 14 22 | 1 20
18: 15 15
7: 14 5 | 1 21
24: 14 1

abbbbbabbbaaaababbaabbbbabababbbabbbbbbabaaaa
bbabbbbaabaabba
babbbbaabbbbbabbbbbbaabaaabaaa
aaabbbbbbaaaabaababaabababbabaaabbababababaaa
bbbbbbbaaaabbbbaaabbabaaa
bbbababbbbaaaaaaaabbababaaababaabab
ababaaaaaabaaab
ababaaaaabbbaba
baabbaaaabbaaaababbaababb
abbbbabbbbaaaababbbbbbaaaababb
aaaaabbaabaaaaababaa
aaaabbaaaabbaaa
aaaabbaabbaaaaaaabbbabbbaaabbaabaaa
babaaabbbaaabaababbaabababaaab
aabbbbbaabbbaaaaaabbbbbababaaaaabbaaabba`;
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
        input: testInput2,
        expected: 12,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  // onlyTests: true,
});
