import run from "aocrunner";

type PairOrNumber = Pair | number;

var debug = false;
const log = (...arg: any[]) => {
  if (debug) {
    console.log("", ...arg);
  }
};
const unique = <T extends Object>(value: T, index: number, self: T[]) => {
  var first = self.findIndex((p) => p.toString() === value.toString());
  return first === index;
};

const toKey = (x: number, y: number): string => {
  return `(${x},${y})`;
};
const numToRightJustifiedString = (num: number, length: number): string => {
  var s = num.toString(10);

  return s.padStart(length, " ");
};

// Returns current time
// (and, if provided, prints the event's name)
const now = (eventName: string | null = null) => {
  if (eventName) {
    log(`Started ${eventName}..`);
  }
  return new Date().getTime();
};

// Store current time as `start`
let begunAt = now();

// Returns time elapsed since `beginning`
// (and, optionally, prints the duration in seconds)
const elapsed = (beginning: number = begunAt, logit: boolean = false) => {
  const duration = new Date().getTime() - beginning;
  if (logit) {
    log(`${duration / 1000}s`);
  }
  return duration;
};
class Pair {
  public parent?: Pair;
  public leftChild?: boolean;
  public leftOrder: number = -1;
  public rightOrder: number = -1;
  constructor(public left: PairOrNumber, public right: PairOrNumber) {}
  clone(): Pair {
    return new Pair(this.getClone(this.left), this.getClone(this.right));
  }
  getClone(input: PairOrNumber) {
    if (typeof input === "number") {
      return input + 0;
    } else {
      return input.clone();
    }
  }
  public getDepthOfNestedPairs(depth: number): number {
    var left = this.getDepth(this.left, depth);
    var right = this.getDepth(this.right, depth);
    return Math.max(left, right);
  }
  public getDepth(input: PairOrNumber, depth: number) {
    if (typeof input === "number") {
      return depth;
    } else {
      return input.getDepthOfNestedPairs(depth + 1);
    }
  }
  public getFirst4Deep(depth: number): Pair {
    if (depth === 4) {
      return this;
    }
    if (
      this.getDepth(this.left, depth) === 4 &&
      typeof this.left !== "number"
    ) {
      return this.left.getFirst4Deep(depth + 1);
    }
    if (
      this.getDepth(this.right, depth) === 4 &&
      typeof this.right !== "number"
    ) {
      return this.right.getFirst4Deep(depth + 1);
    }
    throw new Error("lost in the woods!");
  }
  public traverse(
    input: number,
  ): { pair: Pair; isLeft: boolean; value: number; order: number }[] {
    var order = input + 0;
    var result: {
      pair: Pair;
      isLeft: boolean;
      value: number;
      order: number;
    }[] = [];
    if (typeof this.left === "number") {
      this.leftOrder = order;
      result.push({ pair: this, isLeft: true, value: this.left, order });
      order++;
    } else {
      result = [...result, ...this.left.traverse(order)];
      order = result[result.length - 1].order + 1;
    }
    if (typeof this.right === "number") {
      this.rightOrder = order;
      result.push({ pair: this, isLeft: false, value: this.right, order });
      order++;
    } else {
      return [...result, ...this.right.traverse(order)];
    }
    return result;
  }
  public explode(
    traversal: { pair: Pair; isLeft: boolean; value: number; order: number }[],
  ) {
    debug = false;
    log(`explode ${this.toString()}`);
    if (
      typeof this.left === "number" &&
      typeof this.right === "number" &&
      this.parent
    ) {
      if (this.leftChild) {
        this.parent.left = 0;
      } else {
        this.parent.right = 0;
      }
      if (this.leftOrder > 0) {
        var leftTarget = traversal.find((t) => t.order === this.leftOrder - 1);
        if (leftTarget) {
          if (leftTarget.isLeft) {
            if (typeof leftTarget.pair.left === "number") {
              leftTarget.pair.left = leftTarget.pair.left + this.left;
            } else {
              throw new Error(`bad left target type (left) ${leftTarget}`);
            }
          } else {
            if (typeof leftTarget.pair.right === "number") {
              leftTarget.pair.right = leftTarget.pair.right + this.left;
            } else {
              throw new Error(`bad left target type (right) ${leftTarget}`);
            }
          }
        } else {
          throw new Error(`no left target found`);
        }
      }
      var orderMax = traversal[traversal.length - 1].order;
      if (this.rightOrder < orderMax) {
        var rightTarget = traversal.find(
          (t) => t.order === this.rightOrder + 1,
        );
        if (rightTarget) {
          if (rightTarget.isLeft) {
            if (typeof rightTarget.pair.left === "number") {
              rightTarget.pair.left = rightTarget.pair.left + this.right;
            } else {
              throw new Error(`bad right target type (left) ${rightTarget}`);
            }
          } else {
            if (typeof rightTarget.pair.right === "number") {
              rightTarget.pair.right = rightTarget.pair.right + this.right;
            } else {
              throw new Error(`bad right target type (right) ${rightTarget}`);
            }
          }
        } else {
          throw new Error(`no right target found`);
        }
      }

      return;
    }
    throw new Error(`Exploding failed Pair: ${this}`);
  }
  getSplitter(): { parent: Pair; leftChild: boolean; value: number } {
    if (typeof this.left === "number" && this.left > 9) {
      return { parent: this, leftChild: true, value: this.left };
    }
    if (typeof this.left !== "number" && this.left.canSplit()) {
      return this.left.getSplitter();
    }
    if (typeof this.right === "number" && this.right > 9) {
      return { parent: this, leftChild: false, value: this.right };
    }
    if (typeof this.right !== "number" && this.right.canSplit()) {
      return this.right.getSplitter();
    }
    throw new Error("cannot find splitter");
  }
  canSplit(): boolean {
    if (typeof this.left === "number" && this.left > 9) {
      return true;
    }
    if (typeof this.right === "number" && this.right > 9) {
      return true;
    }
    var left = false;
    if (typeof this.left !== "number") {
      left = this.left.canSplit();
    }
    if (left) {
      return left;
    }
    if (typeof this.right !== "number") {
      return this.right.canSplit();
    }
    return false;
  }
  split(leftChild: boolean) {
    var value;
    if (leftChild && typeof this.left === "number") {
      value = this.left;
    }
    if (!leftChild && typeof this.right === "number") {
      value = this.right;
    }
    if (value === undefined) {
      log(this, leftChild);
      throw new Error("split not on a value");
    }

    var split: Pair = new Pair(
      Math.floor(value / 2),
      Math.floor((value + 1) / 2),
    );
    split.setParent(this, leftChild);
    log(`split ${value} to [${split.left},${split.right}]`);
    if (leftChild) {
      this.left = split;
    } else {
      this.right = split;
    }
  }
  public setParent(parent: Pair | undefined, left: boolean) {
    this.parent = parent;
    this.leftChild = left;
    if (typeof this.left !== "number") {
      this.left.setParent(this, true);
    }
    if (typeof this.right !== "number") {
      this.right.setParent(this, false);
    }
  }
  public getMag(value: PairOrNumber) {
    if (typeof value === "number") {
      return value;
    } else {
      return value.getMagnitude();
    }
  }
  public getMagnitude(): number {
    return 3 * this.getMag(this.left) + 2 * this.getMag(this.right);
  }
  public toString(): string {
    return `[${this.left.toString()},${this.right.toString()}]`;
  }
}
class PairFactory {
  public left: PairOrNumber;
  public right: PairOrNumber;
  public both: string = "";
  public pos: number = 0;
  constructor(public input: string) {
    log(
      "Pair constructor : ",
      "          11111111112222222222333333333344444444445555555555",
    );
    log(
      "Pair constructor : ",
      "012345678901234567890123456789012345678901234567890123456789",
    );
    log("Pair constructor : ", this.input);
    var parsed = this.parse();
    this.left = parsed.left;
    this.right = parsed.right;
    log("Pair constructor : ", this.left, this.right);
  }
  public getPair() {
    return new Pair(this.left, this.right);
  }
  public read(chars: number): string {
    if (this.pos < this.both.length) {
      var result = this.both.slice(this.pos, this.pos + chars);
      this.pos += chars;
      log(`read [${this.pos}, ${chars}] : ${result}`);
      return result;
    }
    throw new Error("read gone past the end");
  }
  public next(chars: number): string {
    if (this.pos < this.both.length) {
      var result = this.both.slice(this.pos, this.pos + chars);

      log(`next [${this.pos}, ${chars}] : ${result}`);
      return result;
    }
    throw new Error("next gone past the end");
  }
  public at(pos: number): string {
    if (this.pos < this.both.length) {
      log(`at  [${pos}] : ${this.both[pos]}`);
      return this.both[pos];
    }
    throw new Error("at past the end");
  }

