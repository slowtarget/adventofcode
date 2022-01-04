import run from "aocrunner";

const parseInput = (rawInput: string) => {
  var fishes:number[] = new Array(9).fill(0);
  rawInput
    .replace(/\r\n/g,'\n')
    .split(/,/g)
    .map(v=>v.trim())
    .map(v=>parseInt(v,10))
    .forEach(v=>fishes[v]++);
  return fishes;
}
const go = (input:number[],days:number):number => {
  // console.log(`input ${JSON.stringify(input)}`)
  var data = [...input]
  for (var day = 0; day < days; day ++) {
      data = tick(data);
  }
  // console.log(`data ${JSON.stringify(data)}`)
  return data.reduce((p,c)=>p+c,0);
}


const tick = (input:number[]):number[] => { 
  var renewing = input[0];

  for (var i = 1; i < 9; i++) {
      input[i-1] = input[i];
  }
  input[8] = renewing;
  input[6] = input[6] + renewing;
  
  return input;
}

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  return go(input,80);
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return go(input,256);
};
const testInput = `3,4,3,1,2`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 5934,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 26984457539,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
