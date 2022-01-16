import run from "aocrunner";
import * as Logger from "bunyan";

var log = Logger.createLogger({ name: "2021 day4", level: "warn" });

class Expression {
  public idx = 0;
  public infix: string[];
  public outputQueue: string[] = [];
  public opStack: string[] = [];
  public value: number[] = [];
  constructor(public input: string, public addtionHasPrecedence:boolean) {
    this.infix = this.input.split(/ /g);
    log.info({input:this.input},"new Expression")
  }
  public read() {
    return this.infix[this.idx++];
  }
  public rpn() {
    // https://en.wikipedia.org/wiki/Shunting-yard_algorithm
    var next = this.read();
    var op = "";
    while (next !== undefined) {
      switch (next) {
        case "*":
          op = this.opStack.pop();
          while (op !== undefined && op !== "(") {
            this.outputQueue.push(op);
            op = this.opStack.pop();
          }
          if (op !== undefined) {
            this.opStack.push(op);
          }
          this.opStack.push(next);
          break;
        case "+":
          op = this.opStack.pop();
          while (op !== undefined && op !== "(" && ((this.addtionHasPrecedence && op!=="*")||!this.addtionHasPrecedence)) {
            this.outputQueue.push(op);
            op = this.opStack.pop();
          }
          if (op !== undefined) {
            this.opStack.push(op);
          }
          this.opStack.push(next);
          break;

        case "(":
          this.opStack.push(next);
          break;

        case ")":
          op = this.opStack.pop();
          while (op !== undefined && op !== "(") {
            this.outputQueue.push(op);
            op = this.opStack.pop();
          }
          if (op !== '(') {
            throw new Error(`#1 mismatched parenthese in expression : ${this.input}`);
          }

          break;

        default:
          this.outputQueue.push(next);
      }
      next = this.read();
    }
    op = this.opStack.pop();
    while (op !== undefined) {
      if (op == '(' || op == ')') {
        throw new Error(`#2 mismatched parenthese in expression : ${this.input}`);
      }
      this.outputQueue.push(op);
      op = this.opStack.pop();
    }
  }
  readOutput(){
    return this.outputQueue[this.idx++];
  }
  
  public evaluate() {

      this.rpn();

    this.idx=0;
    var next = this.readOutput();
    while (next !== undefined) {
      switch (next) {
        case "*":
          var mult = this.value.pop() * this.value.pop();
          this.value.push(mult);
          break;
        case "+":
          var add = this.value.pop() + this.value.pop();
          this.value.push(add);
          break;
        default:
          var value = parseInt(next, 10);
          if (isNaN(value)) {
            throw new Error(`value on output queue is not a number! :${next}`);
          }
          this.value.push(value);
          break;
      }
      next = this.readOutput();
    }
    var result = this.value.pop();
    if (this.value.length !== 0) {
      throw new Error(`values left on stack at completion! ${this.value}`);
    }
    if (this.idx !== this.outputQueue.length + 1 ) {
      throw new Error(`material still on output queue! ${this.outputQueue}`);
    }
    return result;
  }
}

const parseInput = (rawInput: string) => {
  return rawInput
    .replace(/\r\n/g, '\n')
    .replace(/\(/g,'( ')
    .replace(/\)/g,' )')
    .split(/\n/g);
}

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return input.map(v => new Expression(v,false)).map(e => e.evaluate()).reduce((p, c) => p + c, 0);
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  return input.map(v => new Expression(v,true)).map(e => e.evaluate()).reduce((p, c) => p + c, 0);
};


run({
  part1: {
    tests: [
      { input: "1", expected: 1 },
      { input: "1 + 2", expected: 3 },
      { input: "1 * 2", expected: 2 },
      { input: "1 + 2 + 3", expected: 6 },
      { input: "1 + 2 * 3 + 4 * 5 + 6", expected: 71 },
      { input: "1 + (2 * 3) + (4 * (5 + 6))", expected: 51 },
      { input: "2 * 3 + (4 * 5)", expected: 26 },
      { input: "5 + (8 * 3 + 9 + 3 * 4 * 3)", expected: 437 },
      { input: "5 * 9 * (7 * 3 * 3 + 9 * 3 + (8 + 6 * 4))", expected: 12240 },
      { input: "((2 + 4 * 9) * (6 + 9 * 8 + 6) + 6) + 2 + 4 * 2", expected: 13632 },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      { input: "1", expected: 1 },
      { input: "1 + 2", expected: 3 },
      { input: "1 * 2", expected: 2 },
      { input: "1 + 2 + 3", expected: 6 },
      { input: "1 + 2 * 3 + 4 * 5 + 6", expected: 231 },
      { input: "1 + (2 * 3) + (4 * (5 + 6))", expected: 51 },
      { input: "2 * 3 + (4 * 5)", expected: 46 },
      { input: "5 + (8 * 3 + 9 + 3 * 4 * 3)", expected: 1445 },
      { input: "5 * 9 * (7 * 3 * 3 + 9 * 3 + (8 + 6 * 4))", expected: 669060 },
      { input: "((2 + 4 * 9) * (6 + 9 * 8 + 6) + 6) + 2 + 4 * 2", expected: 23340 },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
