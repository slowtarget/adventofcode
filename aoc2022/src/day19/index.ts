import run from "aocrunner";

type IResource = {
  ore: number,
  clay: number,
  obsidian: number,
  geode: number
}

class Resource { 
  public values: IResource;
  constructor(
    values: Partial<IResource>
  ) {
    this.values = {
      ore: values.ore ?? 0,
      clay: values.clay ?? 0,
      obsidian: values.obsidian ?? 0,
      geode: values.geode ?? 0
    }
  }
  add(production: Partial<IResource>) {
    this.values.ore       += production.ore || 0;
    this.values.clay      += production.clay || 0;
    this.values.obsidian  += production.obsidian || 0;
    this.values.geode     += production.geode || 0;
  }
  spend(cost: Partial<IResource>) {
    this.values.ore -= cost.ore || 0;
    this.values.clay -= cost.clay || 0;
    this.values.obsidian -= cost.obsidian || 0;
  }
  clone(){
    return new Resource(this.values);
  }
  equals(other: Resource) {
    const t = this.values;
    const o = other.values;
    return t.ore === o.ore && t.clay === o.clay && t.obsidian === o.obsidian && t.geode === o.geode; 
  }
  toString() {
    const v = this.values;
    return `[${[v.ore, v.clay, v.obsidian, v.geode].join(", ")}]`;
  }
}
const golden : {minute: number, production: Partial<IResource>}[] =  [
  {minute: 1, production: {ore: 1}},
  {minute: 3, production: {ore: 1, clay: 1}},
  {minute: 5, production: {ore: 1, clay: 2}},
  {minute: 7, production: {ore: 1, clay: 3}},
  {minute: 11, production: {ore: 1, clay: 3, obsidian: 1}},
  {minute: 12, production: {ore: 1, clay: 4, obsidian: 1}},
  {minute: 15, production: {ore: 1, clay: 4, obsidian: 2}},
  {minute: 18, production: {ore: 1, clay: 4, obsidian: 2, geode: 1}},
  {minute: 21, production: {ore: 1, clay: 4, obsidian: 2, geode: 2}}
];
const goldePath = golden.map(r => ({...r, production: new Resource(r.production)}));
class Robot {
  public cost: Resource;
  public produces: Resource;
  public key: keyof IResource;
  constructor(
    cost: Partial<IResource>,
    produces: Partial<IResource>
  ) {
    this.cost = new Resource(cost);
    this.produces = new Resource(produces);
    this.key = Object.keys(this.produces.values).map(key => key as keyof IResource).find(key => this.produces.values[key] > 0)!
  }

  canCreate(resources: IResource) {
    return Object.keys(this.cost)
      .map(key => key as keyof IResource)
      .map(key=>({cost: this.cost.values[key], resource: resources[key] , key}))
      .every(req => req.resource >= req.cost);
  }

  producingFor(production: IResource) {
    return Object.keys(this.cost.values)
      .map(key => key as keyof IResource)
      .map(key=>({cost: this.cost.values[key], production: production[key] , key}))
      .filter(req => req.cost !== 0 )
      .every(req => req.production > 0);
  }
  toString() {
    return `${this.key} c: ${this.cost.toString()}`;
  }
}

