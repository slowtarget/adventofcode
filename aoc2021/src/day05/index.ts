import run from "aocrunner";
type Coord = {
  x: number;
  y: number;
};
type Vector = {
  a: Coord;
  b: Coord;
};
const incrementForCoord = (c: Coord, area: number[][]) => {
  if (area.length >= c.x && area[c.x]) {
    if (area[c.x].length >= c.y && area[c.x][c.y]) {
      area[c.x][c.y] = area[c.x][c.y] + 1;
    } else {
      area[c.x][c.y] = 1;
    }
  } else {
    var col: number[] = [];
    col[c.y] = 1;
    area[c.x] = col;
  }
};
const getDelta = (start: number, end: number): number => {
  var delta: number;
  if (start < end) {
    delta = 1;
  } else if (start > end) {
    delta = -1;
  } else {
    delta = 0;
  }
  return delta;
};
const incrementsForVector = (v: Vector, area: number[][]) => {
  var dx = getDelta(v.a.x, v.b.x);
  var dy = getDelta(v.a.y, v.b.y);

  var len = Math.max(Math.abs(v.a.x - v.b.x), Math.abs(v.a.y - v.b.y));
  var { x, y } = v.a;
  var pos = 0;
  while (pos <= len) {
    incrementForCoord(<Coord>{ x, y }, area);
    x = x + dx;
    y = y + dy;
    pos++;
  }
};

const getResult = (area: number[][]) => {
  return area.reduce(
    (prev, col) =>
      prev + col?.reduce((p, c) => p + (c && c > 1 ? 1 : 0), 0) || 0,
    0,
  );
};

const parseInput = (rawInput: string) =>
  rawInput
    .replace(/\r\n/g, "\n")
    .split(/\n/g)
    .map((v) => v.trim())
    .map((v) => v.match(/^(\d+),(\d+) -> (\d+),(\d+)+$/))
    .filter((v) => v != null)
    .map((arr) => arr!.map((v) => parseInt(v, 10)))
    .map((arr) => {
      const [, ax, ay, bx, by] = arr;
      return <Vector>{ a: <Coord>{ x: ax, y: ay }, b: <Coord>{ x: bx, y: by } };
    });

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  var area: number[][] = [];
  var filtered = input.filter((v) => v.a.x === v.b.x || v.a.y === v.b.y);
  filtered.forEach((v) => incrementsForVector(v, area));
  // display(input, area)
  return getResult(area);
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  var area: number[][] = [];
  input.forEach((v) => incrementsForVector(v, area));
  return getResult(area);
};
const testInput = `
0,9 -> 5,9
8,0 -> 0,8
9,4 -> 3,4
2,2 -> 2,1
7,0 -> 7,4
6,4 -> 2,0
0,9 -> 2,9
3,4 -> 1,4
0,0 -> 8,8
5,5 -> 8,2`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 5,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 12,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});

function display(filtered: Vector[], area: number[][]) {
  const xvalues = filtered.map((v) => [v.a.x, v.b.x]).flatMap((xarr) => xarr);
  const yvalues = filtered.map((v) => [v.a.y, v.b.y]).flatMap((yarr) => yarr);
  const { min: minx, max: maxx } = getMinMax(xvalues);
  const { min: miny, max: maxy } = getMinMax(yvalues);

  console.log(`${[minx, miny, maxx, maxy]}`);
  for (var y = miny; y <= maxy; y++) {
    var line = "";
    for (var x = minx; x <= maxx; x++) {
      if (area[x] && area[x][y] && area[x][y]) {
        line = `${line}${area[x][y]}`;
      } else {
        line = `${line}.`;
      }
    }
    console.log(line);
  }
}

function getMinMax(values: number[]) {
  // should have just used Math.min etc
  return {
    min: values.reduce((p, x) => (x < p ? x : p), 999999999),
    max: values.reduce((p, x) => (x > p ? x : p), 0),
  };
}
