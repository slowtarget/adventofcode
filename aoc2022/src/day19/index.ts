import run from "aocrunner";


class Resource { 
  constructor(
    public ore: number,
    public clay: number,
    public obsidian: number,
    public geode: number
  ) {} 
  add(production: Partial<Resource>) {
    this.ore += production.ore || 0;
    this.clay += production.clay || 0;
    this.obsidian += production.obsidian || 0;
    this.geode += production.geode || 0;
  }
  spend(cost: Partial<Resource>) {
    this.ore -= cost.ore || 0;
    this.clay -= cost.clay || 0;
    this.obsidian -= cost.obsidian || 0;
  }
  clone(){
    return new Resource(this.ore, this.clay, this.obsidian, this.geode);
  }
  toString() {
    return `[${[this.ore, this.clay, this.obsidian, this.geode].join(", ")}]`;
  }
}

class Robot {
  public cost: Resource;
  public produces: Resource;
  constructor(
    cost: Partial<Resource>,
    produces: Partial<Resource>
  ) {
    this.cost = new Resource(cost.ore || 0,  cost.clay || 0,  cost.obsidian || 0,  0);
    this.produces = new Resource(produces.ore || 0,  produces.clay || 0,  produces.obsidian || 0, produces.geode || 0);
  }
  canCreate(resources: Resource) {
    return Object.keys(this.cost)
      .map(key => key as keyof Resource)
      .map(key=>({cost: this.cost[key], resource: resources[key] , key}))
      .every(req => req.resource >= req.cost);
  }
  producingFor(production: Resource) {
    return Object.keys(this.cost)
      .map(key => key as keyof Resource)
      .map(key=>({cost: this.cost[key], production: production[key] , key}))
      .filter(req => req.cost !== 0 )
      .every(req => req.production > 0);
  }
}

