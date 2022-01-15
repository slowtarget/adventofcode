import run from "aocrunner";
import * as Logger from "bunyan";
function ruleSerializer(rule:Rule) {
  return {
      label: rule.label,
  };
}
function rulesSerializer(rules:Rule[]) {
  return rules.map(rule=>({rule:rule.label}));
}
var log = Logger.createLogger({ name: "2020 day16", level: "info" , serializers:{rule:ruleSerializer, rules:rulesSerializer}});
log.error("hello");
type Rules = { [index: string]: Rule }
class Range {
  constructor( 
    public from: number,
    public to: number) { }

  public valid(n: number) {
    return n >= this.from && n <= this.to;
  }
}
class Rule {
  public label: string;
  public ranges: Range[] = [];
  private matcher: RegExp = /^(.*): (\d+)+\-(\d+) or (\d+)+\-(\d+)$/
  constructor(
    public rule: string
  ) {
    var m = this.matcher.exec(rule);
    if (!m) {
      throw new Error("!invalid input: " + rule);
    }
    var r: string[];
    [, this.label, ...r] = m;
    var rn = r.map(x => parseInt(x));
    var [r1, r2, r3, r4] = rn;

    this.ranges.push(new Range(r1, r2))
    this.ranges.push(new Range(r3, r4))
  }

  public valid(n: number) {
    return this.ranges.some(r => r.valid(n));
  }
}
class Ticket {
  public values: number[] = [];
  constructor(
    public ticket: string
  ) {
    this.values = ticket.split(",").map(t => parseInt(t, 10));
  }
}

const parseInput = (rawInput: string) => {

  const input = rawInput
    .replace(/\r\n/g, '\n')
    .split(/\n\n/g);

  var [rules, myTicket, nearby] = input;

  myTicket = myTicket.split(/\n/)[1];
  var nearbys = nearby.split(/\n/).slice(1).map(s => new Ticket(s));
  return { rules: rules.split(/\n/).map(s => new Rule(s)), myTicket: new Ticket(myTicket), nearbys };
}


const part1 = (rawInput: string) => {
  var { rules, myTicket, nearbys } = parseInput(rawInput);
   return nearbys.map(ticket=>ticket.values.filter(value => rules.every(rule=>!rule.valid(value)))).flatMap(a=>a).reduce((c,p)=>p+c,0);
};

const part2 = (rawInput: string) => {
  var { rules, myTicket, nearbys } = parseInput(rawInput);

  var validNearby = nearbys.filter(ticket => ticket.values.filter(value => rules.every(rule=>!rule.valid(value))).length===0);
  var passingRules: Rules[] = [];

  passingRules = myTicket.values.map((value, index) => {
    var values = validNearby.map(ticket => ticket.values[index]);
    return rules.filter(rule => values.every(n => rule.valid(n))).reduce((p, c) => ({ ...p, [c.label]: c }), {});
  });
  var singleRules: Rule[] = [];
  var slimming: boolean = true;
  while (slimming) {
    slimming = false;
    passingRules.forEach((rs, index) => {
      if (Object.keys(rs).length === 1) {
        // this rule only passes for this index.
        var key = Object.keys(rs)[0];
        singleRules[index] = rs[key];
        passingRules.forEach(rq => {
          slimming = true;
          delete rq[key];
        })
      }
    });
  }
  log.error({rules:singleRules},"bob");

  return singleRules.map((rule, index) => ({ rule, index }))
    .filter(({ rule, index }) => rule.label.startsWith('departure'))
    .map(({ rule, index }) => myTicket.values[index])
    .reduce((p, c) => p * c, 1)
};

const testInput = `
class: 1-3 or 5-7
row: 6-11 or 33-44
seat: 13-40 or 45-50

your ticket:
7,1,14

nearby tickets:
7,3,47
40,4,50
55,2,20
38,6,12`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 71,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [

    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
