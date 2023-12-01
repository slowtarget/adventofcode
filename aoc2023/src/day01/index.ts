import run from "aocrunner";
const last = new RegExp(/.*(\d).*/);
const first = new RegExp(/.*?(\d).*/);
// @ts-ignore

let digits = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
let digits2 = ['0', '1', '2', '3', '4', '5', '6', '7', '8','9'];
interface Found {digit:string, location:number};
function findlettersfordigits(line: string): Found[] {
    let result: {digit:string, location:number}[] = [];
    digits.forEach((digit,i)=> {
          let pos = 0;
          while (line.indexOf(digit, pos) > -1) {
            let index = line.indexOf(digit, pos);
            if (index > -1) {
              result.push({digit: `${i + 1}`, location: index});
              pos = index + 1;
            }
          }
        }
    );
    digits2.forEach((digit,i)=> {
          let pos = 0;
          while (line.indexOf(digit, pos) > -1) {
            let index = line.indexOf(digit, pos);
            if (index > -1) {
              result.push({digit: `${i}`, location: index});
              pos = index + 1;
            }
          }
        }
    );

    // console.log({line,result})
    return result;
}
function findFirst(findings: Found[]): Found {
  let first = findings[0];
  findings.forEach((found)=> {
    if (found.location < first.location) {
      first = found;
    }
  });
  return first;
}
function findLast(findings: Found[]): Found {
  let last = findings[0];
  findings.forEach((found)=> {
    if (found.location > last.location) {
      last = found;
    }
  });
  return last;
}
function getDigit(line: string, regex: RegExp = first) {
  let match = regex.exec(line);
  return match && match[1];
}

const parseInput = (rawInput: string) => rawInput
    .split("\n");
const part1 = (rawInput: string) => {
  const input = parseInput(rawInput)
      .map((line) => ({
    first: getDigit(line, first),
    last: getDigit(line, last)}));
  return input.filter(match=> match != null ).map((match) => {
    // @ts-ignore
    // console.log(match);
    return Number.parseInt(`${match.first}${match.last}`);
  }).reduce((acc, curr) => acc + curr, 0);

};

const part2 = (rawInput: string) => {
  return  parseInput(rawInput)
      .map(line=> ({found: findlettersfordigits(line), line}))
      .map((findings) => ({...findings,
        first: findFirst(findings.found),
        last: findLast(findings.found)}))
        .map((match) => {
    // @ts-ignore
    // console.log({match, no:`${match.first.digit}${match.last.digit}`});
    return Number.parseInt(`${match.first.digit}${match.last.digit}`);
  }).reduce((acc, curr) => acc + curr, 0);
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
