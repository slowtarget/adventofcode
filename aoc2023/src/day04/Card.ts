import {append, map, once, pipe, prop, sum} from "ramda";


export class Card {
    index: number;
    matches: number;
    won: Card[] = [];
    constructor(index:number, matches:number){
        this.index = index;
        this.matches = matches;
    }
    cardsWonMapReduce = (): number => {
        return 1 + this.won.map(c => c.cardsWon()).reduce((a,b)=>a+b,0);
    }

    // look at memoize or summat - this takes ages - 3500ms cf. 200ms
    cardsWonPipe = pipe (
        prop('won'),
        map(
            (c: Card) => c.cardsWon()
        ),
        append(1),
        sum
    );
    //1400ms if defined globally as a const
    cardsWonRamda = (): number => {
        return this.cardsWonPipe(this)
    }

    cardsWon = this.cardsWonRamda;
}