import run from "aocrunner";

class Num {
  constructor(public value: number, public originalPosition: number) {}
}
class File {
  public original: Num[];
  public zero: Num;
  public zeroPosition: number = 0;
  constructor(public numbers: Num[]) {
    this.original = [...this.numbers];
    this.zero = this.numbers.find((x) => x.value === 0)!;
  }
  mix() {
    this.original.forEach((num) => {
      this.move(num, num.value);
    });
    this.zeroPosition = this.numbers.findIndex((x) => x === this.zero);
  }
  move(num: Num, value: number) {
    if (value === 0) {
      return;
    }
    const start = this.numbers.findIndex((x) => x === num);
    const removed = this.numbers.splice(start, 1);
    const length = this.numbers.length;
    const backwards = value / Math.abs(value);
    const steps = Math.abs(value) % length;
    let end = (backwards * steps + start + length) % length;

    if (backwards && end === 0) {
      this.numbers.push(removed[0]);
      return;
    }
    const prefix = this.numbers.slice(0, end);
    const suffix = this.numbers.slice(end);

    prefix.push(removed[0]);
    this.numbers = prefix.concat(suffix);
  }
  afterZero(steps: number) {
    const length = this.numbers.length;
    const target = ((steps % length) + length + this.zeroPosition) % length;
    console.log(
      "afterZero",
      this.zero.value,
      this.zeroPosition,
      steps,
      steps % length,
      target,
      this.numbers[target].value,
    );
    return this.numbers[target].value;
  }
  toString() {
    return this.numbers.map((n) => n.value).join(", ");
  }
}
const parseInput = (rawInput: string) => {
  return new File(
    rawInput
      .replace(/\r\n/g, "\n")
      .split(/\n/g)
      .map((line, position) => {
        return new Num(Number(line), position);
      }),
  );
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  input.mix();
  return [1000, 2000, 3000].reduce((p, c) => p + input.afterZero(c), 0);
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const decryptionKey = 811589153;
  input.numbers.forEach((n) => (n.value = n.value * decryptionKey));
  for (let i = 0; i < 10; i++) {
    input.mix();
  }
  return [1000, 2000, 3000].reduce((p, c) => p + input.afterZero(c), 0);
};

const testInput = `
1
2
-3
3
-2
0
4
`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 3,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 1623178306,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  // onlyTests: true,
});
