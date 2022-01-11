import run from "aocrunner";

const L_R: { [L: number]: number } = {
  90: 270,
  180: 180,
  270: 90
}


const ADJACENT = [
  [-1, -1], [-1, 0], [-1, +1],
  [0, -1], [0, +1],
  [+1, -1], [+1, 0], [+1, +1]
];

type Direction = {
  turn?: { [amount: number]: Direction },
  dx: number,
  dy: number,
  label: string
}

const DIR: { [dir: string]: Direction } = {
  N: { label: "N", dy: -1, dx: 0 },
  S: { label: "S", dy: +1, dx: 0 },
  E: { label: "E", dy: 0, dx: +1 },
  W: { label: "W", dy: 0, dx: -1 }
};
const TURN = {
  N: {
    90: DIR.E,
    180: DIR.S,
    270: DIR.W
  },
  S: {
    90: DIR.W,
    180: DIR.N,
    270: DIR.E
  },
  E: {
    90: DIR.S,
    180: DIR.W,
    270: DIR.N
  },
  W: {
    90: DIR.N,
    180: DIR.E,
    270: DIR.S
  }
}
DIR.N.turn = TURN.N;
DIR.S.turn = TURN.S;
DIR.E.turn = TURN.E;
DIR.W.turn = TURN.W;

type Instruction = {
  instruction: string,
  amount: number
}

type ShipPosition = {
  x: number, y: number, direction: Direction, velocity: Velocity
};
type Part1Processor = {
  (sp: ShipPosition, amount: number): ShipPosition;
};
type Part2Processor = {
  (sp: ShipPosition, amount: number): ShipPosition;
};

type Velocity = {
  dx: number,
  dy: number
}

const go = (sp: ShipPosition, dir: Direction, amount: number) => {
  return {
    ...sp,
    x: sp.x + amount * dir.dx,
    y: sp.y + amount * dir.dy
  };
};
const accelerate = (sp: ShipPosition, dir: Direction, amount: number): ShipPosition => {
  return {
    ...sp,
    velocity: {
      ...sp.velocity,
      dx: sp.velocity.dx + dir.dx * amount,
      dy: sp.velocity.dy + dir.dy * amount,
    }
  };
};
const turn90 = (v: Velocity): Velocity => {
  return {
    ...v,
    dx: -1 * v.dy,
    dy: v.dx
  }
}
const rotate = (sp: ShipPosition, amount: number): ShipPosition => {
  var velocity = sp.velocity;
  switch (amount) {
    case 270:
      velocity = turn90(velocity);
    case 180:
      velocity = turn90(velocity);
    case 90:
      velocity = turn90(velocity);
  }
  return {
    ...sp,
    velocity
  };
};

const travel = (sp: ShipPosition, amount: number) => {
  return {
    ...sp,
    x: sp.x + sp.velocity.dx * amount,
    y: sp.y + sp.velocity.dy * amount,
  }

}

const part1Process: { [instruction: string]: Part1Processor } = {
  N: (sp, amount) => go(sp, DIR.N, amount),
  S: (sp, amount) => go(sp, DIR.S, amount),
  E: (sp, amount) => go(sp, DIR.E, amount),
  W: (sp, amount) => go(sp, DIR.W, amount),
  L: (sp, amount) => ({ ...sp, direction: sp.direction.turn![L_R[amount]] }),
  R: (sp, amount) => ({ ...sp, direction: sp.direction.turn![amount] }),
  F: (sp, amount) => go(sp, sp.direction, amount),
};

const part2Process: { [instruction: string]: Part2Processor } = {
  N: (sp, amount) => accelerate(sp, DIR.N, amount),
  S: (sp, amount) => accelerate(sp, DIR.S, amount),
  E: (sp, amount) => accelerate(sp, DIR.E, amount),
  W: (sp, amount) => accelerate(sp, DIR.W, amount),
  L: (sp, amount) => rotate(sp, L_R[amount]),
  R: (sp, amount) => rotate(sp, amount),
  F: (sp, amount) => travel(sp, amount),
};

const parseInput = (rawInput: string) => {
  return rawInput
    .replace(/\r\n/g, '\n')
    .split(/\n/g)
    .map(s => s.match(/^(\w)(\d+)$/))
    .filter(a => a !== null)
    .map(v => v == null ? <Instruction>{ amount: 0, instruction: "X" } : <Instruction>{ amount: parseInt(v[2], 10), instruction: v[1] })
    .filter(v => v !== undefined);
}


const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  var data = input.map(ins => ins);
  var sp: ShipPosition = { direction: DIR.E, x: 0, y: 0, velocity: { dx: 0, dy: 0 } };

  data.forEach(ins => {
    sp = part1Process[ins.instruction](sp, ins.amount);
    // console.log(`${oldpos.direction.label} [${oldpos.x},${oldpos.y}] => ${ins.instruction} ${ins.amount} => ${sp.direction.label} [${sp.x},${sp.y}]`);
  });
  return Math.abs(sp.x) + Math.abs(sp.y);
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  var data = input.map(ins => ins);
  var sp: ShipPosition = { direction: DIR.E, x: 0, y: 0, velocity: { dx: 10, dy: -1 } };

  data.forEach(ins => {
    sp = part2Process[ins.instruction](sp, ins.amount);
  });
  return Math.abs(sp.x) + Math.abs(sp.y);
};

const testInput = `
F10
N3
F7
R90
F11`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 25,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 286,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
