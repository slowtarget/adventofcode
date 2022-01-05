import run from "aocrunner";

var Reset = "\x1b[0m"
var Bright = "\x1b[1m"
var Dim = "\x1b[2m"
var Underscore = "\x1b[4m"
var Blink = "\x1b[5m"
var Reverse = "\x1b[7m"
var Hidden = "\x1b[8m"
var FgBlack = "\x1b[30m"
var FgRed = "\x1b[31m"
var FgGreen = "\x1b[32m"
var FgYellow = "\x1b[33m"
var FgBlue = "\x1b[34m"
var FgMagenta = "\x1b[35m"
var FgCyan = "\x1b[36m"
var FgWhite = "\x1b[37m"
var BgBlack = "\x1b[40m"
var BgRed = "\x1b[41m"
var BgGreen = "\x1b[42m"
var BgYellow = "\x1b[43m"
var BgBlue = "\x1b[44m"
var BgMagenta = "\x1b[45m"
var BgCyan = "\x1b[46m"

const hex: { [idx: string]: string } = {
  '0': '0000',
  '1': '0001',
  '2': '0010',
  '3': '0011',
  '4': '0100',
  '5': '0101',
  '6': '0110',
  '7': '0111',
  '8': '1000',
  '9': '1001',
  'A': '1010',
  'B': '1011',
  'C': '1100',
  'D': '1101',
  'E': '1110',
  'F': '1111'
};

const unique = <T extends Object>(value: T, index: number, self: T[]) => {
  var first = self.findIndex(p => p.toString() === value.toString());
  return first === index;
}

const toKey = (x: number, y: number): string => {
  return `(${x},${y})`;
}
const numToRightJustifiedString = (num: number, length: number): string => {
  var s = num.toString(10);

  return s.padStart(length, ' ');
}
const debug = false;
// Returns current time
// (and, if provided, prints the event's name)
const now = (eventName: string | null = null) => {
  if (eventName && debug) {
    console.log(`Started ${eventName}..`);
  }
  return new Date().getTime();
}

// Store current time as `start`
let begunAt = now();

// Returns time elapsed since `beginning`
// (and, optionally, prints the duration in seconds)
const elapsed = (beginning: number = begunAt, log: boolean = false) => {
  const duration = new Date().getTime() - beginning;
  if (log && debug) {
    console.log(`${duration / 1000}s`);
  }
  return duration;
}

class Puzzle {
  bits: string;
  at: number = 0;
  public versionSum: number = 0;
  constructor(
    public input: string
  ) {
    this.bits = this.input.split('').map(a => hex[a]).join('');
  }

  public solve() {
    begunAt = now("solve2");
    var result = this.processPacket(0);

    elapsed(begunAt, true);
    return result;
  }

  public read(len: number): number {
    var num = parseInt(this.bits.slice(this.at, this.at + len), 2);
    this.at = this.at + len;
    return num;
  }

  public processPacket(depth: number): number {
    var version = this.read(3);
    this.versionSum += version;
    var type = this.read(3);
    var result: number = 0;
    if (type === 4) {
      while (this.read(1)) {
        result = result * 16 + this.read(4);
      }
      result = result * 16 + this.read(4);
      return result;
    } else {
      var lengthType = this.read(1);
      var results: number[] = [];
      if (lengthType) {
        var numberOfSubPackets = this.read(11);
        for (var i = 0; i < numberOfSubPackets; i++) {
          results.push(this.processPacket(depth + 1));
        }
      } else {
        var lengthOfSubPackets = this.read(15);
        var end = this.at + lengthOfSubPackets;
        while (this.at < end) {
          results.push(this.processPacket(depth + 1));
        }
      }
      var op: string = '';
      switch (type) {
        case 0:
          result = results.reduce((p, c) => p + c, 0);
          op = '+';
          break;
        case 1:
          result = results.reduce((p, c) => p * c, 1);
          op = '*';
          break;
        case 2:
          result = Math.min(...results);
          op = 'min';
          break;
        case 3:
          result = Math.max(...results);
          op = 'max';
          break;
        case 5:
          result = results[0] > results[1] ? 1 : 0;
          op = '>';
          break;
        case 6:
          result = results[0] < results[1] ? 1 : 0;
          op = '<';
          break;
        case 7:
          result = results[0] === results[1] ? 1 : 0;
          op = '==';
          break;
      }
      if (debug) {
        console.log(`${''.padStart(depth)}${op} [${results.join(', ')}] = ${result}`);
      }
      return result;
    }
  }
  public processPacket1(): number {
    this.versionSum = this.read(3);
    var type = this.read(3);
    if (type === 4) {
      var literal = 0;
      while (this.read(1)) {
        literal = literal * 8 + this.read(4);
      }
      literal = literal * 8 + this.read(4);
    } else {
      var lengthType = this.read(1);
      if (lengthType) {
        var numberOfSubPackets = this.read(11);
        for (var i = 0; i < numberOfSubPackets; i++) {
          this.versionSum += this.processPacket1();
        }
      } else {
        var lengthOfSubPackets = this.read(15);
        var end = this.at + lengthOfSubPackets;
        while (this.at < end) {
          this.versionSum += this.processPacket1();
        }
      }
    }
    return this.versionSum;
  }
}

const parseInput = (rawInput: string) => {
  return new Puzzle(rawInput);
}


const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  input.versionSum = 0;
  input.solve();
  return input.versionSum;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  return input.solve();
};
const testInput = `
`;
run({
  part1: {
    tests: [
      {
        input: 'D2FE28',
        expected: 6,
      },
      {
        input: '8A004A801A8002F478',
        expected: 16,
      },
      {
        input: '620080001611562C8802118E34',
        expected: 12,
      },
      {
        input: 'C0015000016115A2E0802F182340',
        expected: 23,
      },
      {
        input: 'A0016C880162017C3686B18A3D4780',
        expected: 31,
      },
    ],
    solution: part1,
  },
  /*
  C200B40A82 finds the sum of 1 and 2, resulting in the value 3.
  04005AC33890 finds the product of 6 and 9, resulting in the value 54.
  880086C3E88112 finds the minimum of 7, 8, and 9, resulting in the value 7.
  CE00C43D881120 finds the maximum of 7, 8, and 9, resulting in the value 9.
  D8005AC2A8F0 produces 1, because 5 is less than 15.
  F600BC2D8F produces 0, because 5 is not greater than 15.
  9C005AC2F8F0 produces 0, because 5 is not equal to 15.
  9C0141080250320F1802104A08 produces 1, because 1 + 3 = 2 * 2.
  */
  part2: {
    tests: [
      { input: 'C200B40A82', expected: 3 },
      { input: '04005AC33890', expected: 54 },
      { input: '880086C3E88112', expected: 7 },
      { input: 'CE00C43D881120', expected: 9 },
      { input: 'D8005AC2A8F0', expected: 1 },
      { input: 'F600BC2D8F', expected: 0 },
      { input: '9C005AC2F8F0', expected: 0 },
      { input: '9C0141080250320F1802104A08', expected: 1 },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
