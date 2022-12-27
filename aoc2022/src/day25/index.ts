import run from "aocrunner";
const txtCode = () => ({ 
  Reset : "\x1b[0m",
  Bright : "\x1b[1m",
  Dim : "\x1b[2m",
  Underscore : "\x1b[4m",
  Blink : "\x1b[5m",
  Reverse : "\x1b[7m",
  Hidden : "\x1b[8m",
  FgBlack : "\x1b[30m",
  FgRed : "\x1b[31m",
  FgGreen : "\x1b[32m",
  FgYellow : "\x1b[33m",
  FgBlue : "\x1b[34m",
  FgMagenta : "\x1b[35m",
  FgCyan : "\x1b[36m",
  FgWhite : "\x1b[37m",
  BgBlack : "\x1b[40m",
  BgRed : "\x1b[41m",
  BgGreen : "\x1b[42m",
  BgYellow : "\x1b[43m",
  BgBlue : "\x1b[44m",
  BgMagenta : "\x1b[45m",
  BgCyan : "\x1b[46m"
});
const {Reset, FgRed} = txtCode();
const base = 5;
const snafuToNum : Record<string, number> = {
  "2": 2,
  "1": 1,
  "0": 0,
  "-": -1,
  "=": -2
}
const numToSnafu: Record<number, string> = {};
Object.keys(snafuToNum).forEach(key=>{
  const value = snafuToNum[key];
  numToSnafu[value]= key;
});

console.log({snafuToNum, numToSnafu});

const snafuDigit = (digit: number) => {
  const snafu = numToSnafu[digit];
  if (snafu === undefined) {
    throw new Error(`Error: bad snafu digit requested : ${digit}` );
  }
  return snafu;
}

const decDigit = (digit: string): number => {
  const dec = snafuToNum[digit];
  if (dec === undefined) {
    throw new Error(`Error: bad dec digit requested : ${digit}` );
  }
  return dec;
}

const toSnafu = (dec: number): string => {
  if (dec === 0) {
    return "0"
  }
  const snafu: number[] = [];
  let value = dec;
  while (value) {
    const rem = value % base;
    value = value - rem;
    value = value / base;
    snafu.push(rem);
  }

  // we have a base 5 number ... 0,1,2,3,4 // with the 1's at [0] in the array.
  // any 3's or 4's have to go 
  // 3's become +1 * base -2
  // 4's become +1 * base -1
  // 5's become +1 * base +0
  // 6's become +1 * base +1 etc

  let swaps = true;
  while (swaps) {
    swaps = false;
    for (let i = 0; i < snafu.length; i++) {
      const val = snafu[i];
      if (val > 2) {
        snafu[i] = val - base;
        snafu[i + 1] = (snafu[i + 1] || 0) + 1;
        swaps = true;
      }
    }
  }
  const result = snafu.reverse().map(snafuDigit).join("");
  
  return result;
}

const tests = new Array<{in:number, exp:string}>(
  {in:1        , exp: "1"},
  {in:2        , exp: "2"},
  {in:3        , exp: "1="},
  {in:4        , exp: "1-"},
  {in:5        , exp: "10"},
  {in:6        , exp: "11"},
  {in:7        , exp: "12"},
  {in:8        , exp: "2="},
  {in:9        , exp: "2-"},
  {in:10       , exp: "20"},
  {in:15       , exp: "1=0"},
  {in:20       , exp: "1-0"},
  {in:976      , exp: "2=-01"},
  {in:2022     , exp: "1=11-2"},
  {in:12345    , exp: "1-0---0"},
  {in:314159265, exp: "1121-1110-1=0"},
  {in:1747     , exp: "1=-0-2"},
  {in:906      , exp: "12111"},
  {in:198      , exp: "2=0="},
  {in:11       , exp: "21"},
  {in:201      , exp: "2=01"},
  {in:31       , exp: "111"},
  {in:1257     , exp: "20012"},
  {in:32       , exp: "112"},
  {in:353      , exp: "1=-1="},
  {in:107      , exp: "1-12"},
  {in:37       , exp: "122"},  
  );
