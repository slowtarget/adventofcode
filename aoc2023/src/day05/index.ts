import run from "aocrunner";

import {
    add,
    append,
    both,
    cond,
    drop,
    flatten,
    gt,
    head,
    identity,
    last,
    lte,
    map,
    pipe,
    range,
    split,
    splitEvery,
    T,
    tap
} from "ramda";
import * as fs from "fs";
import assert from "assert";


const regex = /\d+/g;
const getFunctionPair = (input: number[]):[(x:number) => boolean, (x:number) => number] =>  {
  const [destinationStart,sourceStart, length] = input;
  return [both(lte(sourceStart), gt(sourceStart + length)), add(destinationStart - sourceStart)];
}

const [predicate, transform] = getFunctionPair([50, 98, 2]);

console.log({p91:predicate(91), p98:predicate(98), p99:predicate(99), p97:predicate(97), p100:predicate(100)});
console.log({t98:transform(98), t99:transform(99)});

assert (predicate(98));
assert (predicate(99));
assert (!predicate(97));
assert (!predicate(100));
assert (transform(98) === 50);
assert (transform(99) === 51);

const test = cond([getFunctionPair([50, 98, 2]), getFunctionPair([52, 50, 48]), [T, identity]]);
// seed  soil
// source expected
const tests = [
[0,     0],
[1,     1],
[48,    48],
[49,    49],
[50,    52],
[51,    53],
[96,    98],
[97,    99],
[98,    50],
[99,    51]];
tests.forEach(([source, expected]) => {
    const actual = test(source);
    console.log({source, expected, actual});
    assert(actual === expected);
});
type FunctionPair = [(x:number) => boolean, (x:number) => number];
const mapLineToFunctionPair: (line: string) => FunctionPair =
    pipe(
        (line: string) => line.matchAll(regex),
        Array.from,
        map(parseInt),
        getFunctionPair
    );

const getDefaultFunctionPair: () => FunctionPair = () => [T, identity];

const mapLinesToFunctionPairs: (lines:string[]) => FunctionPair[] =
    pipe(
        map(mapLineToFunctionPair),
        append(getDefaultFunctionPair()),
    );

const getTransform = pipe(
      tap((x:string[])=>console.log({title:"getting transform", t:x[0]})),
      drop(1),
      mapLinesToFunctionPairs,
      cond<any[], number>
  );

const getLocationsOfSeeds : (pipeTransforms: ((x: number) => number)[]) => (seeds:number[]) => number[] = (pipeTransforms: ((x: number) => number)[]) =>
    map(
        pipe(
            pipeTransforms[0],
            pipeTransforms[1],
            pipeTransforms[2],
            pipeTransforms[3],
            pipeTransforms[4],
            pipeTransforms[5],
            pipeTransforms[6]
        )
    );


const getPipeTransforms = pipe(
        (x: string[]) => drop(1, x),
        map(
            pipe(
                split("\n"),
                getTransform
            )
        )
    );

const getLocations = (input: string[]):number[] => {
    const seeds = pipe(
      head,
      split(": "),
      last,
      (line: string) => line.matchAll(regex),
      Array.from,
      map(
        pipe(
          head,
          parseInt
        )
      )
    )(input);
    console.log({seeds});
    const pipeTransforms = getPipeTransforms(input);
    return getLocationsOfSeeds(pipeTransforms)(seeds);
}

const getSeeds: (input: string[]) => number[] =
    pipe(
        head,
        split(": "),
        last,
        (line: string) => line.matchAll(regex),
        Array.from,
        map(
            pipe(
                (match: RegExpMatchArray) => match[0],
                parseInt
            )
        )
    );

console.log("test seed ranges",pipe(
    splitEvery(2),
    map((y: number[])=>range(y[0], y[0] + y[1])),
    flatten
)([1,5,8,2])); // [1,2,3,4,5,8,9]
const getLocationsFromRanges = (input: string[]):number[] => {
    const pipeTransforms = getPipeTransforms(input);
    const transform = getLocationsOfSeeds(pipeTransforms);
    return pipe(
        getSeeds,
        splitEvery(2),
        map(tap((x:number[])=>console.log(x[1]))),
        map(
            (range: number[]) => {
                console.log({title:"starting range ", range, now: Date.now()});
                const [start, length] = range;
                const end = start + length;
                let min = Number.MAX_SAFE_INTEGER;
                for (let i = start; i < end; i++) {
                    const [transformed] = transform([i]);
                    if (transformed < min) {
                        min = transformed;
                    }
                }
                return min;
            }
        )
    )(input);
}

// there's probably some clever way to work this problem backwards ... find the lowest location range then see what maps to that ... etc. etc.
const part1 =
    pipe(
      split("\n\n"),
        getLocations,
        (x:number[])=>Math.min(...x)
    );


const part2 =
    pipe(
        split("\n\n"),
        getLocationsFromRanges,
        (x:number[])=>Math.min(...x)
    );


const testInput = fs.readFileSync("./src/day05/testInput.txt", 'utf8');
console.log(testInput);

run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 35,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 46,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
