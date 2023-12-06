import run from "aocrunner";

import {cond, drop, flatten, head, identity, last, map, pipe, range, split, splitEvery, T, tap} from "ramda";
import * as fs from "fs";
import assert from "assert";
// Returns current time
// (and, if provided, prints the event's name)
const now = (eventName: string | null = null) => {
    if (eventName) {
        console.log(`Started ${eventName}...`);
    }
    return new Date().getTime();
};

// Store current time as `start`
let begunAt = now();

// Returns time elapsed since `beginning`
// (and, optionally, prints the duration in seconds)
const elapsed = (eventName: string | null = null, beginning: number = begunAt, log: boolean = false) => {
    const duration = new Date().getTime() - beginning;
    if (log) {
        console.log(`${eventName}: ${duration / 1000}s`);
    }
    return duration;
};

const regex = /\d+/g;
const getFunctionPair = (input: number[]):[(x:number) => boolean, (x:number) => number] =>  {
  const [destinationStart,sourceStart, length] = input;
  return [(x:number)=> x>=sourceStart && x < (sourceStart + length), (x:number)=> destinationStart - sourceStart + x];
}

const [predicate, transformx] = getFunctionPair([50, 98, 2]);

console.log({p91:predicate(91), p98:predicate(98), p99:predicate(99), p97:predicate(97), p100:predicate(100)});
console.log({t98:transformx(98), t99:transformx(99)});

assert (predicate(98));
assert (predicate(99));
assert (!predicate(97));
assert (!predicate(100));
assert (transformx(98) === 50);
assert (transformx(99) === 51);

const test = cond([getFunctionPair([50, 98, 2]), getFunctionPair([52, 50, 48]), [T, identity]]);

function transform(mappings: number[][], x: number) {
    const t = mappings
        .map((list: number[]) => {
            const [destinationStart, sourceStart, length] = list;
            return {destinationStart, sourceStart, length};
        })
        .find((c) => (x >= c.sourceStart && x < (c.sourceStart + c.length)));
    if (t) {
        return t.destinationStart - t.sourceStart + x;
    } else {
        return x;
    }
}

const test2 = (x:number) => {
    let mappings = [[50, 98, 2],[52, 50, 48]];
    return transform(mappings, x);
}
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

[test,test2].map((fntocheck, j)=>{
    const startedAt = now(`test ${j}`);
    range(1,50000).map(i=>{
        tests.forEach(([source, expected]) => {
            assert(fntocheck(source) === expected);
        });
    })
    elapsed(`Completed test ${j}`, startedAt, true);
})



const mapLineToFunctionPair: (line: string) => number[] =
    pipe(
        (line: string) => line.matchAll(regex),
        Array.from,
        map(parseInt)
    );

const getTransform: (lines:string[]) => (x:number)=>number = (lines:string[]) => {
    const mappings = lines.map(mapLineToFunctionPair);
    return (x: number) => transform(mappings, x);
}

const getLocationsOfSeed : (pipeTransforms: ((x: number) => number)[]) => (seed:number) => number = (pipeTransforms: ((x: number) => number)[]) => {
    return (input:number) => {
        let y = input;
        pipeTransforms.forEach(t=> {
            y = t(y)
        });
        return y;
    }
}

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
    const getLocationOfThisSeed = getLocationsOfSeed(pipeTransforms);
    return seeds.map(getLocationOfThisSeed);
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
    const started = now();
    const pipeTransforms = getPipeTransforms(input);
    const transform = getLocationsOfSeed(pipeTransforms);
    elapsed("getLocationsFromRanges", started, true);
    return pipe(
        getSeeds,
        splitEvery(2),
        map(tap((x:number[])=>console.log(x[1]))),
        map(
            (range: number[]) => {
                const event = `range ${range}`;
                const eventStart = now(event);
                const [start, length] = range;
                const end = start + length;
                let min = Number.MAX_SAFE_INTEGER;
                for (let i = start; i < end; i++) {
                    const transformed = transform(i);
                    if (transformed < min) {
                        min = transformed;
                    }
                }
                elapsed(`completed ${event} min:${min}`, eventStart, true);
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
  onlyTests: true,
});
