import run from "aocrunner";

const parseInput = (rawInput: string) => {
  return rawInput.replace(/\r\n/g,'\n')
  .split('\n')
  .map(a=>a.split(''));
}

const treesOnSlope = (input:string[][], dx:number, dy:number = 1):number => {
  const trees = input.map((row, y) => y).filter(y => y % dy == 0).filter(y => treeAtXY(input, y * dx/dy, y)).length;
  console.log(`${trees} for ${dx},${dy}`)
  return trees;
}
const treeAtXY = (input:string[][], x:number, y:number):boolean => {
  const tree = input[y][x % (input[0].length)] === "#";
  //console.log(`${tree} @ ${x},${y}`)
  return tree;
}

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return treesOnSlope(input,3);
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return  [treesOnSlope(input,1) , treesOnSlope(input,3) , treesOnSlope(input,5) , treesOnSlope(input,7) ,  treesOnSlope(input,1,2)].reduce((p,c)=>p*c,1);
};

const testInput = `
..##.......
#...#...#..
.#....#..#.
..#.#...#.#
.#...##..#.
..#.##.....
.#.#.#....#
.#........#
#.##...#...
#...##....#
.#..#...#.#`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 7,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 336,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
