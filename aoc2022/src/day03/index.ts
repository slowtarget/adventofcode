import run from "aocrunner";

const parseInput = (rawInput: string) => {
  return rawInput.replace(/\r\n/g, "\n").split(/\n/g);
};
// Lowercase item types a through z have priorities 1 through 26.
// Uppercase item types A through Z have priorities 27 through 52.
//  UTF-16 A-Z: 65-90 a-z: 97-122 

const getPriority = (utf16: number) => {
  if (utf16 > 90) {
    return utf16 - 97 + 1;
  }
  return utf16 - 65 + 27;
}
const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  let result = input.map(line => {
    let charsUsed = new Array<boolean>(53);
    let first = line.length / 2;
    for (let i = 0;   i <  first; i++) {
      charsUsed[getPriority(line.charCodeAt(i))] = true;
    }
    let i = first;
    while (i < line.length && charsUsed[getPriority(line.charCodeAt(i))] === undefined) {
      i++;
    }
    return getPriority(line.charCodeAt(i));
  })
  .reduce((p,c)=>p+c,0);

  return result;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);


  let result = 0;
  for (let group = 0; group < input.length / 3; group++) {
    let charCandidates = new Array<boolean>(53);
    let charCandidates2 = new Array<boolean>(53);
    const line1 = input[group * 3 + 0];
    const line2 = input[group * 3 + 1];
    const line3 = input[group * 3 + 2];
    for (let i = 0;   i <  line1.length; i++) {
      charCandidates[getPriority(line1.charCodeAt(i))] = true;
    }
    for (let i = 0;   i <  line2.length; i++) {
      const priority = getPriority(line2.charCodeAt(i));
      charCandidates2[priority] = charCandidates[priority];
    }
    let i = 0;
    while (i < line3.length && charCandidates2[getPriority(line3.charCodeAt(i))] === undefined) {
      i++;
    }
    result += getPriority(line3.charCodeAt(i));
  }

  return result;
};

const testInput = `
vJrwpWtwJgWrhcsFMMfFFhFp
jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL
PmmdzqPrVvPwwTWBwg
wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn
ttgJtRGJQctTZtZT
CrZsJsPPZsGzwwsLwLmpwMDw
`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 157,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 70,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