  public parse() {
    if (this.input[0] !== "[") {
      throw new Error("not a pair - no leading [");
    }
    if (this.input[this.input.length - 1] !== "]") {
      log(this.input);
      throw new Error("not a pair - no trailing ]");
    }
    this.pos = 0;
    // trim the [ ] from this pair
    this.both = this.input.slice(1, this.input.length - 1);

    log("left");
    var left = this.getSide();

    var char: string = this.read(1);
    if (char !== ",") {
      throw new Error("no comma found between left and right");
    }
    log("right");
    var right = this.getSide();
    return { left, right };
  }

  private getSide(): PairOrNumber {
    var char: string | undefined;
    var depth: number = 0;

    if (this.next(1) === "[") {
      // left is a pair
      log("side is a pair");
      var inner = this.read(1);

      while (this.pos < this.both.length && depth >= 0) {
        char = this.read(1);
        inner += char;
        if (char === "]") {
          depth--;
        }
        if (char === "[") {
          depth++;
        }
      }

      log(`pair found ${inner}`);
      return new PairFactory(inner).getPair();
    } else {
      log("side is a number");
      // a number ... will be delimited by a comma or end of input
      var end = this.both.indexOf(",", this.pos);
      if (end === -1) {
        end = this.both.length;
      }
      const num = this.read(end - this.pos);
      log(`number found (length: ${end - this.pos}) ${num}`);
      return parseInt(num);
    }
  }
}

