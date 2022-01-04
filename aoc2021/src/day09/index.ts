import run from "aocrunner";
type Point = {
  value: number,
  x: number,
  y: number
};

const parseInput = (rawInput: string): [Point[][], Point[]] => {
  var input = rawInput
    .replace(/\r\n/g, '\n')
    .split(/\n/g)
    .map(v => v.trim())
    .map(v => v.split('').map(w => parseInt(w, 10)));

  var wall: number[] = new Array(input[0].length).fill(9);
  var data = [wall, ...input, wall].map(row => [9, ...row, 9]);
  var points = data.map((row, i) => row.map((cell, j) => <Point>{ value: cell, y: i, x: j }));
  return [points, points.map(row =>
    row.filter((lp) => lp.y > 0 && lp.y < data.length - 1)
      .filter((lp) => lp.x > 0 && lp.x < data[0].length - 1)
      .filter((lp) => data[lp.y - 1][lp.x] > lp.value)
      .filter((lp) => data[lp.y + 1][lp.x] > lp.value)
      .filter((lp) => data[lp.y][lp.x - 1] > lp.value)
      .filter((lp) => data[lp.y][lp.x + 1] > lp.value))
    .flatMap(a => a)];
}

const getAdjacentBasin = (p: Point, points: Point[][]): Point[] => {
  return [
    points[p.y - 1][p.x],
    points[p.y + 1][p.x],
    points[p.y][p.x - 1],
    points[p.y][p.x + 1],
  ].filter(q => q.value < 9);
}

const getBasinSize = (p: Point, points: Point[][]): number => {

  var basin: Point[] = [];
  var unchecked: Point[] = [];
  var found: Point[] = [p];

  while (found.length > 0) {
    unchecked = [...found];
    basin = [...basin, ...found];
    found = [];
    for (var q of unchecked) {
      var adjacent = getAdjacentBasin(q, points);
      adjacent.filter(f => !found.includes(f))
        .filter(f => !basin.includes(f))
        .forEach(f => found.push(f));
    }
  }
  return basin.length;
}

const part1 = (rawInput: string) => {
  const [, low] = parseInput(rawInput)

  return low.map((lp) => lp.value + 1).reduce((p, c) => p + c, 0);
};

const part2 = (rawInput: string) => {
  const [all, low]: [Point[][], Point[]] = parseInput(rawInput);

  return low.map((lp) => getBasinSize(lp, all)).sort((a, b) => b - a).slice(0, 3).reduce((p, c) => p * c, 1);
};

const testInput = `
2199943210
3987894921
9856789892
8767896789
9899965678`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 15,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 1134,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
