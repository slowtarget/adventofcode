import run from "aocrunner";
import { Console } from "console";
import { it } from "node:test";
import { format } from "path";
import { json } from "stream/consumers";

class Valve {
  public adjacent: Valve[] = [];
  public distance: number = Infinity;
  public visited: boolean = false;
  public neighbours: Record<string, ValveWithDistance> = {}; //friends with benefits 
  public distances: {id:number, distance:number}[] = [];
  constructor(
    public key: string,
    public rate: number,
    public adjacentKeys: string[],
    public id: number,
  ) {}

  public reset() {
    this.distance = Infinity;
    this.visited = false;
  }

  toString(){
    return `${this.key} [${this.rate}] `;
  }
}

class ValveWithDistance {
  constructor(public valve: Valve, public distance: number) {}
  toString() {
    return `-- ${this.distance} --> ${this.valve.toString()}`;
  }
}

type QueueRecord = {
  id: number;
  remainingTime:number; 
  accruedRelease:number;
  visited:number;
};
class Cave {
  public days: number = 30;
  public origin: Valve;
  public chart: Record<string, Valve> = {};
  
  public valveChart: Record<number, Valve> = {};
  public rates:  Record<number, number> = {};

  public combos: Record<number, number> = {};

  constructor(public valves: Valve[]) {
    // some enrichment going on here...
    valves.forEach((v) => (this.chart[v.key] = v)); // populate cave chart
    valves.forEach(
      (v) => (v.adjacent = v.adjacentKeys.map((key) => this.chart[key])),
    ); // upgrade links to objects
    valves.forEach((v) => this.dijkstraDistances(v));
    this.origin = this.chart["AA"];
    // prune the network of broken valves ...
    // keep AA as its the start - but bin off all the other valves
    const working = valves.filter(v => !!v.rate);
    const broken = valves.filter(v => !working.includes(v));
    const brokenKeys = broken.map(v => v.key);
    this.valves = [this.origin, ...working];
    this.valves.forEach(v => {
      v.adjacent = [];
      v.adjacentKeys = [];
      Object.keys(v.neighbours)
      .filter(key => brokenKeys.includes(key))
      .forEach(key => {
        delete v.neighbours[key];
      });
    });
    
    this.valves.forEach(v => {
      v.distances = [];
      this.rates[v.id] = v.rate;
      this.valveChart[v.id] = v;
      Object.values(v.neighbours).forEach(n => {
        v.distances.push({id:n.valve.id, distance: n.distance});
      })
    });
  }

  dijkstraDistances(from: Valve) {
    this.valves.forEach((v) => v.reset());
    from.distance = 0;
    let queue: Valve[] = [...this.valves];
    while (queue.length) {
      queue.sort((a, b) => a.distance - b.distance);
      const min = queue.shift()!;
      min.visited = true;
      min.adjacent
        .filter((a) => a.visited === false)
        .forEach((a) => {
          a.distance = Math.min(a.distance, min.distance + 1);
        });
    }

    from.neighbours = {};
    this.valves
      .filter(v => v != from)
      .map(v => new ValveWithDistance(v, v.distance))
      .forEach(n => from.neighbours[n.valve.key] = n);
  }
 
  dijkstraSolution(minutes: number){
    this.valves.forEach((v) => v.reset());
    
    const beTheBest = (best:QueueRecord| undefined, contender:QueueRecord) => {
      if (!best) {
        return contender;
      }
      if (best.accruedRelease >= contender.accruedRelease){
        return best;
      } else {
        return contender;
      }
    } 
    // let bcj = this.stringToId("[BB, CC, JJ]");
    // let deh = this.stringToId("[DD, EE, HH]");

    let queue : QueueRecord[] = [];
    queue.push({id: 0, remainingTime: minutes, accruedRelease: 0, visited: 0});

    
    let best: QueueRecord|undefined = undefined;
    let loops=0;
    let now = new Date().getTime();
    let iteration = now;
    let start = now;
    while (queue.length) {
      const next = queue.shift()!;

      const combo = this.combos[next.visited];
      if (combo === undefined || combo < next.accruedRelease) {
        this.combos[next.visited] = next.accruedRelease;
      }

      // if ([bcj, deh].includes(next.visited)){
      //   console.log(this.idToString(next.visited), next.accruedRelease, this.combos[next.visited] )
      // }

      if (next.remainingTime === 0) {
        best = beTheBest(best, next); 
      } else {
        const targets = this.valveChart[next.id].distances
            .filter(n => (n.id & next.visited) === 0)
            .filter(n => n.distance < (next.remainingTime - 1));
        
        targets
        .forEach(n=>{
          const remaining: number = Math.max(0, next.remainingTime - n.distance - 1);
          const released: number = next.accruedRelease + (remaining * this.rates[n.id]);
          queue.push({id: n.id, remainingTime: remaining, accruedRelease: released, visited: (n.id | next.visited)});
        });

        if (targets.length === 0) {
          best = beTheBest(best,next);
        }
      }
      loops++;
      now = new Date().getTime();
      if (now - iteration > 5000) {
        iteration = now;
        console.log({
          loops, 
          elapsed: (now - start) / 1000,
          max: this.valveChart[next.id].toString(), 
          rem: next.remainingTime, 
          acc: next.accruedRelease,
          q: queue.length, 
          rt: next.visited
        });
      }
    }
    console.log(best);
    return best?.accruedRelease; 
  } 

