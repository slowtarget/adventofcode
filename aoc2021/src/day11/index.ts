import run from "aocrunner";
const adjacentCells:number[][] = [
  [-1,-1],[-1, 0],[-1,+1],
  [ 0,-1]        ,[ 0,+1],
  [+1,-1],[+1, 0],[+1,+1]];

const parseInput = (rawInput: string) => rawInput

  .replace(/\r\n/g, '\n')
  .split(/\n/g)
  .map(v => v.trim())
  .map(v => v.split('').map(w => parseInt(w, 10)));

const step = (input:number[][]):[flashes:number,data:number[][]] => {
    var data = input.map(d=>d.map(e=>e+1));
    var flashed=true;
    var flashes = 0;
    while (flashed) {
        flashed =false;
        var output = data.map(d=>d.map(e=>e));
        data.forEach((row,y)=>row.forEach((cell,x)=>{
                if (cell>9) {
                    output[y][x]=0;
                    flashed = true;
                    flashes++;
                    adjacentCells.forEach(([dy,dx])=>{
                        const ay = y+dy;
                        const ax = x+dx;
                        if (ay < data.length && ay >= 0 && ax < data[ay].length && ax >=0 && output[ay][ax]>0) {
                            output[ay][ax]++;
                        }
                    })
                }
            }
        ));
        data = output.map(d=>d.map(e=>e));
    }
    return [flashes, data];
}

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  var data = [...input];
  var [flashes, newFlashes] = [0,0];
  //data.forEach(d=>console.log(d.map(e=>e==0?`${Bright}${e}${Reset}`:e).join("")));
  for (var i = 0; i < 100; i ++) {
      [newFlashes, data] = step(data);
      flashes = flashes + newFlashes;
      //console.log(newFlashes,flashes);
      //data.forEach(d=>console.log(d.map(e=>e==0?`${Bright}${e}${Reset}`:e).join("")));
  }

  return flashes;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  var data = [...input];
  var [flashes, newFlashes] = [0,0];
  // data.forEach(d=>console.log(d.map(e=>e==0?`${Bright}${e}${Reset}`:e).join("")));
  var steps= 0;
  while (newFlashes<100){
      [newFlashes, data] = step(data);
      steps++;
      flashes = flashes + newFlashes;
      // console.log(steps,newFlashes,flashes);
      // data.forEach(d=>console.log(d.map(e=>e==0?`${Bright}${e}${Reset}`:e).join("")));
  }


  return steps;
};

const testInput = `
5483143223
2745854711
5264556173
6141336146
6357385478
4167524645
2176841721
6882881134
4846848554
5283751526`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 1656,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 195,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
