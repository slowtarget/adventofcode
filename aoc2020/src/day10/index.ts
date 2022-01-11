import run from "aocrunner";

const isValid = (input: number, preamble: number[]) => {
  const result = preamble.some(a => preamble.filter(b => b > a).some(b => b + a === input));
  return result;
}

const parseInput = (rawInput: string) => {
  var data = rawInput
    .replace(/\r\n/g, '\n')
    .split(/\n/g)
    .map(v => v.trim())
    .map(v => parseInt(v, 10));
  data.sort((a, b) => a - b);
  return data;
}


const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  input.push(input[input.length - 1] + 3);
  var ranges = new Array(4).fill(0);
  var p = 0;
  input.forEach(c => { ranges[c - p]++; p = c; });
  return ranges[3] * ranges[1];
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  input.push(input[input.length - 1] + 3);
  var runs = new Array(5).fill(0);
  var runOfOnes = 0;
  var p = 0;

  input.forEach(c => {
    if (c - p === 1) {
      runOfOnes++;
    } else if (c - p === 3) {
      runs[runOfOnes]++;
      runOfOnes = 0;
    }
    p = c;
  });

  return 7 ** runs[4] * 4 ** runs[3] * 2 ** runs[2];
};

const testInput = `
28
33
18
42
31
14
46
20
48
47
24
23
49
45
19
38
39
11
1
32
25
35
8
17
7
9
4
2
34
10
3`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 220,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 19208,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
