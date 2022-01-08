import run from "aocrunner";
var Reset = "\x1b[0m";
var FgYellow = "\x1b[33m";
const ALL_DARK = '.........';
type Image = { [key: string]: { x: number, y: number, key: string } };
type Algorithm = { [key: string]: { key: string; char: string; i: number; bin: string; } }

const toKey = (x: number, y: number): string => {
  return `${x},${y}`;
}
const adjacent = [-1, 0, 1];
const beside = adjacent.map(y => adjacent.map(x => ({ dx: x, dy: y }))).flatMap(a => a);
console.log(beside);

const getAlgorithmKey = (x: number, y: number, image: Image, inputIsNegative: boolean) => {
  var neighbours = beside.map(a => ({ x: a.dx + x, y: a.dy + y }))
    .map(({ x: ax, y: ay }) => ({ x: ax, y: ay, key: toKey(ax, ay) }));
  var algorithmKey: string;
  if (inputIsNegative) {
    algorithmKey = neighbours
      .map(({ key }) => image[key])
      .map(s => (s !== undefined) ? '.' : '#')
      .join('');
  } else {
    algorithmKey = neighbours
      .map(({ key }) => image[key])
      .map(s => (s !== undefined) ? '#' : '.')
      .join('');
  }

  return { algorithmKey, neighbours }
}

const toString = (image: Image) => {
  var maxX = Object.values(image).map(({ x }) => x).reduce((p, c) => c > p ? c : p, Number.MIN_VALUE);
  var maxY = Object.values(image).map(({ y }) => y).reduce((p, c) => c > p ? c : p, Number.MIN_VALUE);
  var minX = Object.values(image).map(({ x }) => x).reduce((p, c) => c < p ? c : p, Number.MAX_VALUE);
  var minY = Object.values(image).map(({ y }) => y).reduce((p, c) => c < p ? c : p, Number.MAX_VALUE);
  var result = "\n";
  for (var y = minY - 5; y < maxY + 5; y++) {
    var line = "";
    for (var x = minX - 5; x < maxX + 5; x++) {
      var char = (image[toKey(x, y)] !== undefined) ? '#' : '.';
      line += char;
    }
    result += line + "\n";
  }
  return result + "\n";
}

const evaluate = (algorithm: Algorithm, input: Image, even: boolean) => {
  var trackDark: boolean;
  var inputIsNegative: boolean;
  if (!even && algorithm[ALL_DARK].char === '#') {
    trackDark = true;
  } else {
    trackDark = false;
  }
  if (even && algorithm[ALL_DARK].char === '#') {
    inputIsNegative = true;
  } else {
    inputIsNegative = false;
  }

  var result: Image = {};
  var toProcess: Image = {};

  Object.values(input)
    .forEach((old) => {
      var { algorithmKey, neighbours } = getAlgorithmKey(old.x, old.y, input, inputIsNegative);
      if (trackDark) {
        if (algorithm[algorithmKey].char === '.') {
          result[old.key] = old;
        }
      } else {
        if (algorithm[algorithmKey].char === '#') {
          result[old.key] = old;
        }
      }
      neighbours
        .forEach((nbr) => {
          toProcess[nbr.key] = nbr;
        });
    });

  Object.values(toProcess)
    .filter(({ key }) => input[key] === undefined)
    .forEach(unp => {
      var { algorithmKey } = getAlgorithmKey(unp.x, unp.y, input, inputIsNegative);
      if (trackDark) {
        if (algorithm[algorithmKey].char === '.') {
          result[unp.key] = unp;
        }
      } else {
        if (algorithm[algorithmKey].char === '#') {
          result[unp.key] = unp;
        }
      }
    });
  return result;
}

const findSolution = (algorithm: Algorithm, input: Image) => {
  // so I was only tracking lit cells --- then looked at the full input and '.........' now maps to lit - so lit to infinity
  // have each day switch ? so return dark cells on odd evaluations, and lit cells on even evaluations (but only when '.........' => '#')
  var result = {};
  var twice: Image = { ...input };

  for (var i = 0; i < 25; i++) {
    twice = evaluate(algorithm, evaluate(algorithm, twice, false), true);
    if (i === 0) {
      result = { part1: Object.keys(twice).length };
    }
  }

  // console.log(toString(input),toString(twice));
  return { ...result, part2: Object.keys(twice).length };
};
const parseInput = (rawInput: string) => {
  var [algorithmInput, imageInput] = rawInput
    .replace(/\r\n/g, '\n')
    .split(/\n\n/g);

  var algorithm: Algorithm = {};
  algorithmInput
    .split('')
    .map((char, i) => ({ char, i }))
    .map(({ char, i }) => ({ char, i, bin: i.toString(2).padStart(9, '0') }))
    .map(a => ({ ...a, key: a.bin.replace(/0/g, '.').replace(/1/g, '#') }))
    .forEach(a => { algorithm[a.key] = a; });

  var image: Image = {};
  imageInput
    .split(/\n/g)
    .forEach((line, y) => line
      .split('')
      .map((char, x) => ({ char, x }))
      .filter(({ char }) => char === '#')
      .forEach(({ x }) => {
        image[toKey(x, y)] = { x, y, key: toKey(x, y) };
      }));

  return findSolution(algorithm, image)

}


const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return input.part1;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return input.part2;
};

const testInput = `
..#.#..#####.#.#.#.###.##.....###.##.#..###.####..#####..#....#..#..##..###..######.###...####..#..#####..##..#.#####...##.#.#..#.##..#.#......#.###.######.###.####...#.##.##..#..#..#####.....#.#....###..#.##......#.....#..#..#..##..#...##.######.####.####.#.#...#.......#..#.#.#...####.##.#......#..#...##.#.##..#...##.#.##..###.#......#.#.......#.#.#.####.###.##...#.....####.#..#..#.##.#....##..#.####....##...##..#...#......#.#.......#.......##..####..#...#.#.#...##..#.#..###..#####........#..####......#..#

#..#.
#....
##..#
..#..
..###`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 35,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 3351,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
