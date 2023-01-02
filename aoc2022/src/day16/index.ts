import run from "aocrunner";
import { Console } from "console";
import { it } from "node:test";
import { format } from "path";
import { json } from "stream/consumers";

class Valve {
  public adjacent: Valve[] = [];
  public open: boolean = false;
  public potential: number = 0;
  public distance: number = Infinity;
  public visited: boolean = false;
  public neighbours: Record<string, ValveWithDistance> = {}; //friends with benefits 
  constructor(
    public key: string,
    public rate: number,
    public adjacentKeys: string[],
  ) {}

  public reset() {
    this.distance = Infinity;
    this.potential = 0;
    this.visited = false;
    this.open=false;
  }


  toString(){
    return `${this.key} : ${this.open?"OPEN":"CLOSED"} : rate ${this.rate}`
  }
  toString2(){
    return `${this.key} [${this.rate}] `;
  }
}

class ValveWithDistance {
  constructor(public valve: Valve, public distance: number) {}
  toString() {
    return `-- ${this.distance} --> ${this.valve.toString()}`;
  }
}

type QueueRecord = {remainingTime:number, accruedRelease:number, valve:Valve, visited:boolean, route:QueueRecord[]};
class Cave {
  public days: number = 30;
  public current: Valve;
  public origin: Valve;
  public chart: Record<string, Valve> = {};
  public release: number = 0;
  
  constructor(public valves: Valve[]) {
    // some enrichment going on here...
    valves.forEach((v) => (this.chart[v.key] = v)); // populate cave chart
    valves.forEach(
      (v) => (v.adjacent = v.adjacentKeys.map((key) => this.chart[key])),
    ); // upgrade links to objects
    valves.forEach((v) => this.dijkstraDistances(v));
    this.current = this.chart["AA"];
    this.origin = this.chart["AA"];
  }
  public tick() {
    // this.release += this.valves.map((v) => v.tick()).reduce((p, c) => p + c, 0);
    this.days--;
  }

  //
  // AA --- DD
  //
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
    // all valves now populated with a distance from the start ... add these values to the objects ... only want those with potential
    // friends with benefits. 
    from.neighbours = {};
    this.valves
      .filter(v => v != from)
      .map(v => new ValveWithDistance(v, v.distance))
      .forEach(n => from.neighbours[n.valve.key] = n);
  }
 

  dijkstraSolution(){
    this.valves.forEach((v) => v.reset());
    
    const sortSolution = (a:QueueRecord, b:QueueRecord) => {
      if (a.remainingTime === b.remainingTime) {
        return b.accruedRelease - a.accruedRelease;
      }
      return b.remainingTime - a.remainingTime;
    }

    const beTheBest = (best:QueueRecord| undefined, contender:QueueRecord) => {
      if (!best) {
        return contender;
      }
      if (best.accruedRelease >= contender.accruedRelease){
        return best;
      } else {
        console.log(`new max : ${contender.accruedRelease}`);
        return contender;
      }
    } 
    // If the priority queue sorts first by most remaining time, then by most accrued volume
    //  https://www.reddit.com/r/adventofcode/comments/zn6k1l/2022_day_16_solutions/ Joauld (PureScript)

    let queue : QueueRecord[] = [];
    queue.push(<QueueRecord>{remainingTime:30, accruedRelease:0, valve:this.origin, visited:false, route:[]});

    let best: QueueRecord|undefined = undefined;
    let loops=0;
    let time = 30;
    let now = new Date().getTime();
    let iteration = now;
    let start = now;
    while (queue.length) {
      // queue.sort(sortSolution);
      const max = queue.shift()!;
      max.visited = true;
      if(time > max.remainingTime){
        console.log(loops, "max", max.remainingTime, max.accruedRelease,"queue", queue.length);
        time = max.remainingTime;
      }
      if (max.remainingTime === 0) {
        // console.log("out of time ");
        best = beTheBest(best,max); 
      } else {
        const targets = Object.values(max.valve.neighbours)
            .filter(n => n.valve.rate > 0)
            .filter(n => !max.route.map(r => r.valve).includes(n.valve))
            .filter(n => n.distance < (max.remainingTime - 1));
        
        targets
        .forEach(r=>{
          const remaining: number = Math.max(0, max.remainingTime - r.distance - 1);
          const released: number = max.accruedRelease + (remaining * r.valve.rate);
          queue.push(<QueueRecord>{remainingTime: remaining, accruedRelease: released, valve: r.valve, visited: false, route: [...max.route, max]});
        });

        if (targets.length === 0) {
          // console.log("end of route"); 
          best = beTheBest(best,max);
        }
        // console.log(i, targets.length, queue.length);
      }
      loops++;
      now = new Date().getTime();
      if (now - iteration > 5000) {
        iteration = now;
        console.log({
          loops, 
          elapsed: (now - start) / 1000,
          max: max.valve.toString(), 
          rem: max.remainingTime, 
          acc: max.accruedRelease,
          q: queue.length, 
          rt: max.route.map(v => v.valve.key).join(", ")
        });
      }
    }
    console.log(best);
    return best?.accruedRelease; 
  } 

  toString(){
    return this.valves.map(v=>v.toString()).join("\n") + "\n" + `Current: ${this.current.key}`
  }
}
const parseInput = (rawInput: string): Cave => {
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
      return new Valve(key, Number(rate), adjacent.split(/, /));
    });
  return new Cave(valves);
};

const part1 = (rawInput: string) => {
  const cave = parseInput(rawInput);
  return cave.dijkstraSolution();
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return 0;
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
        input: testInput,
        expected: 1651,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 1707,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  // onlyTests: true,
});
