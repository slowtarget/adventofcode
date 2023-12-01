import run from "aocrunner";

const last1 = new RegExp(/.*(\d).*/);
const first1 = new RegExp(/.*?(\d).*/);

const last2 = new RegExp(/.*(one|two|three|four|five|six|seven|eight|nine|\d).*/);
const first2 = new RegExp(/.*?(one|two|three|four|five|six|seven|eight|nine|\d).*/);

const digitLookup: {[key: string]: string} = {
    'one': '1',
    'two': '2',
    'three': '3',
    'four': '4',
    'five': '5',
    'six': '6',
    'seven': '7',
    'eight': '8',
    'nine': '9'
    };
function getDigit(line: string, regex: RegExp) {
  let match = regex.exec(line);
  if (match === null) {throw new Error(`No match found for ${regex} in ${line}`);}
  let digit = match[1];
  return digitLookup[digit] || digit;
}

function getResult(rawInput: string, first: RegExp, last: RegExp) {
    return rawInput
        .split("\n")
        .map((line) => ({
            first: getDigit(line, first),
            last: getDigit(line, last)
        }))
        .map((x) => Number.parseInt(`${x.first}${x.last}`))
        .reduce((acc, curr) => acc + curr, 0);
}

const part1 = (rawInput: string) => {
    return getResult(rawInput, first1, last1);

};
const part2 = (rawInput: string) => {
    return getResult(rawInput, first2, last2);
};

let input1 = `1abc2
pqr3stu8vwx
a1b2c3d4e5f
treb7uchet`;

let input2 = `two1nine
eightwothree
abcone2threexyz
xtwone3four
4nineeightseven2
zoneight234
7pqrstsixteen`;

run({
  part1: {
    tests: [
      {
        input: input1,
        expected: 142,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: input2,
        expected: 281,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
