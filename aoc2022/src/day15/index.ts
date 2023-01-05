import run from "aocrunner";
class Point {
  constructor(public x: number, public y: number) {}
  manhatten(other: Point) {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
  }
  toString() {
    return `(${this.x},${this.y})`;
  }
}
class Range {
  constructor(public min: number, public max: number) {
    if (min > max) {
      throw new Error("min cannot be > max!");
    }
  }

  intersects(other: Range) {
    return (
      (this.min <= other.max && this.min >= other.min) ||
      (this.max <= other.max && this.max >= other.min)
    );
  }

  contains(other: Range) {
    return this.max >= other.max && this.min <= other.min;
  }

  union(other: Range) {
    if (
      this.intersects(other) ||
      this.contains(other) ||
      other.contains(this)
    ) {
      return new Range(
        Math.min(this.min, other.min),
        Math.max(this.max, other.max),
      );
    }
    return undefined;
  }
}
class Sensor {
  public range: number;
  constructor(public location: Point, public closest: Beacon) {
    this.range = location.manhatten(closest.point);
  }

  getJustOutOfRange(offTheMap: number): Point[] {
    const { x, y } = this.location;
    const range = this.range;
    const limit = range + 1;
    const result: Point[] = [
      new Point(x, y + limit),
      new Point(x, y - limit),
      new Point(x + limit, y),
      new Point(x - limit, y),
    ];

    for (let i = 1; i < limit; i++) {
      const n = y + i;
      const s = y - i;
      const e = x + (limit - i);
      const w = x - (limit - i);
      result.push(
        new Point(e, n),
        new Point(w, n),
        new Point(e, s),
        new Point(w, s),
      );
    }
    const filtered = result
      .filter((p) => p.x >= 0 && p.x <= offTheMap)
      .filter((p) => p.y >= 0 && p.y <= offTheMap);
    return filtered;
  }

  intersectX(y: number): Range | undefined {
    // given y, what range of x values can this sensor sense on that line?
    const distanceY = Math.abs(y - this.location.y);
    if (distanceY > this.range) {
      return undefined; // completely out of range
    }
    const overrun = this.range - distanceY;
    return new Range(this.location.x - overrun, this.location.x + overrun);
  }

  sees(candidate: Point) {
    const dx = Math.abs(candidate.x - this.location.x);
    if (dx > this.range) return false;
    const dy = Math.abs(candidate.y - this.location.y);
    if (dy > this.range) return false;
    return (dx + dy) <= this.range;
  }

  toString() {
    return `Sensor ${this.location.toString()} -- ${this.range} --> ${this.closest.toString()} `;
  }
}
class Beacon {
  constructor(public point: Point) {}
  toString() {
    return `Beacon ${this.point.toString()}`;
  }
}
class Cave {
  constructor(public layout: Sensor[]) {}

  toString() {
    return this.layout.map((s) => s.toString()).join("\n");
  }
}
const parseInput = (rawInput: string): Cave => {
  const regExp = new RegExp(
    /Sensor at x=(.*), y=(.*): closest beacon is at x=(.*), y=(.*)/,
  );
  return new Cave(
    rawInput
      .replace(/\r\n/g, "\n")
      .split(/\n/g)
      .map((line) => {
        const match = regExp.exec(line)!.slice(1).map(Number);
        const beacon = new Beacon(new Point(match[2], match[3]));
        return new Sensor(new Point(match[0], match[1]), beacon);
      }),
  );
};
//4000000 and then adding its y coordinate.
const tuningFrequency = (x: number, y: number) => {
  return x * 4000000 + y;
};

let cave: Cave;
const part1 = (rawInput: string, inputY?: number) => {
  cave = parseInput(rawInput);
  // console.log(cave.toString());
  // const y = 10;
  const y = cave.layout.length === 14 ? 10 : 2000000;
  const line: Record<number, boolean> = {};
  // mark the sensor hits on the line
  cave.layout
    .map((sensor) => sensor.intersectX(y))
    .filter((r) => r !== undefined)
    .forEach((range) => {
      for (let x = range?.min!; x <= range?.max!; x++) {
        line[x] = true;
      }
    });
  // remove existing beacons from the count
  cave.layout
    .map((s) => s.closest.point)
    .filter((p) => p.y === y)
    .forEach((p) => (line[p.x] = false));
  return Object.values(line).filter((x) => x).length;
};

const part2 = (rawInput: string) => {
  const max = cave.layout.length === 14 ? 20 : 4000000;

  for (let i = 0; i < cave.layout.length; i++) {
    let candidates = cave.layout[i].getJustOutOfRange(max);
    for (let j = 0; j < cave.layout.length; j++) {
      if (j !== i) {
        candidates = candidates.filter(
          (candidate) => !cave.layout[j].sees(candidate),
        );
      }
    }
    if (candidates.length === 1) {
      let result = candidates[0];
      return tuningFrequency(result.x, result.y);
    }
    if (candidates.length > 0) {
      throw new Error(
        `more than one candidate... sensor: ${cave.layout[
          i
        ].toString()}\n${candidates.map((p) => p.toString()).join("\n")} `,
      );
    }
  }
  throw new Error("not found");
};
const testInput = `
Sensor at x=2, y=18: closest beacon is at x=-2, y=15
Sensor at x=9, y=16: closest beacon is at x=10, y=16
Sensor at x=13, y=2: closest beacon is at x=15, y=3
Sensor at x=12, y=14: closest beacon is at x=10, y=16
Sensor at x=10, y=20: closest beacon is at x=10, y=16
Sensor at x=14, y=17: closest beacon is at x=10, y=16
Sensor at x=8, y=7: closest beacon is at x=2, y=10
Sensor at x=2, y=0: closest beacon is at x=2, y=10
Sensor at x=0, y=11: closest beacon is at x=2, y=10
Sensor at x=20, y=14: closest beacon is at x=25, y=17
Sensor at x=17, y=20: closest beacon is at x=21, y=22
Sensor at x=16, y=7: closest beacon is at x=15, y=3
Sensor at x=14, y=3: closest beacon is at x=15, y=3
Sensor at x=20, y=1: closest beacon is at x=15, y=3
`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 26,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 56000011,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  // onlyTests: true,
});
