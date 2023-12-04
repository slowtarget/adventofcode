import run from "aocrunner";
import {Card} from "./Card.js";
import {
    clamp,
    flatten,
    join,
    juxt,
    last,
    map,
    match,
    pipe,
    split,
    sum,
    tap
} from "ramda";

const parseInput = (rawInput: string) => rawInput;
const getMatches = (line: string[]): number => {

    const [winningList, haveList] = line
        .map((x) => x.trim().split(/\s+/)
            .map(n => parseInt(n)));

    const matches = haveList.filter((have) => winningList.includes(have)).length;
    const score = matches ? Math.pow(2, matches - 1) : 0;
    // console.log({line, matches,winningList,haveList, score});
    return matches;
}

const getScore = pipe(
    split(": "),
    last,
    split(" | "),
    getMatches);

const part1 = pipe(
    split("\n"),
    map(pipe(
        getScore,
        (matches) => matches ? Math.pow(2, matches - 1) : 0)),
    sum
);
const getLinkedCards = (cardsIn: number[]): Card[] => {
    const cards = cardsIn.map((matches, index) => new Card(index, matches));
    cards.forEach((card: Card, index: number) => {
        card.won = cards.slice(index + 1, index + card.matches + 1);
    });
    return cards;
}

const part2 = pipe(
    split("\n"),
    map(getScore),
    getLinkedCards,
    map((card: Card) => card.cardsWon()),
    sum
);

let input = `Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11`;
run({
    part1: {
        tests: [
            {
                name: 'aoc supplied example',
                input: input,
                expected: 13,
            },
        ],
        solution: part1,
    },
    part2: {
        tests: [
            {
                name: 'aoc supplied example',
                input: input,
                expected: 30,
            },
        ],
        solution: part2,
    },
    trimTestInputs: true,
    onlyTests: false,
});
