import run from "aocrunner";
// much from https://refactoring.guru/design-patterns/observer/typescript/example

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
    public state: number
  ) { }

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
      return console.log('Subject: Observer has been attached already.');
    }

    this.observers.push(observer);
  }

  public detach(observer: Observer): void {
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex === -1) {
      return console.log('Subject: Nonexistent observer.');
    }
    this.observers.splice(observerIndex, 1);
  }

  /**
   * Trigger an update in each subscriber.
   */
  public notify(): void {
    for (const observer of this.observers) {
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
  constructor(public value: number) {
    super(BingoNumberState.NOT_DRAWN);
  }

  public draw(): void {
    this.state = BingoNumberState.DRAWN;
    this.notify();
  }

  update(subject: Subject): void {
    if ((subject instanceof BingoLine && subject.state === BingoState.WITHDRAWN) ||
      (subject instanceof BingoCard && subject.state === BingoState.WON)) {
      this.detach(subject); // this ensures that losing lines on winning cards don't carry on playing and that the winning sum is preserved
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
  constructor() {
    super(BingoState.NOT_WON)
  }

  public update(subject: Subject): void {
    if (subject instanceof BingoNumber && subject.state === BingoNumberState.DRAWN) {
      this.drawn++;
      if (this.drawn === 5) {
        this.state = BingoState.WON;
        this.winningDraw = subject.value;
        this.notify();
      }
    } else if (subject instanceof BingoCard && subject.state === BingoState.WON && this.state === BingoState.NOT_WON) {
      this.state = BingoState.WITHDRAWN;
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
    super(BingoState.NOT_WON)
  }

  public update(subject: Subject): void {
    if (subject instanceof BingoLine && subject.state === BingoState.WON) {
      this.state = BingoState.WON;
      this.winningDraw = subject.winningDraw;
      this.notify();
    } else if (subject instanceof BingoNumber && subject.state === BingoNumberState.DRAWN) {
      this.sum -= subject.value;
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
class BingoGame implements Observer {
  firstWinner: BingoCard | undefined;
  lastWinner: BingoCard | undefined;
  wins: number = 0;
  drawer: DrawSupplier;
  constructor(
    public drawn: number[],
    public cards: number,
    public bingoNumberMap: { [key: number]: BingoNumber }
  ) {
    this.drawer = new DrawSupplier(drawn);
  }

  public update(subject: Subject): void {
    if (subject instanceof BingoCard && subject.state === BingoState.WON) {
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
    public values: number[],
    public bingoNumberMap: { [key: number]: BingoNumber }
  ) { }
  build() {
    var line = new BingoLine();
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
    ].map(line => new BingoLineBuilder(line, this.bingoNumberMap).build())
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
  const boardsParsed: number[][][] = boardsInput.map(board => board.split(/\n/).map(l => l.trim().split(/\s+/g).map(x => parseInt(x, 10))));
  var game = new BingoGameBuilder(drawn, boardsParsed).build();
  game.play();
  return game;
};

const part1 = (rawInput: string): number => {
  const game = parseInput(rawInput);
  return (game.firstWinner?.sum ?? 0) * (game.firstWinner?.winningDraw ?? 0);
};

const part2 = (rawInput: string) => {
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
