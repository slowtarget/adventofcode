import run from "aocrunner";
type Instruction = {
  op: string,
  arg: number
};
const evaluate = (input: Instruction[]): { acc: number, infinite: boolean } => {
  const instructions = input.map(i => ({ ...i }));
  // console.log(`input ${JSON.stringify(input)}`)
  var [ptr, acc] = [0, 0];
  while (ptr !== instructions.length && instructions[ptr].op !== 'repeat') {
    const instruction = { ...instructions[ptr] };
    instructions[ptr] = { op: 'repeat', arg: 0 };
    switch (instruction.op) {
      case 'nop': {
        ptr++;
        break;
      }
      case 'acc': {
        acc = acc + instruction.arg;
        ptr++;
        break;
      }
      case 'jmp': {
        ptr = ptr + instruction.arg;
        break;
      }
    }
  }
  // console.log(`{acc:${acc}, infinite: ${ptr!==instructions.length}, ptr: ${ptr}, instructions.length:${instructions.length}}`)
  return { acc, infinite: ptr !== instructions.length };
}

const findSolution = (input: Instruction[]) => {

  console.log(`input ${JSON.stringify(input)}`)
  const part1 = evaluate(input).acc;
  var result = undefined;
  for (var j = 0; j < input.length && result == undefined; j++) {

    const instructions = input.map(i => ({ ...i }));
    switch (instructions[j].op) {
      case 'nop': {
        // is a nop supposed to be a jmp?
        instructions[j].op = 'jmp';
        const res = evaluate(instructions);
        if (!res.infinite) {
          result = res;
        }
        break;
      }
      case 'acc': {

        break;
      }
      case 'jmp': {
        // is a jmp supposed to be a nop?
        instructions[j].op = 'nop';
        const res = evaluate(instructions);
        if (!res.infinite) {
          result = res;
        }
        break;
      }
    }
  }

  return { part1, part2: result?.acc };
};
const parseInput = (rawInput: string) => {
  return rawInput
    .replace(/\r\n/g, '\n')
    .split(/\n/g)
    .map(v => v.trim())
    .map(v => v.split(/ /))
    .map(arr => {
      const [op, arg] = arr;
      return <Instruction>{ op, arg: parseInt(arg, 10) };
    });
}


const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const instructions = input.map(i => ({ ...i }));
  var [ptr, acc] = [0, 0];
  while (ptr !== instructions.length && instructions[ptr].op !== 'repeat') {
    const instruction = { ...instructions[ptr] };
    instructions[ptr] = { op: 'repeat', arg: 0 };
    switch (instruction.op) {
      case 'nop': {
        ptr++;
        break;
      }
      case 'acc': {
        acc = acc + instruction.arg;
        ptr++;
        break;
      }
      case 'jmp': {
        ptr = ptr + instruction.arg;
        break;
      }
    }
  }
  return acc;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  var result = undefined;
  for (var j = 0; j < input.length && result == undefined; j++) {

    const instructions = input.map(i => ({ ...i }));
    switch (instructions[j].op) {
      case 'nop': {
        // is a nop supposed to be a jmp?
        instructions[j].op = 'jmp';
        const res = evaluate(instructions);
        if (!res.infinite) {
          result = res;
        }
        break;
      }
      case 'acc': {

        break;
      }
      case 'jmp': {
        // is a jmp supposed to be a nop?
        instructions[j].op = 'nop';
        const res = evaluate(instructions);
        if (!res.infinite) {
          result = res;
        }
        break;
      }
    }
  }

  return result?.acc;
};

const testInput = `
nop +0
acc +1
jmp +4
acc +3
jmp -3
acc -99
acc +1
jmp -4
acc +6`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 5,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 8,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