console.log("tests toSnafu");
console.log(tests.map(test => ({pass:(toSnafu(test.in) === test.exp), test}))
  .filter(result => !result.pass)
  .map(result => `${FgRed}FAIL${Reset}: ${result.test.in} --> ${result.test.exp} `)
  .join("\n"));
console.log("===============");

const toDec = (input: string): number => {
  let value = 0;
  let digits = input.split("");
  let placeValue = 1;
  while (digits.length) {
    const digit = digits.pop()!;
    value += decDigit(digit) * placeValue;
    placeValue = placeValue * 5; 
  }
  return value;
} 


const testsToDec = new Array<{in: string, exp: number}>(
  {in: "2=000=22-0-102=-1001", exp: 30_508_250_415_126 }
  //  Number.MAX_SAFE_INTEGER    9,007,199,254,740,991
  ).concat(tests.map(test => ({in: test.exp, exp: test.in})));
  
console.log("tests ToDec");
console.log(testsToDec.map(test => ({pass:(toDec(test.in) === test.exp), test}))
  .filter(result => !result.pass)
  .map(result => `${FgRed}FAIL${Reset}: ${result.test.in} --> ${result.test.exp} `)
  .join("\n"));
console.log("=============");

class SNAFU {
  public value?: number;
  public snafu: number[];
  constructor(
    public input:string
  ) {
    this.value = toDec(input);
    const tempInput = input;
    this.snafu = tempInput.split("").map(digit => decDigit(digit)).reverse();
    this.snafu[0] = this.snafu[0] || 0;
    // console.log (`new SNAFU created ${this.input} =>  dec:${this.value} snafu: ${this.snafu} string: ${this.toString()}`)
  }
  add(other: SNAFU) {
    this.value = undefined;
    const temp: number[] = []
    for (let i=0; i < Math.max(this.snafu.length, other.snafu.length); i++) {
      temp[i] = (temp[i] || 0) + (this.snafu[i] || 0) + (other.snafu[i] || 0);
      if (temp[i] > 2) {
        temp[i + 1] = (temp[i + 1] || 0) + 1;
        temp[i] = temp[i] - base;
      }
      if (temp[i] < -2) {
        temp[i + 1] = (temp[i + 1] || 0) - 1;
        temp[i] = temp[i] + base;
      }
    }
    this.snafu = temp;
  }

  toString(): string {
    const temp = [...this.snafu];
    return temp.reverse().map(num=>numToSnafu[num] || "X").join("").valueOf();
  }
}
const parseInput = (rawInput: string) => {
  return rawInput.replace(/\r\n/g, "\n").split(/\n/g).map(line => new SNAFU(line))
};

// SNAFU::add tests
console.log("tests : SNAFU::add");
let asserts = 0;
for (let i = 0; i < tests.length; i ++) {
  for (let j = 0; j < tests.length; j ++) {
    const a = new SNAFU(tests[i].exp);
    const b = new SNAFU(tests[j].exp);
    const c = new SNAFU(toSnafu(tests[i].in + tests[j].in));
    
    a.add(b);
    asserts ++;
    if (a.toString() !== c.toString()) {
      console.log(`${FgRed}FAIL${Reset} : SNAFU add : ${tests[i].in} [${a.toString()}] + ${tests[j].in} [${b.toString()}] !== ${tests[i].in + tests[j].in} [${c.toString()}]`)
    }
  }
}
console.log(`======= ${asserts} ========`); 

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const total = input.map(s=>s.value!).reduce((p, c) => p + c, 0);
  const snafu = toSnafu(total);

  const sum = new SNAFU("0");
  input.forEach(s => sum.add(s));

  console.log({total, snafu, sumTotal: toDec(sum.toString()),sum: sum.toString()});
  return snafu;
  // 30508250415126 : 2=000=22-0-102=-1001 
  //                 '2=000=22-0-102=-1001'
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return 0;
};

const testInput = `
1=-0-2
12111
2=0=
21
2=01
111
20012
112
1=-1=
1-12
12
1=
122
`;


run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: "2=-1=0",
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: -1,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  // onlyTests: true,
});
