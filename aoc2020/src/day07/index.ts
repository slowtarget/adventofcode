import run from "aocrunner";

type BagCriteria = {
  colour:string,
  requirement:number
};

type Bag = {
      contents:BagCriteria[],
      colour:string,
      canBeIn?:Bag[]
};

type Baggage = {
  [key:string]:Bag
}
function arrayToMap(result: Baggage[]): Baggage {
  return result.reduce((p, c) => {
      return { ...p, ...c };
  }, {});
}
const couldContain = (bag:Bag, target:string, baggage:Baggage):boolean => {
  // console.log(`couldContain looking in ${bag?.colour}`);
  if (bag.contents.some(b=>b.colour===target)) {
      return true;
  }
  return bag.contents.some(b=>couldContain(baggage[b.colour],target,baggage));
};
const allParents = (bag:Bag, baggage:Baggage): Baggage => {
  const result:Baggage[] = bag.canBeIn?.map(b=>{
          const parents: Baggage = allParents(b,baggage);
          const reduced:Baggage = {[b.colour]:b, ...parents};
          return reduced;
      }) || [];


  return arrayToMap(result);
}

const getContents = (bag:Bag,baggage:Baggage):number =>{
  return bag.contents.map(b => b.requirement * (1 + getContents(baggage[b.colour],baggage))).reduce((p,c)=>p+c,0);
}
const findSolution = (input:Baggage) => {

  // console.log(`input ${JSON.stringify(input)}`)

  const colours = Object.keys(input);

  const baggage = {...input};

  colours.forEach(colour=>baggage[colour].contents.forEach(c=>baggage[c.colour]?.canBeIn?.push(baggage[colour])));
  const bug = colours.map(colour=>baggage[colour].contents.map(c=>c.colour).filter(c=>baggage[c]===undefined)).filter(arr=>arr.length>0);
  console.log(`bug : ${bug}`);
  const part1 = colours.map(colour=>baggage[colour]).filter(bag=>couldContain(bag,'shiny gold', baggage)).length;

  var part12 = arrayToMap(baggage['shiny gold'].canBeIn
      ?.map(b=>{
         const r:Baggage ={[b.colour]:b,...allParents(b,baggage)};
         return r;
      })||[]);
      // .reduce((p:Baggage,c:Bag[])=>{
      //     const c3:Baggage = c.reduce((p2:Baggage,c2)=>({...p2, [c2.colour]:c2}),{});
      //     return <Baggage>{...p, ...c3}),{}));

  var part2 = getContents(baggage['shiny gold'],baggage);

  return {part1, part12:Object.keys(part12).length, part2};
};
// light plum bags contain 3 drab orange bags, 4 faded coral bags.

const parseInput = (rawInput: string) => {
  const regex = /(.*) bags contain (.*)\./g;
  var m: RegExpExecArray;
  var result: Baggage = {};
  while ((m = regex.exec(rawInput)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    var bag: Bag = {
      colour: m[1],
      contents: m[2].split(/, /g).map(b=>getCriteria(b)).filter(b=>!!b)
    }
    result[bag.colour] = bag;

  }
  const colours = Object.keys(result);
  colours.forEach(colour=>result[colour].contents.forEach(c=>result[c.colour]?.canBeIn?.push(result[colour])));
  return result;
}
const getCriteria = (input:string):BagCriteria| null => {
  const regex = /(?:(no other bags)|(\d+) (.*) bag(?:s)?)/g;
  var m: RegExpExecArray;
  m = regex.exec(input);
  if (m===null){
    console.log(`input ${JSON.stringify(input)}`)
    throw new Error('bad bag')
  }
  if (m[1]==='no other bags') {
    return null;
  }
  return {
    colour: m[3],
    requirement: parseInt(m[2],10)
  }
}

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return Object.keys(input).map(colour=>input[colour]).filter(bag=>couldContain(bag,'shiny gold', input)).length;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return getContents(input['shiny gold'],input);
};

const testInput = `
light red bags contain 1 bright white bag, 2 muted yellow bags.
dark orange bags contain 3 bright white bags, 4 muted yellow bags.
bright white bags contain 1 shiny gold bag.
muted yellow bags contain 2 shiny gold bags, 9 faded blue bags.
shiny gold bags contain 1 dark olive bag, 2 vibrant plum bags.
dark olive bags contain 3 faded blue bags, 4 dotted black bags.
vibrant plum bags contain 5 faded blue bags, 6 dotted black bags.
faded blue bags contain no other bags.
dotted black bags contain no other bags.`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 4,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 32,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
