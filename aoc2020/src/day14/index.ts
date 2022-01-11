import run from "aocrunner";
const debug = false;
type Mask = {
  on: number;
  off: number;
  float: number;
}
type Mem = {
  address: number;
  value: number;
}
type Store = { [address: number]: number };
type Instruction = Mask | Mem;

const ADJACENT = [
  [-1, -1], [-1, 0], [-1, +1],
  [0, -1], [0, +1],
  [+1, -1], [+1, 0], [+1, +1]
];
const decToBin = (dec: number): string => {
  var result: string;
  if (dec > 2 ** 18) {
    var low = dec % (2 ** 18);
    var high = (dec - low) / (2 ** 18);
    result = (high >>> 0).toString(2) + ((low >>> 0).toString(2)).padStart(18, '0');
  } else {
    result = (dec >>> 0).toString(2);
  }
  if (debug) {
    console.log(`dec to bin ${dec} ${result}`);
  }
  return result;
}

const binaryOr = (a: string, b: string): string => {
  if (a.length > 36 || b.length > 36) {
    console.log(`${a} or ${b} is too long`);
    throw new Error(`${a} or ${b} is too long`);
  }
  if (a.length < 36) {
    a = a.padStart(36, '0');
  }
  if (b.length < 36) {
    b = b.padStart(36, '0');
  }
  var out = "";
  for (var i = 35; i >= 0; i--) {
    out = (a[i] === '1' || b[i] === '1') ? `1${out}` : `0${out}`
  }
  if (debug) {
    console.log(`bin or  a:${a} b:${b} a|b:${out}`);
  }

  return out;
}

const binaryAnd = (a: string, b: string): string => {
  if (a.length > 36 || b.length > 36) {
    console.log(`${a} or ${b} is too long`);
    throw new Error(`${a} or ${b} is too long`);
  }
  if (a.length < 36) {
    a = a.padStart(36, '0');
  }
  if (b.length < 36) {
    b = b.padStart(36, '0');
  }
  var out = "";
  for (var i = 35; i >= 0; i--) {
    out = (a[i] === '1' && b[i] === '1') ? `1${out}` : `0${out}`
  }
  if (debug) {
    console.log(`bin and a:${a} b:${b} a&b:${out}`);
  }
  return out;
}
const bitNot = (input: string): string => {
  return (input === '1') ? '0' : '1';
}
const binaryNot = (v: string, index: number): string => {
  if (v.length > 36) {
    console.log(`${v} is too long`);
    throw new Error(`${v} is too long`);
  }
  if (v.length < 36) {
    v = v.padStart(36, '0');
  }

  var out = "";
  var pos = 0;
  for (var i = 35; i >= 0; i--) {
    pos++;
    var bit = (index === pos) ? bitNot(v[i]) : v[i];
    out = `${bit}${out}`;
  }
  if (debug) {
    console.log(`bin not v:${v} i:${index} ~v:${out} `);
  }
  return out;
}

const binToDec = (input: string): number => {
  input = input.padStart(36, '0');
  var low = parseInt(input.substring(input.length - 18), 2);

  var high = parseInt(input.substring(0, input.length - 18), 2);
  if (debug) {
    console.log("bin 2 dec ", input, high, low);
  }
  return low + high * 2 ** 18;
}

const decAnd = (a: number, b: number): number => {
  return binToDec(binaryAnd(decToBin(a), decToBin(b)));
}
const decOr = (a: number, b: number): number => {
  return binToDec(binaryOr(decToBin(a), decToBin(b)));
}
const decNot = (v: number, i: number): number => {
  return binToDec(binaryNot(decToBin(v), i));
}
const isMask = (input: Mask | Mem): input is Mask => {
  return (input as Mask).on !== undefined;
}


