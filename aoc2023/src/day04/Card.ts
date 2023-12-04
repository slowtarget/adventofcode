import {append, map, pipe, sum } from "ramda";

export class Card {
    index: number;
    matches: number;
    won: Card[] = [];
    constructor(index:number, matches:number){
        this.index = index;
        this.matches = matches;
    }

    cardsWon = (): number => {
        return this.cardsWonMap();
    }
    cardsWonMap = (): number => {
        return 1 + this.won.map(c => c.cardsWon()).reduce((a,b)=>a+b,0);
    }

    // look at memoize or summat - this takes ages - 3500ms cf. 200ms
    cardsWonRamda = (): number => {
        return pipe (
            map(
                (c: Card) => c.cardsWon()
            ),
            append(1),
            sum
        )(this.won)
    }
}