import run from "aocrunner";
const isValid = (input: number, preamble: number[]) => {
  const result = preamble.some(a => preamble.filter(b => b > a).some(b => b + a === input));
  // console.log(`${result} input: ${input} preamble:${preamble}`);
  return result;
}

const evaluate = (someInput: number[]): number => {
  const preambleLength = 25;
  const input = someInput.map(i => (i));
  console.log(`input ${JSON.stringify(input)}`)
  var preamble = input.slice(0, preambleLength);

  for (var i = preambleLength; i < input.length; i++) {
    if (!isValid(input[i], preamble)) {
      return input[i];
    }
    preamble.push(input[i]);
    preamble = preamble.slice(1, preambleLength + 1)
  }
  return 0;
}

const sumsWork = (target: number, input: number[]): number[] | undefined => {
  var sum = 0;
  for (var i = 0; i < input.length && sum < target; i++) {
    sum = sum + input[i];
    if (sum === target) {
      return input.slice(0, i + 1);
    }
  }
  return undefined;
}

const parseInput = (rawInput: string) => {
  return rawInput
    .replace(/\r\n/g, '\n')
    .split(/\n/g)
    .map(v => v.trim())
    .map(v => parseInt(v, 10))
}

const getFirstInvalid = (input: number[], preambleLength: number) => {

  var preamble = input.slice(0, preambleLength);

  for (var i = preambleLength; i < input.length; i++) {
    if (!isValid(input[i], preamble)) {
      return input[i];
    }

    preamble = [...preamble.slice(1), input[i]];
  }
  return 0;
}
const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  return getFirstInvalid(input, 25);
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const target = getFirstInvalid(input, 25);
  for (var i = 0; i < input.length; i++) {
    const result = sumsWork(target, input.slice(i));
    if (result) {
      result.sort((a, b) => a - b);
      return result[0] + result[result.length - 1];
    }
  }

  return 0;
};

const testInput = `
`;
run({
  part1: {
    tests: [
    ],
    solution: part1,
  },
  part2: {
    tests: [
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
