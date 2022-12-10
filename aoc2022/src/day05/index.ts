import run from "aocrunner";

const parseInput = (rawInput: string) => {
  const [rawStacks, rawInstructions] = rawInput
    .replace(/\r\n/g, "\n")
    .split(/\n\n/g);
  const stacksIn = rawStacks.split(/\n/g);
  let stacks: string[][] = [];
  //     [D]
  // [N] [C]
  // [Z] [M] [P]
  // 01234567890
  //  1   2   3
  for (let i = stacksIn.length - 2; i >= 0; i--) {
    let j = 1;
    let k = 0;
    const line = stacksIn[i];
    while (j < line.length) {
      const char = line.substring(j, j + 1);
      if (char !== " ") {
        stacks[k] = stacks[k] || [];
        stacks[k].push(char);
      }
      j += 4;
      k++;
    }
  }
  const regex = /move (\d+) from (\d+) to (\d+)/gm;

  const instructions: { qty: number; from: number; to: number }[] =
    rawInstructions.split(/\n/g).map((str) => {
      regex.lastIndex = 0;
      const m = regex.exec(str);
      const result = (m || []).slice(1, 4).map(Number) || [];
      const [qty, from, to] = result;
      return { qty, from, to };
    });

  return [[...stacks], [...instructions]];
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const instructions = input[1] as { qty: number; from: number; to: number }[];
  const stacks = input[0] as string[][];
  instructions.forEach(({ qty, from, to }) => {
    for (let x = 0; x < qty; x++) {
      const char = stacks[from - 1].pop() || "";
      stacks[to - 1].push(char);
    }
  });
  return stacks.map((s) => s[s.length - 1]).join("");
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const instructions = input[1] as { qty: number; from: number; to: number }[];
  const stacks = input[0] as string[][];
  instructions.forEach(({ qty, from, to }) => {
    let temp: string[] = [];
    for (let x = 0; x < qty; x++) {
      const char = stacks[from - 1].pop() || "";
      temp.push(char);
    }
    while (temp.length) {
      stacks[to - 1].push(temp.pop() || "");
    }
  });
  return stacks.map((s) => s[s.length - 1]).join("");
};

const testInput = `    [D]    
[N] [C]    
[Z] [M] [P]
 1   2   3 

move 1 from 2 to 1
move 3 from 1 to 3
move 2 from 2 to 1
move 1 from 1 to 2`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: "CMZ",
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: "MCD",
      },
    ],
    solution: part2,
  },
  trimTestInputs: false,
  // onlyTests: true,
});
