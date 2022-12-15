import run from "aocrunner";
class Point {
  constructor(public x: number, public y: number) {}
  manhatten(other: Point) {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
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
    return (this.max >= other.max && this.min <= other.min);
  }
  union(other: Range) {
    if (this.intersects(other) || this.contains(other) || other.contains(this)) {
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
  constructor(public point: Point, public closest: Beacon) {
    this.range = point.manhatten(closest.point);
  }
  intersectX(y: number): Range | undefined {
    // given y, what range of x values can this sensor sense on that line?
    const distanceY = Math.abs(y - this.point.y);
    if (distanceY > this.range) {
      return undefined; // completely out of range
    }
    const overrun = this.range - distanceY;
    return new Range(this.point.x - overrun, this.point.x + overrun);
  }
  toString() {
    return `Sensor (${this.point.x},${this.point.y}) -- ${this.range} --> ${this.closest.toString} `;
  }
}
class Beacon {
  constructor(public point: Point) {}
  toString() {
    return `Beacon (${this.point.x},${this.point.y})`;
  }
}
const parseInput = (rawInput: string) => {
  return rawInput
    .replace(/\r\n/g, "\n")
    .split(/\n/g)
    .map((line) => {
      const match =
        /Sensor at x=(.*), y=(.*): closest beacon is at x=(.*), y=(.*)/
          .exec(line)
          ?.slice(1)
          .map(Number)!;
      const beacon = new Beacon(new Point(match[2], match[3]));
      return new Sensor(new Point(match[0], match[1]), beacon);
    });
};
//4000000 and then adding its y coordinate.
const tuningFrequency = (x: number, y: number) => {
  return x * 4000000 + y;
};
const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  // const y = 10;
  const y = 2000000;
  const line: Record<number, boolean> = {};
  // mark the sensor hits on the line
  input
    .map((sensor) => sensor.intersectX(y))
    .filter((r) => r !== undefined)
    .forEach((range) => {
      for (let x = range?.min!; x <= range?.max!; x++) {
        line[x] = true;
      }
    });
  // remove existing beacons from the count
  input
    .map((s) => s.closest.point)
    .filter((p) => p.y === y)
    .forEach((p) => (line[p.x] = false));
  return Object.values(line).filter((x) => x).length;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  // test
  // const max = 20;
  const max = 4000000;
  let line = new Set<Range>();
  // mark the sensor hits on the line
  let y = 0;
  let found = false;
  while (y <= max && !found) {
    line = new Set<Range>();
    // console.log(y,"1",input.map((sensor) => sensor.intersectX(y)))
    // console.log(y,"2",input.map((sensor) => sensor.intersectX(y)).filter((r) => r !== undefined))
    // console.log(y,"3",input.map((sensor) => sensor.intersectX(y)).filter((r) => r !== undefined).filter((r) => r!.min < max))
    // console.log(y,"4",input.map((sensor) => sensor.intersectX(y)).filter((r) => r !== undefined).filter((r) => r!.min < max).map((r) => (r?.max! > max ? new Range(r!.min, max) : r!)))
    // console.log(y,"5",input.map((sensor) => sensor.intersectX(y)).filter((r) => r !== undefined).filter((r) => r!.min < max).map((r) => (r?.max! > max ? new Range(r!.min, max) : r!)).map((r) => (r?.min! < 0 ? new Range(0, r.max) : r!)))
    input
      .map((sensor) => sensor.intersectX(y))
      .filter((r) => r !== undefined)
      .filter((r) => r!.min < max)
      .map((r) => (r?.max! > max ? new Range(r!.min, max) : r!))
      .map((r) => (r?.min! < 0 ? new Range(0, r.max) : r!))
      .forEach((r) => line.add(r));
    
    let unionsFound = true;
    let looped = 0;
    // console.log(y,looped,"merging these: ", line)
    while (unionsFound) {
      looped++;
      unionsFound = false;
      const copy = [...line.values()];
      line = new Set<Range>();
      let merged: number[] = [];
      
      for (let i = 0; i < copy.length; i++) {
        let unions: Range[] = [];
        if (merged.includes(i)) {
          //skip
        } else {
          for (let j = i + 1; j < copy.length; j++) {
            if (i !== j) {
              let union = copy[i].union(copy[j]);
              if (union) {
                // console.log(y,looped,i, "merging ",j)
                unions.push(union);
                merged.push(j);
              }
            }
          }
        }
        if (unions.length) {
          // console.log(y,looped,i, "unions found!",unions);
          let merge : Range|undefined= unions[0];
          const remaining = unions.slice(1);
          remaining.forEach(r=>merge=merge!.union(r));
          // console.log(y,looped,i,"unions merged!",merge,line.size);
          line.add(merge);
          unionsFound = true;
        } else {
          // console.log(y,looped,i,"no union here!",line.size,merged);
          if(merged.includes(i)) {
            //skip
          } else {
            line.add(copy[i]);
          }
        }
      }
      // console.log(y,looped,"loop done", unionsFound, line.size, line)
    }
    // console.log(y,"loop done",line.size,line)
    if (line.size>1){
      found = true;
    } else {
      y++;
    }
  }
  
  let result = Array.from(line)
  result.sort((a,b)=>a.min-b.min);
  console.log(result);
  let x = result[0].max+1;
  console.log(`found at (${x},${y})`);
  return tuningFrequency(x, y);
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
