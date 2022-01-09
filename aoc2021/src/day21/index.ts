import run from "aocrunner";
var Reset = "\x1b[0m";
var FgYellow = "\x1b[33m";
const NUMBER_OF_SPACES = 10;
interface Die {
  rolls: number;
  roll(): number;
}
class DeterministicDie implements Die {
  private next = 1;
  public rolls: number = 0;
  roll() {
    this.rolls++;
    var result = this.next;
    this.next++;
    if (this.next > 100) {
      this.next = 1;
    }
    return result;
  }
}
class Player {

  constructor(
    public name: string,
    public position: number,
    public score: number = 0
  ) { }

  toString() {
    return `${this.name} position : ${this.position} score: ${this.score}`;
  }

  getKey() {
    return `${this.position}-${this.score}`;
  }

  go(dieRoll: number) {
    this.position = ((this.position - 1 + dieRoll) % NUMBER_OF_SPACES) + 1;
    this.score += this.position;
    // console.log(`${this.name} rolls ${dieRoll} and moves to space ${this.position.toString()} for a total score of ${this.score}`);
  }

  // goDirac(dieThrow:number) {
  //     this.position = moves[this.position][dieThrow];
  //     this.score += this.position;
  //     //console.log(`${this.name} rolls ${rolls.join('+')} and moves to space ${this.position.toString()} for a total score of ${this.score}`);
  // }

  won(winningScore: number) {
    return this.score >= winningScore;
  }

  getScore() {
    return this.score;
  }
  clone() {
    return new Player(this.name, this.position, this.score);
  }
}

class Board {
  public winningScore = 1000;
  constructor(
    public players: Player[],
    public frequency: number = 1
  ) {

  }
  getKey() {
    return `${this.players.map(player => player.getKey()).join(' - ')}`;
  }
  gameOver() {
    return this.players.some(player => player.won(this.winningScore));
  }
  getWinner() {
    return this.players.find(player => player.score >= 21)?.name;
  }
  loserScore() {
    return Math.min(...this.players.map(player => player.score));
  }
  // andAmove(throw0:number, throw1:number, frequency:number) {
  //     var copy = this.clone(frequency);
  //     copy.players[0].goDirac(throw0);
  //     if (copy.players[0].won()) {
  //         return copy;
  //     }
  //     copy.players[1].goDirac(throw1);
  //     return copy;
  // }
  clone(frequency: number) {
    var board = new Board(this.players.map(player => player.clone()), this.frequency * frequency);
    board.winningScore = this.winningScore;
    return board;
  }
}


// memoize all the possible throws
var throws: { [name: number]: { roll: number, frequency: number } } = {};
for (var roll1 = 1; roll1 < 4; roll1++) {
  for (var roll2 = 1; roll2 < 4; roll2++) {
    for (var roll3 = 1; roll3 < 4; roll3++) {
      var roll = roll1 + roll2 + roll3;
      if (throws[roll]) {
        throws[roll].frequency++;
      } else {
        throws[roll] = { roll, frequency: 1 };
      }
    }
  }
}

// memoize all the possible moves
var moves: number[][] = [];
for (var space = 1; space <= 10; space++) {
  moves[space] = [];
  for (roll = 3; roll <= 9; roll++) {
    moves[space][roll] = (((space - 1) + roll) % 10) + 1;
  }
}

const parseInput = (rawInput: string) => {
  var regex = /(Player \d+) starting position: (\d+)/
  var players = rawInput
    .replace(/\r\n/g, '\n')
    .split(/\n/g)
    .map(line => regex.exec(line))
    .filter(matches => matches !== null)
    .map(matches => new Player(matches![1], parseInt(matches![2], 10), 0))
    .filter(player => !!player);

  return new Board(players, 1);
}


const part1 = (rawInput: string) => {
  const board = parseInput(rawInput);
  board.winningScore = 1000;
  var die = new DeterministicDie();

  while (!board.gameOver()) {
    for (var player of board.players) {
      var dieRoll = [die.roll(), die.roll(), die.roll()].reduce((p, c) => p + c, 0);
      player.go(dieRoll);
      if (player.won(board.winningScore)) {
        break;
      }
    }
  }
  var result = board.loserScore() * die.rolls;

  return result;
}

const part2 = (rawInput: string) => {
  var input = parseInput(rawInput);
  input.winningScore = 21;

  var boards = [input];
  console.log(`starting with \n${input.players.map(player => player.toString()).join(",\n")}`)
  var wins: number[] = new Array(2).fill(0);

  while (boards.length > 0) {
    var nextBoards: { [key: string]: Board } = {};
    var matches = 0;
    for (var board of boards) {
      for (var playerOnethrow of Object.values(throws)) {
        // player 1
        var temp = board.clone(playerOnethrow.frequency);
        temp.players[0].go(playerOnethrow.roll);
        if (temp.players[0].won(board.winningScore)) {
          wins[0] += temp.frequency;
        } else {
          for (var playerTwothrow of Object.values(throws)) {
            // player 2
            var next = temp.clone(playerTwothrow.frequency);
            next.players[1].go(playerTwothrow.roll);
            if (next.players[1].won(board.winningScore)) {
              wins[1] += next.frequency;
            } else {
              var bkey = next.getKey();
              if (nextBoards[bkey]) {
                nextBoards[bkey].frequency += next.frequency;
                matches++;
              } else {
                nextBoards[bkey] = next;
              }
            }
          }
        }
      }
    }
    boards = Object.values(nextBoards);
    console.log(boards.length, matches, wins);
  }
  // test :   11997614504960522
  // expected : 444356092776315
  //  183752194019471 is too low
  // 5061183604402122 is too high.
  return Math.max(...wins);

};

const testInput = `
Player 1 starting position: 4
Player 2 starting position: 8`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 739785
      }
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 444356092776315
      }

    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
