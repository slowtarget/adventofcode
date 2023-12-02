import run from "aocrunner";
import * as R  from "ramda";

const last1 = new RegExp(/.*(\d).*/);
const first1 = new RegExp(/.*?(\d).*/);

const last2 = new RegExp(/.*(one|two|three|four|five|six|seven|eight|nine|\d).*/);
const first2 = new RegExp(/.*?(one|two|three|four|five|six|seven|eight|nine|\d).*/);

const digits: {[digit: string]: string} = {
    one: '1',
    two: '2',
    three: '3',
    four: '4',
    five: '5',
    six: '6',
    seven: '7',
    eight: '8',
    nine: '9'
};

const getDigit = (regex: RegExp) => {
    return R.pipe(
        R.match(regex),
        R.last,
        (x: string) => digits[x] || x
    );
}

const getSum = (first: RegExp, last: RegExp) => {
    return R.pipe(
        R.split("\n"), 
        R.map(R.applySpec({
            first: getDigit(first), 
            last: getDigit(last) 
        })),
        R.map(R.pipe( 
            R.values, 
            R.join(''),
            Number.parseInt 
        )),
        R.sum 
    );
}

const part1 = getSum(first1, last1);
const part2 = getSum(first2, last2);

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
    onlyTests: true,
});