class Puzzle {
  private index: number = -1;
  expected?: number;
  constructor(public input: Pair[]) {}

  public next(): Pair | undefined {
    this.index++;
    if (this.index === this.input.length) {
      return undefined;
    }
    return this.input[this.index];
  }

  public solve(): { magnitude: number; pair: Pair } {
    var result = 0;
    var depth = 0;
    var sum = this.next();
    if (sum === undefined) {
      throw new Error("no pairs to sum");
    }
    // keep adding to this pair from the rest.
    var next = this.next();
    while (next) {
      log(`summing up ${this.index}`);
      var temp: Pair = new Pair(sum, next);
      sum.setParent(temp, true);
      next.setParent(temp, false);
      sum = temp;
      var action = true;
      while (action) {
        action = false;
        if (sum.getDepthOfNestedPairs(0) === 4) {
          const toExplode = sum.getFirst4Deep(0);
          var traversal = sum.traverse(0);
          toExplode.explode(traversal);
          action = true;
        } else {
          if (sum.canSplit()) {
            var { parent, leftChild } = sum.getSplitter();
            parent.split(leftChild);
            action = true;
          }
        }
      }
      log(sum.getDepthOfNestedPairs(depth));
      next = this.next();
    }
    log(sum.toString());
    log(sum.getMagnitude());
    return { magnitude: sum.getMagnitude(), pair: sum };
  }
  solve2(): any {
    var leftCandidates = [...this.input];
    var rightCandidates = [...this.input];
    var max = 0;
    var bob: { left: Pair; right: Pair; pair: Pair } = {
      left: new Pair(0, 0),
      right: new Pair(0, 0),
      pair: new Pair(0, 0),
    };
    var x = 0;
    for (var left of leftCandidates) {
      for (var right of rightCandidates) {
        if (left !== right) {
          x++;
          var { magnitude, pair } = new Puzzle([
            left.clone(),
            right.clone(),
          ]).solve();
          if (magnitude > max) {
            log(`new max! ${magnitude} after ${x}`);
            max = magnitude;
            bob = { left, right, pair };
          }
        }
      }
    }
    log(`evaluated ${x} pairs`);
    log(`  ${bob?.left.toString()}`);
    log(`+ ${bob?.right.toString()}`);
    log(`= ${bob?.pair.toString()}`);
    return max;
  }
}

const parseInput = (rawInput: string) => {
  var snailFishes = rawInput
    .replace(/\r\n/g, "\n")
    .split(/\n/g)
    .map((pair) => new PairFactory(pair))
    .map((pf) => pf.getPair());

  return new Puzzle(snailFishes.map((pair) => pair.clone()));
};
const part1 = (rawInput: string) => {
  const input = parseInput(rawInput).solve();
  console.log(input.magnitude);
  return input.pair.toString();
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  return input.solve2();
};

