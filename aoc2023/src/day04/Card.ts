export class Card {
    index: number;
    matches: number;
    won: Card[] = [];
    constructor(index:number, matches:number){
        this.index = index;
        this.matches = matches;
    }

    cardsWon = (): number => {
        // this card + cards won by this card
        return 1 + this.won.map(c => c.cardsWon()).reduce((a,b)=>a+b,0);
    }
}