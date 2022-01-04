import run from "aocrunner";
type Line = { numbers: { [n: number]: true }, board: number }

const parseInput = (rawInput: string) => {

  const [drawnInput, ...boardsInput] = rawInput.replace(/\r\n/g, '\n').split('\n\n');
  const drawn = drawnInput.split(',').map(x => parseInt(x, 10));
  var numbers: { [n: number]: { lines: Line[], boards: Line[] } } = {};
  drawn.forEach(e => numbers[e] = { lines: [], boards: [] });
  const boardsParsed: number[][][] = boardsInput.map(board => board.split(/\n/).map(l => l.trim().split(/\s+/g).map(x => parseInt(x, 10))));
  var linesInput = boardsParsed.map((board, i) => board.map(line => ({ board: i, line }))).concat(
    ...boardsParsed.map((board, i) => [...Array(board[0].length).keys()].map(y => ({ board: i, line: board.map(line => line[y]) })))).flatMap(a => a);

  linesInput.forEach(lineInput => {
    var line = <Line>{ numbers: {}, board: lineInput.board };
    lineInput.line.forEach(n => {
      line.numbers[n] = true;
      numbers[n].lines.push(line);
    });
  });
  var boards = boardsParsed.map((boardParsed,i)=>{
    var board =  <Line>{ numbers: {}, board: i };
    boardParsed.flatMap(n=>n).forEach(n => {
      board.numbers[n] = true;
      numbers[n].boards.push(board);
    });
    return board;
  });
  return { drawn, numbers , boards};
};
const part1 = (rawInput: string): number => {
  const { drawn, numbers , boards } = parseInput(rawInput);
  var result: number;
  var num: number;
  var drawIndex = 0;
  while (drawIndex < drawn.length && !result) {
    num = drawn[drawIndex];
    numbers[num].boards.forEach(board=>{delete board.numbers[num]});
    numbers[num].lines.forEach(line=>{delete line.numbers[num]});
    
    numbers[num].lines.forEach(line => {
      if (Object.keys(line.numbers).length === 0 && !result) {
        result = Object.keys(boards[line.board].numbers).reduce((p, c) => p + parseInt(c,10), 0);
        
      }
    });
    delete numbers[num];

    drawIndex++;
  }
  return result * num;
};

const part2 = (rawInput: string) => {
  const {  drawn, numbers , boards} = parseInput(rawInput);
  var result: number;
  var num: number;
  var drawIndex = 0;
  var remainingBoards = [...boards.keys()];
  while (drawIndex < drawn.length && !result) {
    num = drawn[drawIndex];    
    numbers[num].boards.forEach(board=>{delete board.numbers[num]});
    numbers[num].lines.forEach(line=>{delete line.numbers[num]});
    
    numbers[num].lines.forEach(line => {
      if (Object.keys(line.numbers).length === 0) {
        // we have a winner
        if (remainingBoards.length === 1 ) {
          // we have a result
          result = Object.keys(boards[line.board].numbers).reduce((p, c) => p + parseInt(c,10), 0);
        } else {
          remainingBoards = remainingBoards.filter(x => x !== line.board);
          // remove this winning boards lines for all the remaining numbers on the board...
          Object.keys(boards[line.board].numbers).map(Number).forEach(n=>{
            numbers[n].lines = numbers[n].lines.filter(l=>l.board!==line.board)
          });
        }
      }
    });
    delete numbers[num];
    drawIndex++;
  }
  return result * num;
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
