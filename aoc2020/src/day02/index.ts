import run from "aocrunner";
// 3-11 z: zzzzzdzzzzlzz
// 3-7 x: xjxbgpxxgtx
type Input = { range: { from: number, to: number }, letter: string, password: string };
const parseInput = (rawInput: string) => {
  const regex = /(\d+)\-(\d+)\s(\w)\:\s(\w+)/g;
  var m: RegExpExecArray;
  var result: Input[] = []
  while ((m = regex.exec(rawInput)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    result.push({
      range: { from: parseInt(m[1], 10), to: parseInt(m[2], 10) }, letter: m[3], password: m[4]
    });

  }
  return result;
}

const isValidSledRental = (input: Input) => {
  var matches = input.password.split("").filter(a => a == input.letter).length;
  return matches >= input.range.from && matches <= input.range.to;
}
const isValidToboggan = (input: Input) => {
  var matches = (input.password[input.range.from - 1] === input.letter) ? 1 : 0;
  matches = matches + ((input.password[input.range.to - 1] === input.letter) ? 1 : 0);
  return matches === 1;
}
const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return input.filter(entry => isValidSledRental(entry)).length;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return input.filter(entry => isValidToboggan(entry)).length;
};

const testInput = `
1-3 a: abcde
1-3 b: cdefg
2-9 c: ccccccccc`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 2,
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
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
