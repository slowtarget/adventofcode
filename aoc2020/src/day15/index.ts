import run from "aocrunner";
import * as Logger from "bunyan";

var log = Logger.createLogger({ name: "2020 day15", level: "info" });
type Plays={[index:number]:number}

class Game {
    public plays:number[] = new Array(30000000);
    public turn:number = 0;
    public last:number = 0;
    public next:number = 0;
    constructor(
        public starts: number[]
    ){
        starts.forEach((x,i)=>{
          this.turn = i+1;
          this.plays[x] = this.turn;
          this.last = x;
        });
        this.next = 0;
    }

    public play(){
        this.turn++;
        var x = this.next;
        if (this.plays[x]===undefined){
            this.plays[x] = this.turn;

            log.debug({turn:this.turn, spoken:x, next:0});
            this.next = 0;
            return x;
        }
        var previous = this.plays[x];
        this.plays[x] = this.turn;
        this.next = this.turn - previous;
        
        log.debug({turn:this.turn, spoken:x, next:this.next});
        return x;
    }
}

const parseInput = (rawInput: string) => {
  return rawInput.split(/,/g).map(Number);
}

const gameRunner = (game:Game, turns:number) => {
  var lastSpoken:number = -1;
  while (game.turn<turns) {
      lastSpoken = game.play();
  }
  return lastSpoken;
}
const part1 = (rawInput: string) => {
  const input = new Game(parseInput(rawInput));

  return gameRunner(input,2020);
};

const part2 = (rawInput: string) => {
  const input = new Game(parseInput(rawInput));

  return gameRunner(input,30000000);
};


run({
  part1: {
    tests: [
      { input: "0,3,6", expected: 436, },
      { input: "1,3,2", expected: 1, },
      { input: "2,1,3", expected: 10, },
      { input: "1,2,3", expected: 27, },
      { input: "2,3,1", expected: 78, },
      { input: "3,2,1", expected: 438, },
      { input: "3,1,2", expected: 1836, },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      { input: "0,3,6", expected: 175594, },
      { input: "1,3,2", expected: 2578, },
      { input: "2,1,3", expected: 3544142, },
      { input: "1,2,3", expected: 261214, },
      { input: "2,3,1", expected: 6895259, },
      { input: "3,2,1", expected: 18, },
      { input: "3,1,2", expected: 362, },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