const parseInput = (rawInput: string) => {
  const matcher: RegExp = /^(?:(?:mem\[(\d+)\] = (\d+))|(?:mask = (.*)))$/;
  return rawInput
    .replace(/\r\n/g, '\n')
    .split(/\n/g)
    .filter(m => m && m != null)
    .map(s => matcher.exec(s))
    .filter(m => m && m != null)
    .map(arr => {
      if (arr) {
        if (arr[3]) {
          var mask = arr[3];
          var onMask = mask.replace(/X/g, '0');
          var offMask = mask.replace(/X/g, '1');
          var notMask = mask.replace(/1/g, '0').replace(/X/g, '1');

          return <Mask>{
            on: binToDec(onMask),
            off: binToDec(offMask),
            float: binToDec(notMask),

          };

        } else {
          return <Mem>{
            address: parseInt(arr[1], 10),
            value: parseInt(arr[2], 10)
          }
        }
      }
      return undefined;
    })
    .filter(a => !!a)
    .map(a => <Instruction>a);
}
const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  var store: Store = {};

  if (binToDec("1000000000000000001") !== 262145) {
    console.log("error binToDec(1000000000000000001)!==262145 ");
  }
  if (decToBin(262145) !== "1000000000000000001") {
    console.log(`error decToBin(262145)!==1000000000000000001 : ${decToBin(262145)} `);
  }
  var data = input.map(ins => ins);

  var currentMask: Mask = data[0] as Mask;
  data.forEach(instruction => {
    if (isMask(instruction)) {
      console.log(`Off: ${decToBin(instruction.off)} On:${decToBin(instruction.on)}`)
      currentMask = instruction;
    } else {
      store[instruction.address] = decOr(decAnd(instruction.value, currentMask.off), currentMask.on);
      console.log(`[${instruction.address}] = ${instruction.value} => ${store[instruction.address]}`)
    }
  });

  return Object.values(store).reduce((p, c) => p + c, 0);
  // 264369458185 is wrong. using javascript bit operators ... 32 bit limit :(
}
const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  if (debug) {
    console.log("-----------------------------------------------------");
    console.log("-----------------------------------------------------");
    console.log("---------------                  --------------------");
    console.log("---------------                  --------------------");
    console.log("---------------    part 2        --------------------");
    console.log("---------------                  --------------------");
    console.log("---------------                  --------------------");
    console.log("-----------------------------------------------------");
    console.log("-----------------------------------------------------");
  }
  var store: Store = {};

  if (binToDec("1000000000000000001") !== 262145) {
    console.log("error binToDec(1000000000000000001)!==262145 ");
    throw new Error();
  }
  if (decToBin(262145) !== "1000000000000000001") {
    console.log(`error decToBin(262145)!==1000000000000000001 : ${decToBin(262145)} `);
    throw new Error();
  }
  if (decNot(0, 1) !== 1) {
    console.log(`error decNot(0,1)!==1 : ${decNot(0, 1)} `);
    throw new Error();
  }
  if (decNot(0, 2) !== 2) {
    console.log(`error decNot(0,2)!==2 : ${decNot(0, 2)} `);
    throw new Error();
  }
  if (decNot(0, 4) !== 8) {
    console.log(`error decNot(0,4)!==8 : ${decNot(0, 4)} `);
    throw new Error();
  }
  var data = input.map(ins => ins);

  var currentMask: Mask = data[0] as Mask;


  // bin: 10000
  // ind: 01234


  const set = (float: number, value: number, address: number) => {
    if (float === 0) {
      if (debug) {
        console.log(`[${address} : ${decToBin(address)}] = ${value}`)
      }
      store[address] = value;
      return;
    }

    var bFloat = decToBin(float);
    var bMonoFloat = "1".padEnd(bFloat.length, '0');
    var bNewFloat = bFloat.substring(1);
    if (debug) {
      console.log('f', bFloat);
      console.log('m', bMonoFloat);
      console.log('n ', bNewFloat);
    }
    var newFloat = binToDec(bNewFloat);

    var address2 = decNot(address, bFloat.length);
    set(newFloat, value, address2);
    set(newFloat, value, address);
  }

  data.forEach(instruction => {
    if (isMask(instruction)) {
      const what = decToBin(instruction.float).split("").filter(a => a === '1').length;
      console.log(`Off: ${decToBin(instruction.off)} On:${decToBin(instruction.on)} Float:${decToBin(instruction.float)} (${what})`)
      currentMask = instruction;
    } else {
      var address = decOr(instruction.address, currentMask.on);
      set(currentMask.float, instruction.value, address);
    }
  });

  return Object.values(store).reduce((p, c) => p + c, 0);
  // 23907329074 is wrong. too low
}
const testInput = `
mask = XXXXXXXXXXXXXXXXXXXXXXXXXXXXX1XXXX0X
mem[8] = 11
mem[7] = 101
mem[8] = 0`;
const testInput2 = `
mask = 000000000000000000000000000000X1001X
mem[42] = 100
mask = 00000000000000000000000000000000X0XX
mem[26] = 1`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 165,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput2,
        expected: 208,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
