import run from "aocrunner";
var clones = 0;
type Input = { a: string; b: string };
class Cave {
  constructor(
    public big: boolean,
    public label: string,
    public paths: { [label: string]: Cave },
    public start: boolean,
    public end: boolean,
  ) {}
  clone() {
    return new Cave(this.big, this.label, this.paths, this.start, this.end);
  }
}
class CaveMap {
  public caveMap: { [label: string]: Cave };
  constructor(caves: Cave[]) {
    this.caveMap = {};
    caves.forEach((cave) => {
      this.caveMap[cave.label] = cave;
    });
    caves.forEach((cave) => {
      var paths = {};
      Object.keys(cave.paths).forEach((key) => {
        paths[key] = this.caveMap[key];
      });
      cave.paths = paths;
    });
  }
  clone() {
    clones++;
    return new CaveMap(Object.values(this.caveMap).map((cave) => cave.clone()));
  }
}

type Visits = { [key: string]: boolean };

const unique = <T>(value: T, index: number, self: T[]) => {
  return self.indexOf(value) === index;
};

const travel = (
  input: CaveMap,
  position: string,
  journey: string[],
  bonusUsed: boolean,
  visits: Visits,
): string[][] => {
  var bonus = bonusUsed;
  journey.push(position);
  if (input.caveMap[position].end) {
    return [journey];
  }
  if (!input.caveMap[position].big) {
    if (visits[position]) {
      // been here before
      if (bonus) {
        return [];
      } else {
        bonus = true;
      }
    }
  }

  visits[position] = true;

  // travel onwards
  var journeys: string[][] = [];
  for (var path of Object.keys(input.caveMap[position].paths)) {
    var newJourneys = travel(input, path, [...journey], bonus, { ...visits });
    journeys = [...journeys, ...newJourneys];
  }

  return journeys;
};
const parseInput = (rawInput: string) => {
  var data = rawInput
    .replace(/\r\n/g, "\n")
    .split(/\n/g)
    .map((v) => v.trim())
    .map((v) => v.split("-"))
    .map((v) => <Input>{ a: v[0], b: v[1] });

  var caves = data
    .map(({ a, b }) => [a, b])
    .flatMap((v) => v)
    .filter(unique)
    .map(
      (a) => new Cave(a.toUpperCase() === a, a, {}, a === "start", a === "end"),
    );

  var original = new CaveMap(caves);

  data.forEach(({ a, b }) => {
    original.caveMap[a].paths[b] = original.caveMap[b];
    original.caveMap[b].paths[a] = original.caveMap[a];
  });

  // remove paths back to the start
  for (var path of Object.keys(original.caveMap["start"].paths)) {
    delete original.caveMap[path].paths["start"];
  }
  return original;
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  clones = 0;
  const result = travel(input, "start", [], true, {}).length;
  console.log("clones", clones);
  return result;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  clones = 0;

  const result = travel(input, "start", [], false, {}).length;
  console.log("clones", clones);
  return result;
};

const testInput = `
start-A
start-b
A-c
A-b
b-d
A-end
b-end`;
const testInput2 = `
dc-end
HN-start
start-kj
dc-start
dc-HN
LN-dc
HN-end
kj-sa
kj-HN
kj-dc`;
const testInput3 = `
fs-end
he-DX
fs-he
start-DX
pj-DX
end-zg
zg-sl
zg-pj
pj-he
RW-he
fs-DX
pj-RW
zg-RW
start-pj
he-WI
zg-he
pj-fs
start-RW`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 10,
      },
      {
        input: testInput2,
        expected: 19,
      },
      {
        input: testInput3,
        expected: 226,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 36,
      },
      {
        input: testInput2,
        expected: 103,
      },
      {
        input: testInput3,
        expected: 3509,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
