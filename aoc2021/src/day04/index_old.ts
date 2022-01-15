import run from "aocrunner";
import * as Logger from 'bunyan';
var log = Logger.createLogger({name: "2021 day4", level:'warn'});
log.fatal({level:log.level(), logfields:log.fields},`log level `);
// much from https://refactoring.guru/design-patterns/observer/typescript/example


// a number is drawn (number state --> DRAWN)
// all the lines the number appears on are updated (+1 to number of draws)
// all the cards the number appears on are updated (reducing the sum)
// if any lines have won (draws===5) ( line state --> WON )
// the card it appears on has won ( card state --> WON ) (detaches from numbers)
// the lines on the winning card are withdrawn ( line state --> WITHDRAWN ) (detaches from numbers)

// lines observe numbers for DRAWN
// cards observe numbers for DRAWN
// cards observe lines for WON
// lines observe cards for WON (to withdraw losing lines from winning cards)
// numbers observe lines for WITHDRAWN
// numbers observe cards for WON
// game observes cards for WON


/**
 * The Subject interface declares a set of methods for managing subscribers.
 */
interface Subject {
  // Attach an observer to the subject.
  attach(observer: Observer): void;

  // Detach an observer from the subject.
  detach(observer: Observer): void;

  // Notify all observers about an event.
  notify(): void;
}
/**
* The Subject owns some important state and notifies observers when the state
* changes.
*/
abstract class AbstractSubject implements Subject {

  constructor(
    /**
    * @type {number} For the sake of simplicity, the Subject's state, essential
    * to all subscribers, is stored in this variable.
    */
    public identity: string,
    public state: number
  ) { }

  public getIdentity(): string {
    return this.identity;
  }

  /**
   * @type {Observer[]} List of subscribers. In real life, the list of
   * subscribers can be stored more comprehensively (categorized by event
   * type, etc.).
   */
  private observers: Observer[] = [];

  /**
   * The subscription management methods.
   */
  public attach(observer: Observer): void {
    const isExist = this.observers.includes(observer);
    if (isExist) {
      return log.warn('Subject: Observer has been attached already.');
    }

    this.observers.push(observer);
  }

  public detach(observer: Observer): void {
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex === -1) {
      return log.warn(`detach subject: ${this.identity} Nonexistent observer. ${observer.getIdentity()}`);
    }
    this.observers.splice(observerIndex, 1);
  }

  /**
   * Trigger an update in each subscriber.
   */
  public notify(): void {
    var observers = [...this.observers]; // iterate over a copy just in case it gets mutated by one of the updates causing a detach...
    for (const observer of observers) {
      observer.update(this);
    }
  }
}

/**
* The Observer interface declares the update method, used by subjects.
*/
interface Observer {
  // Receive update from subject.
  update(subject: Subject): void;
  getIdentity(): string;
}

abstract class AbstractObserver implements Observer {
  constructor(
    public identity: string
  ) { }
  abstract update(subject: Subject): void;
  public getIdentity() {
    return this.identity;
  }
}

/**
* Concrete Observers react to the updates issued by the Subject they had been
* attached to.
*/

enum BingoNumberState {
  NOT_DRAWN = 0,
  DRAWN = 1
}
class BingoNumber extends AbstractSubject implements Observer {
  // each number is listened to by the lines containing the number
  // each number is listening for lines to be withdrawn
  // each number is listened to by the cards containing the number
  // each number is listening for cards to be won
  constructor(public value: number) {
    super(`number ${value.toString().padStart(2)}`, BingoNumberState.NOT_DRAWN);
  }

  public draw(): void {
    this.state = BingoNumberState.DRAWN;
    log.info(` ${this.identity} drawn `.padStart(40, "-").padEnd(80, "-"));
    this.notify();
  }

  update(subject: Subject): void {
    if ((subject instanceof BingoLine && subject.state === BingoState.WITHDRAWN) ||
      (subject instanceof BingoCard && subject.state === BingoState.WON)) {
      this.detach(subject); // this ensures that losing lines on winning cards don't carry on playing and that the winning sum is preserved
      log.trace(`update - ${this.identity} detaching ${subject.identity}`)
    }

  }
}
enum BingoState {
  NOT_WON = 0,
  WON = 1,
  WITHDRAWN = 2
}
class BingoLine extends AbstractSubject implements Observer {
  // each line (a row or col) is listened to by the card
  // each line is listening for its card to be won (so it can withdraw itself from play)
  // each line is listening for numbers to be drawn
  // when 5 have been drawn that line wins 
  public drawn: number = 0;
  public winningDraw: number | undefined;
  constructor(
    public identity: string
  ) {
    super(identity, BingoState.NOT_WON)
  }

  public update(subject: Subject): void {
    if (subject instanceof BingoNumber && subject.state === BingoNumberState.DRAWN) {
      this.drawn++;
      if (this.drawn === 5) {
        log.info(`update - ${this.identity} has won due to ${subject.identity} being drawn`);
        this.state = BingoState.WON;
        this.winningDraw = subject.value;
        this.notify();
      }
    } else if (subject instanceof BingoCard && subject.state === BingoState.WON && this.state === BingoState.NOT_WON) {
      this.state = BingoState.WITHDRAWN;
      log.trace(`update - ${this.identity} is withdrawn due to ${subject.identity} winning`);
      this.notify();
    }
  }
}