  bestCombo() {
    let best = {id: 0, id2: 0, value: 0, value2: 0, total: 0};

    let bcj = this.combos[this.stringToId("[BB, CC, JJ]")];
    let deh = this.combos[this.stringToId("[DD, EE, HH]")];

    best.total = (bcj ?? 0) + (deh ?? 0);
    console.log({bcj, deh, best});

    Object.entries(this.combos)
    .map(([id, value])=> ({id: Number(id), value}))
    .forEach(({id, value})=> {
      Object.entries(this.combos)
      .map(([id2, value2])=> ({id2: Number(id2), value2}))
      .filter(({id2, value2}) => id2 !== id)
      .forEach(({id2, value2})=> {
        if ((id & id2) === 0) {
          // disjoint sets
          const total = value + value2;
          if (total > best.total) {
            // console.log(`new best ${total}\n  ${value} : ${this.idToString(id)}\n  ${value2} : ${this.idToString(id2)} `)
            best = {id, id2, value, value2, total};
          }
        }
      })
    })
    console.log({
      ...best,
      id: this.idToString(best.id), 
      id2: this.idToString(best.id2)
    });
    return best.total;
  }

  idToValves(input: number) {
    let id = input | 0;
    return this.valves.filter(v =>(v.id & id) > 0);
  }

  idToString(input: number) {
    let id = input | 0;
    return "[" + this.valves.filter(v =>(v.id & id) > 0).map(v => v.key).join(", ") + "]";
  }

  stringToId(input: string) {
    let id = 0;
    input.split("[")[1].split("]")[0].split(/, /g)
    .map(key => this.chart[key])
    .filter(v => !!v)
    .map(v => v.id)
    .forEach(i => id = id | i)
    return id;
  }

  toString(){
    return this.valves.map(v=>v.toString()).join("\n");
  }
}



const parseInput = (rawInput: string): Cave => {
  let id = 1;
  const valves: Valve[] = rawInput
    .replace(/\r\n/g, "\n")
    .split(/\n/g)
    .map((line) => {
      const match =
      /Valve (\w+) has flow rate=(\d+); tunnel(?:s?) lead(?:s?) to valve(?:s?) (.*)/
      .exec(line)
      ?.slice(1);
      console.log(line,match)
      const [key, rate, adjacent] = match!;
      const valveId = (Number(rate) > 0) ? id = id << 1 : 0; 
      return new Valve(key, Number(rate), adjacent.split(/, /), valveId);
    });
  return new Cave(valves);
};

const part1 = (rawInput: string) => {
  const cave = parseInput(rawInput);
  return cave.dijkstraSolution(30);
};

const part2 = (rawInput: string) => {
  const cave = parseInput(rawInput);
  cave.dijkstraSolution(26);
  return cave.bestCombo();
  // That's not the right answer; your answer is too high. (You guessed 3272.)
};

const testInput = `
Valve AA has flow rate=0; tunnels lead to valves DD, II, BB
Valve BB has flow rate=13; tunnels lead to valves CC, AA
Valve CC has flow rate=2; tunnels lead to valves DD, BB
Valve DD has flow rate=20; tunnels lead to valves CC, AA, EE
Valve EE has flow rate=3; tunnels lead to valves FF, DD
Valve FF has flow rate=0; tunnels lead to valves EE, GG
Valve GG has flow rate=0; tunnels lead to valves FF, HH
Valve HH has flow rate=22; tunnel leads to valve GG
Valve II has flow rate=0; tunnels lead to valves AA, JJ
Valve JJ has flow rate=21; tunnel leads to valve II
`;
run({
  part1: {
    tests: [
      {
        input: `
Valve AA has flow rate=0; tunnels lead to valves BB
Valve BB has flow rate=10; tunnels lead to valves AA`,
        expected: 280,
      },
      {
        input: testInput,
        expected: 1651,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: `
Valve AA has flow rate=0; tunnels lead to valves BB
Valve BB has flow rate=10; tunnels lead to valves AA`,
        expected: 240,
      },
      {
        input: `
Valve AA has flow rate=0; tunnels lead to valves BB, CC
Valve BB has flow rate=10; tunnels lead to valves AA, CC
Valve CC has flow rate=20; tunnels lead to valves AA, BB`,
        expected: 240 + 480,
      },
      {
        input: `
Valve AA has flow rate=0; tunnels lead to valves BB, CC
Valve BB has flow rate=10; tunnels lead to valves AA, CC
Valve CC has flow rate=20; tunnels lead to valves AA, BB, DD
Valve DD has flow rate=1; tunnels lead to valves CC`,
        expected: 240 + 480 + (22),
      },
      {
        input: testInput,
        expected: 1707,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  // onlyTests: true,s
});