class OreBot extends Robot {
  constructor(
    cost: Partial<IResource>
  ){
    super(cost, {ore: 1})
  }
}
class ClayBot extends Robot {
  constructor(
    cost: Partial<IResource>
  ){
    super(cost, {clay: 1})
  }
}
class ObsBot extends Robot {
  constructor(
    cost: Partial<IResource>
  ){
    super(cost, {obsidian: 1})
  }
}
class GeoBot extends Robot {
  constructor(
    cost: Partial<IResource>
  ){
    super(cost, {geode: 1})
  }
}
class BluePrint{
  public robots: Robot[] = [];
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
  public resource: Resource;
  public production: Resource
  constructor(
    public blueprint: BluePrint,
    resource: Partial<IResource>,
    production: Partial<IResource>,
    public minute: number,
    public building?: Robot,
  ){
    this.resource = new Resource(resource);
    this.production = new Resource(production);
  }
  build(robot: Robot) {
    this.building = robot;
    this.resource.spend(robot.cost.values);
  }
  promise(){
    const remaining = minutes - this.minute;
    return this.resource.values.geode + remaining * (this.production.values.geode + remaining - 1);
  }
  compareGeode(other: State){
    const resource = this.resource.values.geode - other.resource.values.geode;
    if (resource === 0) {
      return this.production.values.geode - other.production.values.geode
    } else {
      return resource;
    }
  }
  compareObsidian(other: State){
      return this.production.values.obsidian  - other.production.values.obsidian;
  }
  compareClay(other: State){
      return (other.production.values.ore + other.production.values.clay) - (this.production.values.ore + this.production.values.clay);
  }
  compareOre(other: State){
    return other.production.values.ore - this.production.values.ore;
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
    const clone = new State(this.blueprint, this.resource.values, this.production.values, this.minute.valueOf(), this.building);
    clone.history = [...this.history, this];
    return clone;
  }
  toString(){
    return `${this.blueprint.id}: ${this.minute} p:${this.production.toString()} r:${this.resource.toString()} b: ${this.building?.key ?? ""}`
  }
}
const minutes = 24;
class Analysis {
  public initialstate: State;
  public queue: State[] = [];
  public bestState?: State;
  public best: number = 0;
  public maxCost: Resource;
  constructor(
    public blueprint: BluePrint
  ){
    this.initialstate = new State(this.blueprint, {}, {ore:1}, 1);

    // work out max building costs - won't be building more bot than this.
    this.maxCost = new Resource({
      ore: Math.max(0,...blueprint.robots.map(robot => robot.cost.values.ore)),
      clay: Math.max(0,...blueprint.robots.map(robot => robot.cost.values.clay)),
      obsidian: Math.max(0,...blueprint.robots.map(robot => robot.cost.values.obsidian)),
      geode: Infinity // I still want to hoard geodes ...
  });

  }
  run(){

    const preference = (a: State, b: State) => a.compare(b);

    console.log(`${this.blueprint.id} analysis running`);
    this.queue.push(this.initialstate.clone());
    let loops = 0;
    let now = (new Date()).getTime();
    let start = now;
    let iteration = start; 

    let bestGeodes = Array(24).fill(0);
    while (this.queue.length ) { // && ((now - start) < 60000 )
      loops ++;
      let pushed = 0;
      // favour geodes above all...but get a quick first answer, sort by geodes + geode production * minutes remaining, then by obsidian production, then by clay production, then by ore production... 
      // truncate anything that has less minutes left than the best geode production 

      const max = this.queue.sort(preference).pop()!;

      // increment production if applicable
      if (max.building) {
        max.production.add(max.building.produces.values);
        max.building = undefined;
      }
      const goldy = goldePath.findIndex(gold => gold.minute === max.minute && gold.production.equals(max.production) );
      if (goldy > -1) {
        console.log(`${loops} ${goldy} GOLDEN ${max.toString()}`);
      }

      // tick
      let remaining = minutes - max.minute;
      if (remaining < 0) {
        throw new Error(`went below zero remaining ... ${max.toString()}`);
      }
      if (remaining === 1) {
        max.resource.add(max.production.values);
        remaining = 0;
        if (max.resource.values.geode > this.best) {
          this.best = max.resource.values.geode;
          this.bestState = max;
          bestGeodes = max.history.map(state => state.resource.values.geode);
          console.log(`${loops} new best ${this.blueprint.id} : ${this.best} : ${max.toString()}`);
        }
      }
      // truncate? 
      // if (max.promise() > this.best && remaining > 0 && max.resource.values.geode >= bestGeodes[max.minute - 1]) { // there's hope yet ...
      if ( remaining > 0 ) { // there's hope yet ...

        // spend
        // what do I have production for?
        const productionFor = this.blueprint.robots.filter(robot => robot.producingFor(max.production.values));

        // lets build them all - provided we have the time and want them etc
       
        productionFor.filter(robot => max.production.values[robot.key] < this.maxCost.values[robot.key])
          .map(robot => {
            // how long do I need to wait for resources to build this bot?
            return {robot, days: Math.max(...Object.keys(robot.cost.values).map(k => k as keyof IResource)
              .filter(key => robot.cost.values[key] > 0)
              .map(key =>{
                
                const shortfall = Math.max(0, (robot.cost.values[key] as number) - (max.resource.values[key] as number))
                if (shortfall === 0) {
                  return 0; 
                }
                return Math.floor((shortfall / max.production.values[key]) + 0.5); 
              }))};
          }) 
          .filter(choice => choice.days < remaining)
          .forEach(choice => {
            const next = max.clone();
            for (let d = 0; d < choice.days; d++){
              // days fly by
              next.resource.add(next.production.values);
              next.minute ++;
            }
            next.build(choice.robot);
            next.resource.add(next.production.values);

            this.queue.push(next);
            pushed ++;
        });
        if (pushed === 0) {
          // nothing pushed... it must be that there is not enough time left to build anything
          // lets run this ones clock down and chuck back on the queue
          for (let d = 0; d < remaining - 1; d++){
            // produce
            max.resource.add(max.production.values);
            max.minute ++;
          }
          this.queue.push(max.clone());
          pushed ++;
        } 
      }
      now = (new Date()).getTime();
      if ((now - iteration) > 10000) {
        iteration = now;
        console.log({
          lps: loops,
          elapsed: Math.floor((now - start) / 1000),
          len: this.queue.length, 
          min: max.minute,
          lst: max.promise(),
          cst: max.resource.values.geode,
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
      min: this.bestState?.minute,
      lst: this.bestState?.promise(),
      cst: this.bestState?.resource.values.geode,
      state: this.bestState?.toString(),
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
`;
// Blueprint 2: Each ore robot costs 2 ore. Each clay robot costs 3 ore. Each obsidian robot costs 3 ore and 8 clay. Each geode robot costs 3 ore and 12 obsidian.

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
