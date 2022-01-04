import run from "aocrunner";
interface Instruction {
  command: 'forward'|'down'|'up';
  value: number;
  get: ()=>Position;
  getDelta: (old:Position)=>Position;
}
class Forward implements Instruction {
  public command:'forward' = 'forward';
  constructor (
      public value:number
  ) {

  }
  get() {
      return {x:this.value, depth:0, aim:0};
  }
  getDelta(old:Position) {
    return {x:this.value, depth:old.aim  * this.value, aim:0};
}
}
class Down implements Instruction {
  public command:'down' = 'down';
  constructor (
      public value:number
  ) {

  }
  get() {
      return {x:0, depth:this.value, aim:0};
  }
  getDelta(old:Position) {
    return {x:0, depth:0, aim:this.value};
}
}
class Up implements Instruction {
  public command:'up' = 'up';
  constructor (
      public value:number
  ) {

  }
  get():Position {
      return {x:0, depth:this.value * -1, aim:0}
  }
  getDelta(old:Position):Position {
    return {x:0, depth:0, aim:this.value * -1}
}
}
class InstructionBuilder {
  private regex = /(forward|down|up) (\d+)/
  public instruction:Instruction;
  constructor (
      public input:string
  ) {
      const matches = this.regex.exec(input);
      if (matches === null) {
          throw new Error('unrecognised input');
      }
      const value = parseInt(matches[2],10);
      switch (matches[1]) {
          case 'forward': this.instruction = new Forward(value); break;
          case 'down': this.instruction = new Down(value);break;
          case 'up': this.instruction = new Up(value);break;
          default:
              throw new Error('unrecognised input');
      }
  }
}
type Position = {x:number, depth:number, aim:number}

class Submarine {

  constructor (
      public position: Position,
      public instructions:Instruction[]
  ){}

  go() {
      this.instructions.forEach(instruction=>{
          const delta = instruction.get();
          this.position = {
              x: this.position.x + delta.x,
              depth: this.position.depth + delta.depth,
              aim:0
          }
      })
  }
  go2() {
    this.instructions.forEach(instruction=>{
        const delta = instruction.getDelta(this.position);
        this.position = {
            x: this.position.x + delta.x,
            depth: this.position.depth + delta.depth,
            aim: this.position.aim + delta.aim
        }
    })
}
}
const parseInput = (rawInput: string) => rawInput.replace(/\r\n/g, '\n').split('\n').map(x => new InstructionBuilder(x).instruction);

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const sub = new Submarine({x:0,depth:0,aim:0},input);
  sub.go();

  return sub.position.depth * sub.position.x;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const sub = new Submarine({x:0,depth:0,aim:0},input);
  sub.go2();

  return sub.position.depth * sub.position.x;
  return;
};

run({
  part1: {
    tests: [
      {
        input: `
          forward 5
          down 5
          forward 8
          up 3
          down 8
          forward 2
        `,
        expected: 150,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
          forward 5
          down 5
          forward 8
          up 3
          down 8
          forward 2
        `,
        expected: 900,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
