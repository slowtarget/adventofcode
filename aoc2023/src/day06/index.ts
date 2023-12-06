import run from "aocrunner";
import {last, map, pipe, product, replace, split} from "ramda";
import assert from "assert";

const matchNumbers = /\d+/g
const stringToNumbers = (line: string):number[] => {
    let iter = line.matchAll(matchNumbers);
    const arr = Array.from(iter);
    return arr.map(x => parseInt(x[0]));
}
const takeRight: (delim: string) => (input: string) => number[] = (delim:string) =>
    pipe (
      split(delim),
      last,
      stringToNumbers
    );

const takeRight2: (delim: string) => (input: string) => number[] = (delim:string) =>
    pipe (
        split(delim),
        last,
        replace(/\s/g, ""),
        stringToNumbers
    );
const alwaysRoundUp = (n: number) => {
    return Math.floor(n) + 1 ;
}

const alwaysRoundDown = (n: number) => {
    const i = Math.floor(n);
    return n === i ? i -1 : i;
}

[
    {value: 1.1, up: 2, down: 1},
    {value: 1.2, up: 2, down: 1},
    {value: 1.3, up: 2, down: 1},
    {value: 1.4, up: 2, down: 1},
    {value: 1.5, up: 2, down: 1},
    {value: 1.6, up: 2, down: 1},
    {value: 1.7, up: 2, down: 1},
    {value: 1.8, up: 2, down: 1},
    {value: 1.9, up: 2, down: 1},
    {value: 2.0, up: 3, down: 1},
].forEach(({value, up, down}) => {
    console.log({value, up: alwaysRoundUp(value), down: alwaysRoundDown(value), expectedUp: up, expectedDown: down});
    assert(alwaysRoundUp(value) === up);
    assert(alwaysRoundDown(value) === down);
});
const calculateNumberOfOptions = (input: {time:number, distance:number}):number => {
    // d = v(T-t)
    // v = t
    // d = -t^2 + Tt
    // 0 = -t^2 + Tt - d
    // a= -1, b = T, c = -d
    // t = (-T +- sqrt(T^2 - 4d))/-2
    const {time, distance} = input;
    let partial = Math.sqrt(time*time - 4*distance);
    const t1 = alwaysRoundUp((-time + partial)/(-2));
    const t2 = alwaysRoundDown((-time - partial)/(-2));

    console.log({time, distance, t1, t2});

    return t2 - t1 + 1;
}
const part1 =
    pipe(
        split("\n"),
        map(takeRight(": ")),
        (input: number[][]):{time:number, distance:number}[] => {
          const [times, distances] = input;
          console.log({input});
          return times.map((time, index) => ({time, distance: distances[index]}))
        },
        map(calculateNumberOfOptions),
        product
  );

const part2 = pipe(
    split("\n"),
    map(takeRight2(": ")),
    (input: number[][]):{time:number, distance:number}[] => {
        const [times, distances] = input;
        console.log({input});
        return times.map((time, index) => ({time, distance: distances[index]}))
    },
    map(calculateNumberOfOptions),
    product
)

let input1 = `Time:      7  15   30
Distance:  9  40  200`;
run({
  part1: {
    tests: [
      {
        input: input1,
        expected: 288,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: input1,
        expected: 71503,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
