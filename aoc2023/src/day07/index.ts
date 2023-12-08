import run from "aocrunner";
import {map, pipe, sort, split, sum, tap} from "ramda";

const types:{[type:string]:number} = {
    '5':7,
    '4_1':6,
    '3_2':5,
    '3_1_1':4,
    '2_2_1':3,
    '2_1_1_1':2,
    '1_1_1_1_1':1,
}

const cardValues:{[card:string]:number} = {
    'A':13,
    'K':12,
    'Q':11,
    'J':10,
    'T':9,
    '9':8,
    '8':7,
    '7':6,
    '6':5,
    '5':4,
    '4':3,
    '3':2,
    '2':1,
}


const positionMultiplier= [
    14*14*14*14*14*14,
    14*14*14*14*14,
    14*14*14*14,
    14*14*14,
    14*14,
    14,
    1];
class Hand {
    power?:number = undefined;
    power2?:number = undefined;
    bid:number;
    cards:string;
    rank:number = 0;
    constructor(input:string) {
        const [cards, bid] = input.split(" ");
        this.bid = parseInt(bid.trim());
        this.cards = cards;
        this.power = this.calculatePower();
        this.power2 = this.calculatePower2();
    }

    calculatePower = () => {
        const distribution: {[key:string]:number} = {};
        let handValue= 0;
        this.cards.split("").forEach(
                (card:string, index:number) => {
                    distribution[card] = distribution[card] ? distribution[card] + 1 : 1;
                    handValue = handValue + cardValues[card] * positionMultiplier[index + 1];
                }
            );
        const type = Object.values(distribution).sort().reverse().join("_");
        const power = handValue + types[type] * positionMultiplier[0];
        // console.log({cards:this.cards, type, score: power});
        return power;
    }
    calculatePower2 = () => {
        const distribution2: {[key:string]:number} = {};
        let jokers=0;
        let handValue= 0;
        this.cards.split("").forEach(
            (card:string, index:number) => {

                if(card === 'J') {
                    //joker
                    jokers ++;
                } else {
                    distribution2[card] = distribution2[card] ? distribution2[card] + 1 : 1;
                    handValue = handValue + cardValues[card] * positionMultiplier[index + 1];
                }
            }
        );

        const distributionSorted = Object.values(distribution2).sort().reverse();
        if (distributionSorted.length === 0) {
            // just jokers
            distributionSorted[0] = 5;
        } else {
            distributionSorted[0]=distributionSorted[0] + jokers;
        }

        const type = distributionSorted.join("_");

        const power = handValue + types[type] * positionMultiplier[0];
        // console.log({cards:this.cards, type, score: power});
        return power;
    }
}
const rankHands = sort<Hand>((a,b)=> a.power! - b.power!)
const rankHands2 = sort<Hand>((a,b)=> a.power2! - b.power2!)

const part1 =     pipe(
    split("\n"),
    map((input) => new Hand(input)),
    rankHands,
    tap((hands:Hand[]) => hands.forEach((hand, index)=>hand.rank = index + 1)),
    //tap(console.log),
    (hands:Hand[]) => hands.map((hand, index)=>hand.bid * hand.rank),
    sum
);

const part2 = pipe(
    split("\n"),
    map((input) => new Hand(input)),
    rankHands2,
    tap((hands:Hand[]) => hands.forEach((hand, index)=>hand.rank = index + 1)),

    tap((hands:Hand[]) => hands.forEach((hand, index)=>console.log({hand: hand.cards, rank: hand.rank, bid: hand.bid, win: hand.bid * hand.rank}))),
    (hands:Hand[]) => hands.map((hand, index)=>hand.bid * hand.rank ),
    sum
);
const input =
`32T3K 765
T55J5 684
KK677 28
KTJJT 220
QQQJA 483`;
const input2 =
`2345A 1
Q2KJJ 13
Q2Q2Q 19
T3T3J 17
T3Q33 11
2345J 3
J345A 2
32T3K 5
T55J5 29
KK677 7
KTJJT 34
QQQJA 31
JJJJJ 37
JAAAA 43
AAAAJ 59
AAAAA 61
2AAAA 23
2JJJJ 53
JJJJ2 41`;
run({
  part1: {
    tests: [
      {
        input,
        expected: 6440,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input,
        expected: 5905,
      },
        {
            input: input2,
            expected: 6839,
        },
        {input: `JJJJJ 1
KKKKK 2`,
        expected: 5},
        {input: `33J32 2
2AAJA 1`,
            expected: 5},
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