const testInput = ``;
run({
  part1: {
    tests: [
      {
        input: `
        [[[0,[4,5]],[0,0]],[[[4,5],[2,6]],[9,5]]]
        [7,[[[3,7],[4,3]],[[6,3],[8,8]]]]
        [[2,[[0,8],[3,4]]],[[[6,7],1],[7,[1,6]]]]
        [[[[2,4],7],[6,[0,5]]],[[[6,8],[2,8]],[[2,1],[4,5]]]]
        [7,[5,[[3,8],[1,4]]]]
        [[2,[2,2]],[8,[8,1]]]
        [2,9]
        [1,[[[9,3],9],[[9,0],[0,7]]]]
        [[[5,[7,4]],7],1]
        [[[[4,2],2],6],[8,7]]`,
        expected: `[[[[8,7],[7,7]],[[8,6],[7,7]]],[[[0,7],[6,6]],[8,7]]]`,
      },
      {
        input: `
        [[[0,[4,5]],[0,0]],[[[4,5],[2,6]],[9,5]]]
        [7,[[[3,7],[4,3]],[[6,3],[8,8]]]]`,
        expected: `[[[[4,0],[5,4]],[[7,7],[6,0]]],[[8,[7,7]],[[7,9],[5,0]]]]`,
      },
      {
        input: `
        [[[[4,0],[5,4]],[[7,7],[6,0]]],[[8,[7,7]],[[7,9],[5,0]]]]
        [[2,[[0,8],[3,4]]],[[[6,7],1],[7,[1,6]]]]`,
        expected: `[[[[6,7],[6,7]],[[7,7],[0,7]]],[[[8,7],[7,7]],[[8,8],[8,0]]]]`,
      },
      {
        input: `
        [[[[6,7],[6,7]],[[7,7],[0,7]]],[[[8,7],[7,7]],[[8,8],[8,0]]]]
        [[[[2,4],7],[6,[0,5]]],[[[6,8],[2,8]],[[2,1],[4,5]]]]`,
        expected: `[[[[7,0],[7,7]],[[7,7],[7,8]]],[[[7,7],[8,8]],[[7,7],[8,7]]]]`,
      },
      {
        input: `
        [[[[7,0],[7,7]],[[7,7],[7,8]]],[[[7,7],[8,8]],[[7,7],[8,7]]]]
        [7,[5,[[3,8],[1,4]]]]`,
        expected: `[[[[7,7],[7,8]],[[9,5],[8,7]]],[[[6,8],[0,8]],[[9,9],[9,0]]]]`,
      },
      {
        input: `
        [[[[7,7],[7,8]],[[9,5],[8,7]]],[[[6,8],[0,8]],[[9,9],[9,0]]]]
        [[2,[2,2]],[8,[8,1]]]`,
        expected: `[[[[6,6],[6,6]],[[6,0],[6,7]]],[[[7,7],[8,9]],[8,[8,1]]]]`,
      },
      {
        input: `
        [[[[6,6],[6,6]],[[6,0],[6,7]]],[[[7,7],[8,9]],[8,[8,1]]]]
        [2,9]`,
        expected: `[[[[6,6],[7,7]],[[0,7],[7,7]]],[[[5,5],[5,6]],9]]`,
      },
      {
        input: `
        [[[[6,6],[7,7]],[[0,7],[7,7]]],[[[5,5],[5,6]],9]]
        [1,[[[9,3],9],[[9,0],[0,7]]]]`,
        expected: `[[[[7,8],[6,7]],[[6,8],[0,8]]],[[[7,7],[5,0]],[[5,5],[5,6]]]]`,
      },
      {
        input: `
        [[[[7,8],[6,7]],[[6,8],[0,8]]],[[[7,7],[5,0]],[[5,5],[5,6]]]]
        [[[5,[7,4]],7],1]`,
        expected: `[[[[7,7],[7,7]],[[8,7],[8,7]]],[[[7,0],[7,7]],9]]`,
      },
      {
        input: `
        [[[[7,7],[7,7]],[[8,7],[8,7]]],[[[7,0],[7,7]],9]]
        [[[[4,2],2],6],[8,7]]`,
        expected: `[[[[8,7],[7,7]],[[8,6],[7,7]]],[[[0,7],[6,6]],[8,7]]]`,
      },
      {
        input: `
        [[[0,[5,8]],[[1,7],[9,6]]],[[4,[1,2]],[[1,4],2]]]
        [[[5,[2,8]],4],[5,[[9,9],0]]]
        [6,[[[6,2],[5,6]],[[7,6],[4,7]]]]
        [[[6,[0,7]],[0,9]],[4,[9,[9,0]]]]
        [[[7,[6,4]],[3,[1,3]]],[[[5,5],1],9]]
        [[6,[[7,3],[3,2]]],[[[3,8],[5,7]],4]]
        [[[[5,4],[7,7]],8],[[8,3],8]]
        [[9,3],[[9,9],[6,[4,9]]]]
        [[2,[[7,7],7]],[[5,8],[[9,3],[0,2]]]]
        [[[[5,2],5],[8,[3,7]]],[[5,[7,5]],[4,4]]]`,
        expected:
          "[[[[6,6],[7,6]],[[7,7],[7,0]]],[[[7,7],[7,7]],[[7,8],[9,9]]]]",
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
        [[[0,[5,8]],[[1,7],[9,6]]],[[4,[1,2]],[[1,4],2]]]
        [[[5,[2,8]],4],[5,[[9,9],0]]]
        [6,[[[6,2],[5,6]],[[7,6],[4,7]]]]
        [[[6,[0,7]],[0,9]],[4,[9,[9,0]]]]
        [[[7,[6,4]],[3,[1,3]]],[[[5,5],1],9]]
        [[6,[[7,3],[3,2]]],[[[3,8],[5,7]],4]]
        [[[[5,4],[7,7]],8],[[8,3],8]]
        [[9,3],[[9,9],[6,[4,9]]]]
        [[2,[[7,7],7]],[[5,8],[[9,3],[0,2]]]]
        [[[[5,2],5],[8,[3,7]]],[[5,[7,5]],[4,4]]]`,
        expected: 3993,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
