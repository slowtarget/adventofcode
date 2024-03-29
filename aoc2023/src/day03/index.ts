import run from "aocrunner";
import {addIndex, aperture, append, flatten, map, pipe, prepend, split, sum} from "ramda";

const nextNumber: RegExp = /(.*?)(\d+)(.*)/;

// const regex = /(\d+)/g;

interface Triplet {
    index: number,
    prev: string,
    curr: string,
    next: string
};

interface Point {
    x: number,
    y: number
};

var mapIndexed = addIndex(map);
const splitToSubLists = pipe(
    prepend(''),
    append(''),
    aperture(3),
    mapIndexed((v, i: number) => ({v, i}))
);
console.log(JSON.stringify({test: splitToSubLists('abcdefg'.split(''))}));
const splitToSubListsOf3 = (lines: string[]): Triplet[] =>
    lines.map((curr: string, index: number, self: string[]) => {
        const prev = index === 0 ? "" : self[index - 1];
        const next = index === self.length - 1 ? "" : self[index + 1];
        return {index, prev, curr, next};
    });
let gears: { [gear: string]: number[] } = {};

function getAllIndexes(arr: string, val: string): number[] {
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i + 1)) != -1) {
        indexes.push(i);
    }
    return indexes;
}

const toPoint = [
    (y: number, start: number, end: number, foundAt: number): Point => ({x: start, y}),
    (y: number, start: number, end: number, foundAt: number): Point => ({x: end - 1, y}),
    (y: number, start: number, end: number, foundAt: number): Point => ({x: start + foundAt, y: y - 1}),
    (y: number, start: number, end: number, foundAt: number): Point => ({x: start + foundAt, y: y + 1}),
]
const toPartNumbers = (triplet: Triplet): number[] => {
    const {index: y, prev, curr, next} = triplet;
    let match = curr.match(nextNumber);
    let index = 0;
    let result = [];
    // 0 1 2 3 4 5 6 7 8 9
    //       1 2 3
    // . . . . . . * . . . . prev?
    // . . . 1 2 3 . . . . . curr
    // . . . . . . . . . . . next?

    while (match) {
        const [, prefix, num, postfix] = match;
        const partNo = parseInt(num);
        let start = index + (prefix ? prefix.length - 1 : 0);
        let end = start + num.length + (prefix ? 1 : 0) + (postfix ? 1 : 0);

        const test = [prefix && prefix[prefix.length - 1],
            postfix && postfix[0],
            prev && prev.substring(start, end),
            next && next.substring(start, end)];

        let found = test.join('').replace(/\.|\d/g, '');

        const isPartNo = found.length > 0;

        if (isPartNo) {
            result.push(partNo);

            const gearsAt = test
                .map((x, i) => getAllIndexes(x, '*')
                    .map(foundAt => toPoint[i](y, start, end, foundAt)))
                .flat()
                .map(point => `${point.x}_${point.y}`);

            gearsAt.forEach(gearAt => {
                gears[gearAt] = gears[gearAt] || [];
                gears[gearAt].push(partNo);
            });
            if (false) {
                console.log({
                    prev,
                    curr,
                    next,
                    prefix,
                    postfix,
                    index,
                    start,
                    end,
                    comp: curr.substring(start, end),
                    test,
                    isPartNo,
                    partNo,
                    gearsAt,
                    gears
                });
            }
        }

        index = index + prefix.length + num.length;
        match = postfix.match(nextNumber);
    }
    return result;
}
const part1 = pipe(
    (input) => {
        gears = {};
        return input;
    },
    split("\n"),
    splitToSubListsOf3,
    map(toPartNumbers),
    flatten,
    sum
)

const part2 = (rawInput: string) => {
    part1(rawInput);
    // console.log({gears, outliers: Object.values(gears).filter(x=>x.length > 2)});
    return Object.values(gears).filter(x => x.length === 2).map(x => x[0] * x[1]).reduce((acc, curr) => acc + curr, 0);
};
// 63134035 is too low
// 62666200 is too low

let input = [`467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..`,
    `12.......*..
+.........34
.......-12..
..78........
..*....60...
78..........
.......23...
....90*12...
............
2.2......12.
.*.........*
1.1.......56`,
    `12.......*..
+.........34
.......-12..
..78........
..*....60...
78.........9
.5.....23..$
8...90*12...
............
2.2......12.
.*.........*
1.1..503+.56`,
    `100
200`,
    `2*3`];

run({
    part1: {
        tests: [
            {
                input: input[0],
                expected: 4361,
            },
            {
                input: input[1],
                expected: 413,
            },
            {
                input: input[2],
                expected: 925,
            },
            {
                input: input[3],
                expected: 0,
            },
            {
                input: input[4],
                expected: 5,
            },
            {
                input: `....................
..-52..52-..52..52..
..................-.`,
                expected: 156,
            },

        ],
        solution: part1,
    },
    part2: {
        tests: [
            {
                input: input[0],
                expected: 467835,
            },
            {
                input: input[1],
                expected: 6756,
            },
            {
                input: input[2],
                expected: 6756,
            },
            {
                input: input[4],
                expected: 6,
            },
            {
                input: `.....24.*23.
..10........
..397*.610..
.......50...
1*2..4......`,
                expected: 2,
            },
            {
                input:
                    `333.3
...*.`,
                expected: 999,
            },
            {
                input:
                    `..101...
.102*103.
...104...`,
                expected: 0
            }
        ],
        solution: part2,
    },
    trimTestInputs: true,
    onlyTests: false,
});
