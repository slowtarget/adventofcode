import run from "aocrunner";

const parseInput = (rawInput: string) => {
  return rawInput
    .replace(/\r\n/g, '\n')
    .split(/\n/g)
    .map(line => line.split(/,/g)
      .map(Number)
      .map((id, offset) => ({ id, offset }))
      .filter(bus => !isNaN(bus.id))
      .map(v => ({ ...v, id: v.id })));
}

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  var [earliestInput, buses] = input;

  var earliest = earliestInput[0].id;

  var waits = buses.map(v => ({ ...v, wait: v.id - (earliest % v.id) }));
  waits.sort((a, b) => a.wait - b.wait);
  var bus = waits[0];
  return bus.id * bus.wait;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  var data = input.map(ins => ins);
  var [, buses] = data;
  var logInt = 2;
  var found = [];
  var start = 0;
  var next = 0;
  var i = 0;
  var step = buses[i].id;
  var checks = 0;
  console.log(buses);
  i++;
  var bus = buses[i];
  while (found.length < 1 || (i < (buses.length - 1))) {
    start = next;
    if (((start + bus.offset) % bus.id) === 0) {
      found.push(start);
      console.log(`${found.length} found for ${i} at ${start}`)
      if (found.length > 1) {
        step = found[1] - found[0];
        i++;
        bus = buses[i];
        found = [];
        if (bus !== undefined) {
          console.log(`found for ${i} at ${start}, now stepping at ${step} and looking for ${bus.id}`)
        }
      }
    }
    checks++;
    if (checks % logInt === 0) {
      console.log(checks, start);
      logInt = logInt * 2;
    }
    next = start + step;
  }
  console.log(`finished with i: ${i} and found.length ${found.length} and buses.length ${buses.length}`);
  return start;
};

const testInput = `
939
7,13,x,x,59,x,31,19`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 295,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 1068781,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
