import run from "aocrunner";
type Alphabet = {
  [key: string]: boolean
}
const parseInput = (rawInput: string) => {
  return rawInput
    .replace(/\r\n/g, '\n')
    .split(/\n\n/g)
    .map(a => a.split(/\n/));
}


const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return input.map(group => group.map(entry => entry.split("").reduce((p, c) => ({ ...p, [c]: true }), {}))
    .reduce((p, c) => ({ ...p, ...c }), {})
  ).reduce((p: number, c: Alphabet) => p + Object.entries(c).length, 0);
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return input.map(group => group.map(entry => entry.split("").reduce((p, c) => ({ ...p, [c]: true }), {}))
    .reduce((p: Alphabet, c: Alphabet) => {
      if (p.undef) {
        return c;
      }
      var r: Alphabet = {};
      Object.entries(c).map(entry => entry[0]).forEach(key => {
        if (p[key]) {
          r[key] = true;
        }
      });
      return r;
    }, { undef: true })
  ).reduce((p: number, c: Alphabet) => p + Object.entries(c).length, 0);
};

const testInput = `
abc

a
b
c

ab
ac

a
a
a
a

b`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 11,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 6,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
