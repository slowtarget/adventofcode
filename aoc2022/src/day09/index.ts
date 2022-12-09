import run from "aocrunner";
const moves: Record<string, { dx: number; dy: number }> = {
  U: { dx: 0, dy: -1 },
  D: { dx: 0, dy: 1 },
  L: { dx: -1, dy: 0 },
  R: { dx: 1, dy: 0 },
};

class Tail {
  public x: number = 0;
  public y: number = 0;
  public visited: Set<string> = new Set(["0,0"]);
  public touching(x: number, y: number) {
    return Math.max(Math.abs(x - this.x), Math.abs(y - this.y)) < 2;
  }
  public visit() {
    const vector = `${this.x},${this.y}`;
    if (!this.visited.has(vector)) {
      this.visited.add(vector);
    }
  }
  public moveTowards(x: number, y: number) {
    if (y > this.y) {
      this.y++;
    }

    if (y < this.y) {
      this.y--;
    }

    if (x > this.x) {
      this.x++;
    }

    if (x < this.x) {
      this.x--;
    }
    this.visit();
  }
}
class Rope {
  public x: number = 0;
  public y: number = 0;
  public tail: Tail = new Tail();
  public rope?: Rope;
  constructor(public length: number) {
    if (length > 1) {
      this.rope = new Rope(length - 1);
    }
  }
  public move(direction: string, distance: number) {
    const dxdy = moves[direction];
    for (let i = 0; i < distance; i++) {
      this.x += dxdy.dx;
      this.y += dxdy.dy;
      if (!this.tail.touching(this.x, this.y)) {
        this.tail.moveTowards(this.x, this.y);
        if (this.rope) {
          this.rope.moveTo(this.tail.x, this.tail.y);
        }
      }
    }
  }
  public moveTo(x: number, y: number) {
    this.x = x;
    this.y = y;
    if (!this.tail.touching(this.x, this.y)) {
      this.tail.moveTowards(this.x, this.y);
      if (this.rope) {
        this.rope.moveTo(this.tail.x, this.tail.y);
      }
    }
  }
}

const parseInput = (rawInput: string) => {
  return rawInput
    .replace(/\r\n/g, "\n")
    .split(/\n/g)
    .map((line) => {
      const [direction, distance] = line.split(" ");
      return { direction, distance: Number(distance) };
    });
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const head = new Rope(1);
  input.forEach((move) => {
    head.move(move.direction, move.distance);
  });
  return head.tail.visited.size;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const head = new Rope(9);
  input.forEach((move) => {
    head.move(move.direction, move.distance);
  });
  return head.rope?.rope?.rope?.rope?.rope?.rope?.rope?.rope?.tail.visited.size;
};

const testInput = `
R 4
U 4
L 3
D 1
R 4
D 1
L 5
R 2
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
        expected: 1,
      },
      {
        input: `
R 5
U 8
L 8
D 3
R 17
D 10
L 25
U 20`,
        expected: 36,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  // onlyTests: true,
});
