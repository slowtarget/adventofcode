import run from "aocrunner";
type PacketValue =
  | number[][][][][]
  | number[][][][]
  | number[][][]
  | number[][]
  | number[]
  | number;
class Packet {
  constructor(public value: PacketValue, public divider: boolean = false) {}
}
class Pair {
  constructor(
    public left: Packet,
    public right: Packet,
    public index: number,
  ) {}

  isOrderCorrect(): boolean | undefined {
    if (
      typeof this.left.value === "object" &&
      typeof this.right.value === "object"
    ) {
      let i = 0;
      while (i < this.left.value.length) {
        const leftValue = this.left.value[i];
        if (i < this.right.value.length) {
          const rightValue = this.right.value[i];
          const newPair = new Pair(
            new Packet(leftValue),
            new Packet(rightValue),
            this.index,
          );
          const newPairCorrect = newPair.isOrderCorrect();
          if (newPairCorrect !== undefined) {
            return newPairCorrect;
          }
        } else {
          return false;
        }
        i++;
      }
      if (i < this.right.value.length) {
        return true;
      }
    } else if (
      typeof this.left.value === "number" &&
      typeof this.right.value === "number"
    ) {
      if (this.left.value === this.right.value) {
        return undefined;
      }
      return this.left.value < this.right.value;
    } else if (
      typeof this.left.value === "number" &&
      typeof this.right.value === "object"
    ) {
      const newPair = new Pair(
        new Packet([this.left.value]),
        this.right,
        this.index,
      );
      const newPairCorrect = newPair.isOrderCorrect();
      if (newPairCorrect !== undefined) {
        return newPairCorrect;
      }
    } else if (
      typeof this.left.value === "object" &&
      typeof this.right.value === "number"
    ) {
      const newPair = new Pair(
        this.left,
        new Packet([this.right.value]),
        this.index,
      );
      const newPairCorrect = newPair.isOrderCorrect();
      if (newPairCorrect !== undefined) {
        return newPairCorrect;
      }
    }
  }
}
const parseInput = (rawInput: string) => {
  return rawInput
    .replace(/\r\n/g, "\n")
    .split(/\n\n/g)
    .map((group, index) => {
      const [left, right] = group.split(/\n/);
      return new Pair(
        new Packet(JSON.parse(left)),
        new Packet(JSON.parse(right)),
        index + 1,
      );
    });
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return input
    .filter((p) => p.isOrderCorrect())
    .reduce((p, c): number => {
      // console.log(`${JSON.stringify(c.left)}\n${JSON.stringify(c.right)}\n\n`)
      return p + c.index;
    }, 0);
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const packets = input.map((p) => [p.left, p.right]).flat();
  packets.push(new Packet([[2]], true));
  packets.push(new Packet([[6]], true));

  packets.sort((a, b) => {
    const pair = new Pair(a, b, 0);
    if (pair.isOrderCorrect()) {
      return -1;
    } else {
      return 1;
    }
  });

  return packets
    .map((packet, index) => {
      if (packet.divider) {
        return index + 1;
      } else {
        return 1;
      }
    })
    .reduce((p, c) => p * c, 1);
};

const testInput = `
[1,1,3,1,1]
[1,1,5,1,1]

[[1],[2,3,4]]
[[1],4]

[9]
[[8,7,6]]

[[4,4],4,4]
[[4,4],4,4,4]

[7,7,7,7]
[7,7,7]

[]
[3]

[[[]]]
[[]]

[1,[2,[3,[4,[5,6,7]]]],8,9]
[1,[2,[3,[4,[5,6,0]]]],8,9]
`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 13,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 140,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  // onlyTests: true,
});