class BingoCard extends AbstractSubject implements Observer {
  // each card is listened to by the game
  // each card is listened to by the numbers so that when it wins it can be detached
  // each card is listening for a line win
  // each card is listening for a number to be drawn - to update its total 
  public winningDraw: number | undefined;
  constructor(
    public cardNumber: number,
    public sum: number,
  ) {
    super(`card ${cardNumber.toString().padStart(2)}`, BingoState.NOT_WON)
  }

  public update(subject: Subject): void {
    if (subject instanceof BingoLine && subject.state === BingoState.WON && this.state === BingoState.NOT_WON) {
      log.info(`update - ${this.identity} has won due to ${subject.identity} winning`);
      this.state = BingoState.WON;
      this.winningDraw = subject.winningDraw;
      this.notify();
    } else if (subject instanceof BingoNumber && subject.state === BingoNumberState.DRAWN) {

      this.sum -= subject.value;
      log.trace(`update - ${this.identity} sum: ${this.sum} (subtracted ${subject.identity})`);
    }
  }
}
class DrawSupplier {
  public idx: number = 0;
  constructor(
    public drawn: number[]
  ) { }
  next() {
    if (this.idx >= this.drawn.length) {
      return undefined;
    }
    return this.drawn[this.idx++];
  }
}
class BingoGame extends AbstractObserver {
  firstWinner: BingoCard | undefined;
  lastWinner: BingoCard | undefined;
  wins: number = 0;
  drawer: DrawSupplier;
  constructor(
    public drawn: number[],
    public cards: number,
    public bingoNumberMap: { [key: number]: BingoNumber }
  ) {
    super('the game');
    this.drawer = new DrawSupplier(drawn);
  }
  public update(subject: Subject): void {
    if (subject instanceof BingoCard && subject.state === BingoState.WON) {
      log.info(`update - ${this.identity}: ${subject.identity} has won`);
      this.wins++;
      this.lastWinner = subject;
      if (!this.firstWinner) {
        this.firstWinner = subject;
      }
    }
  }

  public play() {
    while (this.wins < this.cards) {
      var draw = this.drawer.next();
      if (draw !== undefined) {
        this.bingoNumberMap[draw].draw();
      }
    }
  }
}

class BingoLineBuilder {
  constructor(
    public identity: string,
    public values: number[],
    public bingoNumberMap: { [key: number]: BingoNumber }
  ) { }
  build() {
    var line = new BingoLine(this.identity);
    this.values.map(value => this.bingoNumberMap[value]).forEach(bingoNumber => {
      bingoNumber.attach(line);
      line.attach(bingoNumber);
    });
    return line;
  }
}
class BingoCardBuilder {
  constructor(
    public cardNumber: number,
    public values: number[][],
    public bingoNumberMap: { [key: number]: BingoNumber }
  ) { }
  build() {
    var card = new BingoCard(this.cardNumber, this.values.flatMap(a => a).reduce((c, p) => p + c, 0));

    this.values.flatMap(a => a).map(value => this.bingoNumberMap[value]).forEach(bingoNumber => {
      bingoNumber.attach(card);
      card.attach(bingoNumber);
    });

    [
      //rows
      ...this.values,
      //cols
      ...this.values[0].map((x, col) => this.values.map(row => row[col]))
    ].map((line, i) => new BingoLineBuilder(`${this.cardNumber} line ${i}`, line, this.bingoNumberMap).build())
      .forEach(line => {
        line.attach(card);
        card.attach(line);
      });
    return card;
  }
}
class BingoGameBuilder {
  constructor(
    public drawn: number[],
    public cards: number[][][]
  ) { }

  build() {
    var bingoNumberMap: { [key: number]: BingoNumber } = {};

    this.drawn.forEach(draw => {
      bingoNumberMap[draw] = new BingoNumber(draw);
    })
    var game = new BingoGame(this.drawn, this.cards.length, bingoNumberMap);

    this.cards.forEach((cardValues, cardNumber) => {
      var card = new BingoCardBuilder(cardNumber, cardValues, bingoNumberMap).build();
      card.attach(game);
    })
    return game;
  }
}

/**
* The client code.
*/

const parseInput = (rawInput: string) => {

  const [drawnInput, ...boardsInput] = rawInput.replace(/\r\n/g, '\n').split('\n\n');
  const drawn = drawnInput.split(',').map(x => parseInt(x, 10));
  const boards: number[][][] = boardsInput.map(board => board.split(/\n/).map(l => l.trim().split(/\s+/g).map(x => parseInt(x, 10))));
  var game = new BingoGameBuilder(drawn, boards).build();
  game.play();
  return game;
};

const part1 = (rawInput: string): number => {
  log.info(" part 1 ".padStart(40, "#").padEnd(80, "#"));
  const game = parseInput(rawInput);
  return (game.firstWinner?.sum ?? 0) * (game.firstWinner?.winningDraw ?? 0);
};

const part2 = (rawInput: string) => {
  log.info(" part 2 ".padStart(40, "#").padEnd(80, "#"));
  const game = parseInput(rawInput);
  return (game.lastWinner?.sum || 0) * (game.lastWinner?.winningDraw ?? 0);
};
const testInput = `
7,4,9,5,11,17,23,2,0,14,21,24,10,16,13,6,15,25,12,22,18,20,8,19,3,26,1

22 13 17 11  0
 8  2 23  4 24
21  9 14 16  7
 6 10  3 18  5
 1 12 20 15 19

 3 15  0  2 22
 9 18 13 17  5
19  8  7 25 23
20 11 10 24  4
14 21 16 12  6

14 21 17 24  4
10 16 15  9 19
18  8 23 26 20
22 11 13  6  5
 2  0 12  3  7
 `;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 4512,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 1924,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
