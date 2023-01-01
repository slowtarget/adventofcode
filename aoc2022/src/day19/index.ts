import run from "aocrunner";
const txtCode = { 
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
  };
const {Reset, FgYellow} = txtCode;

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

  spend(costIn : Partial<IResource>) {

    const cost: IResource = {
      ore: costIn.ore ?? 0,
      clay: costIn.clay ?? 0,
      obsidian: costIn.obsidian ?? 0,
      geode: 0
    }
    if (this.values.ore < cost.ore ) {
      throw new Error(`Budget!! res : ${this.toString()} cost: ${(new Resource(costIn)).toString()}`)
    }
    if (this.values.clay < cost.clay ) {
      throw new Error(`Budget!! res : ${this.toString()} cost: ${(new Resource(costIn)).toString()}`)
    }
    if (this.values.obsidian < cost.obsidian ) {
      throw new Error(`Budget!! res : ${this.toString()} cost: ${(new Resource(costIn)).toString()}`)
    }

    this.values.ore -= cost.ore ?? 0;
    this.values.clay -= cost.clay ?? 0;
    this.values.obsidian -= cost.obsidian ?? 0;
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
const golden : {minute: number, production: Partial<IResource>, resource: Partial<IResource>}[] =  [
  {minute: 1, production: {ore: 1}, resource: {ore:1}},
  {minute: 3, production: {ore: 1, clay: 1}, resource: {ore:1}},
  {minute: 5, production: {ore: 1, clay: 2}, resource: {ore:1, clay:2}},
  {minute: 7, production: {ore: 1, clay: 3}, resource: {ore:1, clay:6}},
  {minute: 11, production: {ore: 1, clay: 3, obsidian: 1}, resource: {ore:2, clay:4}},
  {minute: 12, production: {ore: 1, clay: 4, obsidian: 1}, resource: {ore:1, clay:7, obsidian:1}},
  {minute: 15, production: {ore: 1, clay: 4, obsidian: 2}, resource: {ore:1, clay:5, obsidian:4}},
  {minute: 18, production: {ore: 1, clay: 4, obsidian: 2, geode: 1}, resource: {ore:2, clay:17, obsidian:3}},
  {minute: 21, production: {ore: 1, clay: 4, obsidian: 2, geode: 2}, resource: {ore:3, clay:29, obsidian:2, geode: 3}},
  {minute: 23, production: {ore: 2, clay: 4, obsidian: 2, geode: 2}, resource: {ore:1, clay:37, obsidian:6, geode: 7}},
  {minute: 23, production: {ore: 1, clay: 5, obsidian: 2, geode: 2}, resource: {ore:2, clay:33, obsidian:4, geode: 7}}
];
const goldenPath = golden.map(r => ({
  ...r, 
  production: new Resource(r.production),
  resource: new Resource(r.resource)
}));
const goldenBuild: (keyof IResource)[]= ["clay","clay","clay","obsidian","clay","obsidian","geode","geode"];
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
  public buildOrder: (keyof IResource)[] = [];
  public resource: Resource;
  public production: Resource;
  public collections: number = 0;
  private building?: Robot;

  constructor(
    public blueprint: BluePrint,
    resource: Partial<IResource>,
    production: Partial<IResource>,
    private minute: number,
    
  ){
    this.resource = new Resource(resource);
    this.production = new Resource(production);

  }

  getMinute() {
    return this.minute;
  }

  startBuilding(robot: Robot) {
    this.building = robot;
    this.resource.spend(robot.cost.values);
  }

  private collect = () => {
    this.collections ++;
    this.resource.add(this.production.values);
  }

  private robotReady = () => {
    if (!this.building) {
      throw new Error("building undefined when ready...")
    }
    this.buildOrder.push(this.building.key);
    this.production.add(this.building.produces.values);
    this.building === undefined;
  }

  tick(robot?: Robot) {
    this.minute ++;
    if (robot) {
      this.startBuilding(robot);
    }
    this.collect();
    if (robot) {
      this.robotReady();
    }
  }

  promise(){
    const remaining = minutes - this.minute;
    return this.resource.values.geode + remaining * (this.production.values.geode + remaining - 1);
  }

  trusted() { 
    return this.resource.values.geode + this.production.values.geode * (minutes - this.minute)
  }
  compareGeode(other: State){
    return this.trusted() - other.trusted();
  }

  compareObsidian(other: State){
      return this.production.values.obsidian  - other.production.values.obsidian;
  }

  compareClay(other: State){
      return this.production.values.clay - other.production.values.clay;
  }

  compareOre(other: State){
    return this.production.values.ore - other.production.values.ore;
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
    const clone = new State(this.blueprint, this.resource.values, this.production.values, this.minute.valueOf());
    clone.history = [...this.history, this];
    clone.buildOrder = [...this.buildOrder];
    clone.collections = this.collections;
    return clone;
  }

  toString(){
    return `${this.blueprint.id}: ${this.minute} (${this.collections}) p:${this.production.toString()} r:${this.resource.toString()} b: ${this.building?.key ?? ""}`
  }
}
let minutes = 24;
class Analysis {
  public initialstate: State;
  public queue: State[] = [];
  public bestState?: State;
  public best: number = 0;
  public maxCost: Resource;
  constructor(
    public blueprint: BluePrint,
    public totalTime: number
  ){
    this.initialstate = new State(this.blueprint, {}, {ore:1}, 0);
    minutes = this.totalTime;
    // work out max building costs - won't be building more bot than this.
    this.maxCost = new Resource({
      ore: Math.max(0, ...blueprint.robots.map(robot => robot.cost.values.ore)),
      clay: Math.max(0, ...blueprint.robots.map(robot => robot.cost.values.clay)),
      obsidian: Math.max(0, ...blueprint.robots.map(robot => robot.cost.values.obsidian)),
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

      // let goldenOrder = true;

      // for (let i = 0; i < Math.min(goldenBuild.length, max.buildOrder.length); i++){
      //   if (goldenBuild[i] !== max.buildOrder[i]){
      //     goldenOrder = false;
      //   }
      // }

      // if (goldenOrder) {
      //   console.log(`${loops} ${max.buildOrder.length} GOLDEN ORDER ${max.toString()}`);
      //   const goldy = goldenPath.findIndex(gold => 
      //     gold.minute === max.getMinute() && 
      //     gold.production.equals(max.production) &&
      //     gold.resource.equals(max.resource) 
      //      );
      //   if (goldy > -1) {
      //     console.log(`${loops} ${goldy} GOLDEN ${max.toString()}`);
      //     if (goldy === 8){
      //       console.log(`${loops} ${goldy} this should be a winner ... ${max.toString()}`);
      //     }
      //     if (goldy > 8){
      //       console.log(`${loops} ${goldy} definitly a winner ... ${max.toString()}`);
      //     }
      //   }
      // }
      
      // tick
      let remaining = minutes - max.getMinute();
      if (remaining < 0) {
        throw new Error(`went below zero remaining ... ${max.toString()}`);
      }
      if (remaining === 1) {
        max.tick();
        remaining = 0;
      }
      if (remaining === 0) {
        if (max.resource.values.geode > this.best) {
          this.best = max.resource.values.geode;
          this.bestState = max;
          bestGeodes = max.history.map(state => state.resource.values.geode);
          // console.log(`${loops} new best ${this.blueprint.id} : ${this.best} : ${max.toString()}`);
        }
      }

      // truncate? 
      if (max.promise() > this.best && remaining > 0) { // there's hope yet ...
        // if (max.promise() > this.best && remaining > 0 && max.resource.values.geode >= bestGeodes[max.getMinute() - 1]) { // there's hope yet ...
        // if ( remaining > 0 ) { // there's hope yet ...

        // spend
        // what do I have production for? // need to produce
        const productionFor = this.blueprint.robots
          .filter(robot => robot.producingFor(max.production.values))
          .filter(robot => max.production.values[robot.key] < this.maxCost.values[robot.key]);

        // lets build them all - provided we have the time
        productionFor
          .map(robot => {
            // how long do I need to wait for resources to build this bot?
            return {robot, days: Math.max(...Object.keys(robot.cost.values).map(k => k as keyof IResource)
              .filter(key => robot.cost.values[key] > 0)
              .map(key =>{
                const shortfall = Math.max(0, (robot.cost.values[key] as number) - (max.resource.values[key] as number));
                return Math.floor((shortfall / max.production.values[key]) + 0.999); 
              }))};
          }) 
          .filter(choice => choice.days < (remaining - 1))
          .forEach(choice => {
            const next = max.clone();
            for (let d = 0; d < choice.days; d++){
              // days fly by
              next.tick();
            }
            try {
              next.tick(choice.robot);
            } catch (e) {
              console.log(e)
              throw new Error(`${loops} : ${next.toString()} days: ${choice.days} robot: ${choice.robot.toString()}`);
            }
            this.queue.push(next);
            pushed ++;
        });

        if (pushed === 0) {
          // console.log(`${loops} UNREACHABLE? ${max.toString()}`);
          // throw new Error("unreachable reached");
          // nothing pushed... it must be that there is not enough time left to build anything
          // lets run this ones clock down and chuck back on the queue
          // THIS CODE IS UNREACHABLE (for most blueprints) - there will normally be something cheap to build.
          for (let d = 0; d < remaining - 1; d++){
            // produce
            max.tick();
          }
          const next = max.clone();
          this.queue.push(next);
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
          min: max.getMinute(),
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
      min: this.bestState?.getMinute(),
      lst: this.bestState?.promise(),
      cst: this.bestState?.resource.values.geode,
      state: this.bestState?.toString(),
      best: this.best 
    });
    this.bestState?.history?.push(this.bestState!);
    // console.log(`analysis complete! Queue ${this.queue.length} =============\n ${this.queue.slice(Math.min(0,this.queue.length - 30)).map(state=>state.toString()).join("\n")}`);
    // console.log(`analysis complete! History ===========\n ${this.bestState!.history.map(state=>state.toString()).join("\n")}`);
    // console.log(`analysis complete! Build Order =======\n ${this.bestState!.buildOrder.map(order=>order.toString()).join(" -> ")}`);
    // console.log("=========================================");
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
  const analyses = input.map(blueprint => new Analysis(blueprint, 24));
  analyses.forEach(analysis => analysis.run());
  return analyses.map(analysis => analysis.best * analysis.blueprint.id).reduce((p, c) => p + c, 0);
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput).slice(0,3);
  const analyses = input.map(blueprint => new Analysis(blueprint, 32));
  analyses.forEach(analysis => analysis.run());
  return analyses.map(analysis => analysis.best).reduce((p, c) => p * c, 1);
};

const testInput1 = `
Blueprint 1: Each ore robot costs 4 ore. Each clay robot costs 2 ore. Each obsidian robot costs 3 ore and 14 clay. Each geode robot costs 2 ore and 7 obsidian.
`;
const testInput2 = `
Blueprint 1: Each ore robot costs 4 ore. Each clay robot costs 2 ore. Each obsidian robot costs 3 ore and 14 clay. Each geode robot costs 2 ore and 7 obsidian.
Blueprint 2: Each ore robot costs 2 ore. Each clay robot costs 3 ore. Each obsidian robot costs 3 ore and 8 clay. Each geode robot costs 3 ore and 12 obsidian.
`;

run({
  part1: {
    tests: [
      {
        input: testInput1,
        expected: 9,
      },
      {
        input: testInput2,
        expected: 33,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput2,
        expected: 56 * 62,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  // onlyTests: true,
});
