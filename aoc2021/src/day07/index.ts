import run from "aocrunner";

const parseInput = (rawInput: string) => rawInput
  .replace(/\r\n/g, '\n')
  .split(/,/g)
  .map(v => v.trim())
  .map(v => parseInt(v, 10));

const cost = (v: number): number => {
  return (v + 1) / 2 * v;
}


const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  // console.log(`input ${JSON.stringify(input)}`)
  var data = [...input]
  data.sort((a, b) => a - b);
  var median = data[Math.floor(data.length / 2)];

  return data.reduce((p, c) => p + Math.abs(c - median), 0);;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  // console.log(`input ${JSON.stringify(input)}`)
  var data = [...input]
  var sum = data.reduce((p, c) => p + c, 0);
  var avg = sum / data.length;

  // console.log(`avg  ${avg}`)
  var target = Math.round(avg);
  return data.reduce((p, c) => p + cost(Math.abs(c - target)), 0);;
};

const testInput = `16,1,2,0,4,2,7,1,2,14`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 37,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 168,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});

