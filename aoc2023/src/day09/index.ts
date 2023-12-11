import run from "aocrunner";
import {aperture, converge, identity, last, map, pipe, reduce, reverse, split, sum} from "ramda";

const numbersRegex = /-?\d+/g;
const numbersFromString = pipe(
    (line: string) => line.matchAll(numbersRegex),
    Array.from,
    map(
        pipe(
            (match: RegExpMatchArray) => match[0],
            parseInt
        )
    )
)
const splitIntoPairs:(input: number[])=>(number[][]) = aperture(2);
const difference:(input:number[])=>number = (input: number[]) => input[1] - input[0];

const getDifferences = pipe(
    last,
    splitIntoPairs,
    map(difference)
)
const step:(sequences:number[][])=>number[][] = converge((diff:number[],sequences:number[][])=>{
    if (diff.every(x=>x===0)) {
        return [...sequences];
    }
    return step([...sequences, diff]);
},[getDifferences,identity])
const getLastNumber: (input:number[])=> number = last;
const getNextInSequence = pipe(
    (x)=>[x],
    step,
    map(getLastNumber),
    sum
);

const part1 = pipe(
    split("\n"),
    map(
        pipe(
            numbersFromString,
            getNextInSequence
        )
    ),
    sum
);
// 340126608 too low

const part2 = (rawInput: string) => undefined;
const input11=
`0 3 6 9 12 15
1 3 6 10 15 21
10 13 16 21 30 45`;
const input12 = `-1 -2 -3`
run({
  part1: {
    tests: [
      {
        input: input11,
        expected: 114,
      },
        {
            input: input12,
            expected: -4,
        },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      // {
      //   input: ``,
      //   expected: "",
      // },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