class OreBot extends Robot {
  constructor(
    cost: Partial<Resource>
  ){
    super(cost, {ore: 1})
  }
}
class ClayBot extends Robot {
  constructor(
    cost: Partial<Resource>
  ){
    super(cost, {clay: 1})
  }
}
class ObsBot extends Robot {
  constructor(
    cost: Partial<Resource>
  ){
    super(cost, {obsidian: 1})
  }
}
class GeoBot extends Robot {
  constructor(
    cost: Partial<Resource>
  ){
    super(cost, {geode: 1})
  }
}
class BluePrint{
  public robots: Robot[] = [];
  public production: Resource = new Resource(1, 0, 0, 0);
  constructor (
    public id: number,
    public oreRobotOreCost: number, 
    public clayRobotOreCost: number, 
    public obsidianRobotOreCost: number, 
    public obsidianRobotClayCost: number, 
    public geodeRobotOreCost: number, 
    public geodeRobotObsidianCost: number
  ){
    this.robots.push(new OreBot({ore: oreRobotOreCost}));
    this.robots.push(new ClayBot({ore: clayRobotOreCost}));
    this.robots.push(new ObsBot({ore: obsidianRobotOreCost, clay: obsidianRobotClayCost}));
    this.robots.push(new GeoBot({ore: geodeRobotOreCost, obsidian: geodeRobotObsidianCost}));
  }
}
class State{
  public history: State[] = [];
  constructor(
    public blueprint: BluePrint,
    public resource: Resource,
    public production: Resource,
    public minute: number,
    public building?: Robot,
  ){}
  build(robot: Robot) {
    this.building = robot;
    this.resource.spend(robot.cost);
  }
  promise(){
    const remaining = minutes - this.minute;
    return this.resource.geode + remaining * (this.production.geode + remaining - 1);
  }
  compareGeode(other: State){
    const resource = this.resource.geode - other.resource.geode;
    if (resource === 0) {
      return this.production.geode - other.production.geode
    } else {
      return resource;
    }
  }
  compareObsidian(other: State){
      return this.production.obsidian  - other.production.obsidian;
  }
  compareClay(other: State){
      return (other.production.ore + other.production.clay) - (this.production.ore + this.production.clay);
  }
  compareOre(other: State){
    return other.production.ore - this.production.ore;
  }
  compare(other: State) {
    const geode = this.compareGeode(other); 
    if (geode === 0) {
      const obsidian = this.compareObsidian(other);
      if (obsidian === 0) {
        const clay = this.compareClay(other);
        if (clay === 0) {
          return this.compareOre(other);
        } else {
          return clay;
        }
      } else {
        return obsidian;
      }
    } else {
      return geode;
    }
  }
  clone() {
    const clone = new State(this.blueprint, this.resource.clone(), this.production.clone(), this.minute.valueOf(), this.building);
    clone.history = [...this.history, this];
    return clone;
  }
  toString(){
    return `${this.blueprint.id}: ${this.minute} p:${this.production.toString()} r:${this.resource.toString()} b: ${!!this.building}`
  }
}
const minutes = 24;
class Analysis {
  public initialstate: State;
  public queue: State[] = [];
  public bestState?: State;
  public best: number = 0;
  constructor(
    public blueprint: BluePrint
  ){
    this.initialstate = new State(this.blueprint, new Resource(0,0,0,0), blueprint.production.clone(), 1);
  }
  run(){

    const preference = (a: State, b: State) => a.compare(b);

    console.log(`${this.blueprint.id} analysis running`);
    this.queue.push(this.initialstate.clone());
    let loops = 0;
    let now = (new Date()).getTime();
    let start = now;
    let iteration = start;
    let bestLoops = 500000;

    let bestGeodes = Array(24).fill(0);
    while (this.queue.length && ((now - start) < 60000 )) {
      loops ++;
      // choices are do nothing + build what I can.
      // favour geodes above all...but get a quick first answer, sort by geodes + geode production * minutes remaining, then by obsidian production, then by clay production, then by ore production... 
      // truncate anything that has less minutes left than the best geode production 

      const max = this.queue.sort(preference).pop()!;


      // produce
      max.resource.add(max.production);
      // increment production if applicable
      if (max.building) {
        max.production.add(max.building.produces);
        max.building = undefined;
      }

      if (max.minute >= minutes) {
        if (max.resource.geode > this.best) {
          this.best = max.resource.geode;
          bestLoops = loops;
          this.bestState = max;
          bestGeodes = max.history.map(state => state.resource.geode);
          console.log(`${loops} new best ${this.blueprint.id} : ${this.best} : ${max.toString()}`);
        }
      }

      if (max.promise() > this.best && max.minute < minutes && max.resource.geode >= bestGeodes[max.minute - 1]) { // there's hope yet ...
        max.minute ++;
        // choose what to build (or not) and spend...
        const choices = this.blueprint.robots.filter(robot => robot.canCreate(max.resource));
        
        // sometimes to do nothing is not a choice ... 
        // can I build all the robots that I have production for? if yes then do nothing is not a choice. (otherwise it is)
        const productionFor = this.blueprint.robots.filter(robot => robot.producingFor(max.production));
        if (productionFor.some(robot => !choices.includes(robot))) {
          this.queue.push(max.clone());
        }

        choices.forEach(choice => {
          const next = max.clone();
          next.build(choice); 
          this.queue.push(next);
        })
      }
      now = (new Date()).getTime();
      if ((now - iteration) > 5000) {
        iteration = now;
        console.log({
          lps: loops,
          elapsed: Math.floor((now - start) / 1000),
          len: this.queue.length,
          min: max.minute,
          lst: max.promise(),
          cst: max.resource.geode,
          state: max.toString(),
          best: this.best 
        });
      }      
    }
    console.log(`analysis complete`);
    now = (new Date()).getTime();
    console.log({
      lps: loops,
      elapsed: Math.floor((now - start) / 1000),
      len: this.queue.length,
      min: this.bestState!.minute,
      lst: this.bestState!.promise(),
      cst: this.bestState!.resource.geode,
      state: this.bestState!.toString(),
      best: this.best 
    });
    this.bestState!.history.push(this.bestState!);
    console.log(`analysis complete! Queue ${this.queue.length} =============\n ${this.queue.slice(Math.min(0,this.queue.length - 30)).map(state=>state.toString()).join("\n")}`);
    console.log(`analysis complete! History ===========\n ${this.bestState!.history.map(state=>state.toString()).join("\n")}`);
    console.log("=========================================");
  }
}

const parseInput = (str: string) => {

  const regex = /^Blueprint (\d+): Each ore robot costs (\d+) ore\. Each clay robot costs (\d+) ore\. Each obsidian robot costs (\d+) ore and (\d+) clay\. Each geode robot costs (\d+) ore and (\d+) obsidian\.$/gm;

  let m: RegExpExecArray | null;

  let blueprints : BluePrint[] = [];
  while ((m = regex.exec(str)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
          regex.lastIndex++;
      }
      console.log("bob?");
      const [, ...rest] = m;
      const [id, oreRobotOreCost, clayRobotOreCost, obsidianRobotOreCost, obsidianRobotClayCost, geodeRobotOreCost, geodeRobotObsidianCost] = rest.map(Number);
      blueprints.push(new BluePrint(id, oreRobotOreCost, clayRobotOreCost, obsidianRobotOreCost, obsidianRobotClayCost, geodeRobotOreCost, geodeRobotObsidianCost));
  }
  return blueprints;
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);
  const analyses = input.map(blueprint => new Analysis(blueprint));
  analyses.forEach(analysis => analysis.run());
  return analyses.map(analysis => analysis.best * analysis.blueprint.id).reduce((p, c) => p + c, 0);
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return 0;
};

const testInput = `
Blueprint 1: Each ore robot costs 4 ore. Each clay robot costs 2 ore. Each obsidian robot costs 3 ore and 14 clay. Each geode robot costs 2 ore and 7 obsidian.
Blueprint 2: Each ore robot costs 2 ore. Each clay robot costs 3 ore. Each obsidian robot costs 3 ore and 8 clay. Each geode robot costs 3 ore and 12 obsidian.
`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 33,
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
  onlyTests: true,
});
