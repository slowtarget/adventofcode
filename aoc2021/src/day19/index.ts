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

var debug = false;
const log = (...arg: any[]) => {
  if (debug) {
    console.log('', ...arg);
  }
}
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

// Returns current time
// (and, if provided, prints the event's name)
const now = (eventName: string | null = null) => {
  if (eventName) {
    log(`Started ${eventName}..`);
  }
  return new Date().getTime();
}

// Store current time as `start`
let begunAt = now();

// Returns time elapsed since `beginning`
// (and, optionally, prints the duration in seconds)
const elapsed = (beginning: number = begunAt, logit: boolean = false) => {
  const duration = new Date().getTime() - beginning;
  if (logit) {
    log(`${duration / 1000}s`);
  }
  return duration;
}
type Neighbour = { beacon: Beacon, distance: number };
type Pair = { a: Beacon, b: Beacon, distance: number }
class Beacon {

  public neighbours: Neighbour[] = [];
  public neighbourHash: number = 0;
  public scanner?: Scanner;
  constructor(
    public x: number,
    public y: number,
    public z: number
  ) { }
  public getSqrDistance(b: Beacon) {
    return (b.x - this.x) ** 2 + (b.y - this.y) ** 2 + (b.z - this.z) ** 2;
  }
  public getManhattenDistance(b: Beacon) {
    return [(b.x - this.x), (b.y - this.y), (b.z - this.z)].map(Math.abs).reduce((p, c) => p + c, 0);
  }
  public sortNeighbours() {
    this.neighbours.sort((a, b) => a.distance - b.distance);
  }
  createHashes(criteria: number): void {
    this.neighbourHash = this.neighbours.slice(0, criteria).map(n => n.distance).reduce((p, c) => p + c, 0);
  }
  getDiff(beacon: Beacon) {
    var dx = this.x - beacon.x;
    var dy = this.y - beacon.y;
    var dz = this.z - beacon.z;
    return { dx, dy, dz };
  }
  asString(x: number, y: number, z: number) {
    var pad = 4;
    return `[${numToRightJustifiedString(x, pad)},${numToRightJustifiedString(y, pad)},${numToRightJustifiedString(z, pad)}]`;
  }
  toString(): string {
    return this.asString(this.x, this.y, this.z);
  }
  equals(other: Beacon) {
    return this.x === other.x && this.y === other.y && this.z === other.z;
  }
}
class Scanner {
  public merged: { x: number, y: number, z: number, name: string }[] = [];
  constructor(
    public name: string,
    public beacons: Beacon[],
  ) { }

  // 01234567
  //remove 3
  // slice 0,3 + slice(4
  public getClosest(): Pair {
    var min = <Pair>{ a: new Beacon(0, 0, 0), b: new Beacon(0, 0, 0), distance: Number.MAX_VALUE };
    var notdone: Beacon[] = [...this.beacons];
    this.beacons.forEach(bk => {
      bk.neighbours = [];
    })
    for (var a of this.beacons) {
      var remove = notdone.findIndex(x => x === a);
      notdone = [...notdone.slice(0, remove), ...notdone.slice(remove + 1)];
      for (var b of notdone) {
        var distance = a.getSqrDistance(b);
        a.neighbours.push({ beacon: b, distance });
        b.neighbours.push({ beacon: a, distance });
        if (distance < min.distance) {
          min = { a, b, distance };
        }
      }
    }
    return min;
  }
  public sortNeighbours() {
    this.beacons.forEach(beacon => beacon.sortNeighbours());
    this.beacons.forEach(beacon => beacon.scanner = this);
  }
  public createHashes(criteria: number) {
    this.beacons.forEach(beacon => beacon.createHashes(criteria));
  }
  public hasBeacon(other: Beacon): boolean {
    return this.beacons.some(b => b.equals(other));
  }
}

type mappingFunction = (beacon: Beacon) => number;
const getMappingFn = (value: number, bdx: number, bdy: number, bdz: number): mappingFunction => {
  switch (value) {
    case bdx:
      return (beacon: Beacon) => beacon.x;
    case -1 * bdx:
      return (beacon: Beacon) => beacon.x * -1;
    case bdy:
      return (beacon: Beacon) => beacon.y;
    case -1 * bdy:
      return (beacon: Beacon) => beacon.y * -1;
    case bdz:
      return (beacon: Beacon) => beacon.z;
    case -1 * bdz:
      return (beacon: Beacon) => beacon.z * -1;
    default:
      throw new Error('could not map!');
  }
}
class Puzzle {
  private banned: number[] = [];
  private index: number = -1;

  expected?: number;
  constructor(
    public scanners: Scanner[]
  ) {


  }
  public findAndMergeScannerPairs() {
    var beaconMap: { [hash: number]: Beacon[] } = {};
    var criteria = 11;
    ({ criteria, beaconMap } = this.findCandidatesUsingNearestNeighbourHashes(criteria));
    var checkedList: Beacon[][] = this.validateCandidates(beaconMap, criteria);
    var current = this.processList(checkedList, criteria);

    if (current === this.scanners.length) {
      log("failed to match and remove a scanner? ! what now?")
    }
  }

  private processList(checkedList: Beacon[][], criteria: number) {
    var checkIndex = 0;
    var current = this.scanners.length;
    while (checkIndex < checkedList.length && this.scanners.length === current) {

      var match = checkedList[checkIndex];
      var [a, b] = match;
      log(' ', a.scanner?.name.padStart(20), b.scanner?.name);
      log('M', a.toString().padStart(20), b.toString());
      var candidates: Beacon[][] = [];
      for (var i = 0; i <= criteria; i++) {
        var aa = a.neighbours[i].beacon;
        var bb = b.neighbours[i].beacon;
        var { dx: adx, dy: ady, dz: adz } = a.getDiff(aa);
        var { dx: bdx, dy: bdy, dz: bdz } = b.getDiff(bb);
        // all difference values are different and not 0
        if ([adx, ady, adz, bdx, bdy, bdz].map(Math.abs).filter(unique).filter(n => n !== 0).length === 3) {
          candidates.push([aa, bb]);
        }
        log('d', aa.asString(adx, ady, adz).padStart(20), bb.asString(bdx, bdy, bdz));
        log(i, aa.toString().padStart(20), bb.toString());
      }

      var [aa, bb] = candidates[0] || [undefined, undefined];
      var { dx: adx, dy: ady, dz: adz } = a.getDiff(aa);
      var { dx: bdx, dy: bdy, dz: bdz } = b.getDiff(bb);


      var xFn = getMappingFn(adx, bdx, bdy, bdz);
      var yFn = getMappingFn(ady, bdx, bdy, bdz);
      var zFn = getMappingFn(adz, bdx, bdy, bdz);

      for (var i = 0; i <= criteria; i++) {
        var aa = a.neighbours[i].beacon;
        var bb = b.neighbours[i].beacon;
        var mm = new Beacon(xFn(bb), yFn(bb), zFn(bb));

        log(i, aa.toString().padStart(20), mm.toString().padStart(20), mm.asString(aa.x - mm.x, aa.y - mm.y, aa.z - mm.z));

      }
      var [aaa, bbb] = candidates[0];
      var mmm = new Beacon(xFn(bbb), yFn(bbb), zFn(bbb));
      var scanner: { x: number, y: number, z: number, name: string } = {
        x: aaa.x - mmm.x,
        y: aaa.y - mmm.y,
        z: aaa.z - mmm.z,
        name: b.scanner!.name
      }
      var xTr = (beacon: Beacon) => xFn(beacon) + scanner.x;
      var yTr = (beacon: Beacon) => yFn(beacon) + scanner.y;
      var zTr = (beacon: Beacon) => zFn(beacon) + scanner.z;
      var source = aaa.scanner!;
      var target = bbb.scanner!;
      var targetBeacons = target.beacons.map(beacon => new Beacon(xTr(beacon), yTr(beacon), zTr(beacon)));
      log("check translation");
      for (var i = 0; i <= criteria; i++) {
        var aa = a.neighbours[i].beacon;
        var bb = b.neighbours[i].beacon;
        var mm = new Beacon(xTr(bb), yTr(bb), zTr(bb));

        log(i, aa.toString().padStart(20), mm.toString().padStart(20), mm.asString(aa.x - mm.x, aa.y - mm.y, aa.z - mm.z));

      }
      const matched = targetBeacons.filter(other => source.hasBeacon(other));
      log("can match ", matched);
      if (matched.length >= 12) {
        this.merge(targetBeacons, a, b, xTr, yTr, zTr, source, target, scanner);
      } else {
        log(matched.length, "did not match enough ? another to check?");
        this.banned.push(a.neighbourHash);
      }
      checkIndex++;
    }
    return current;
  }

  private merge(targetBeacons: Beacon[], a: Beacon, b: Beacon, xTr: mappingFunction, yTr: mappingFunction, zTr: mappingFunction, source: Scanner, target: Scanner, scanner: { x: number, y: number, z: number, name: string }) {
    var m = new Beacon(xTr(b), yTr(b), zTr(b))
    source.merged.push(scanner);
    target.merged.forEach(({ x, y, z, name }) => {
      var s = new Beacon(x, y, z);
      source.merged.push({ x: xTr(s), y: yTr(s), z: zTr(s), name })
    });
    const toBeAdded = targetBeacons.filter(other => !source.hasBeacon(other));
    toBeAdded.forEach(tba => { tba.scanner = source; });
    source.beacons = [...source.beacons, ...toBeAdded];
    log(`added ${toBeAdded.length} beacons to ${source.name} from ${target.name}`);
    source.getClosest();
    source.sortNeighbours();

    var remove = this.scanners.findIndex(scanner => scanner === target);
    this.scanners = [...this.scanners.slice(0, remove), ...this.scanners.slice(remove + 1)];
  }

  private validateCandidates(beaconMap: { [hash: number]: Beacon[]; }, criteria: number) {
    var checkedList: Beacon[][] = [];
    Object.values(beaconMap).filter(m => m.length > 1).forEach(([a, b]) => {
      var checked = true;
      for (var i = 0; i < criteria + 1; i++) {
        if (a.neighbours[i].distance !== b.neighbours[i].distance) {
          checked = false;
          break;
        }
      }
      if (checked) {
        checkedList.push([a, b]);
      }
    });
    return checkedList;
  }

  private findCandidatesUsingNearestNeighbourHashes(criteria: number) {
    var matches = 0;
    var beaconMap: { [hash: number]: Beacon[]; } = {};
    while (matches === 0 && criteria > 1) {
      beaconMap = {};
      this.scanners.forEach(s => s.createHashes(criteria));
      for (var scanner of this.scanners) {
        for (var beacon of scanner.beacons) {
          if (beaconMap[beacon.neighbourHash]) {
            matches++;
            beaconMap[beacon.neighbourHash].push(beacon);
            log(`${criteria}: found one between Scanner ${scanner.name} and ${beaconMap[beacon.neighbourHash][0].scanner!.name}`);
          } else {
            if (!this.banned.includes(beacon.neighbourHash)) {
              beaconMap[beacon.neighbourHash] = [beacon];
            }
          }
        }
      }
      criteria--;
    }


    return { criteria, beaconMap };
  }

  public solve() {
    var result = 0;
    this.scanners.forEach(s => {
      s.getClosest();
      s.sortNeighbours();
    });
    var iteration = 0;
    while (this.scanners.length > 1 && iteration < 30) {
      this.findAndMergeScannerPairs()
      log(iteration, "scanners left: ", this.scanners.length)
      iteration++;
    }

    var scanners = this.scanners[0].merged.map(({ x, y, z }) => new Beacon(x, y, z));
    scanners.push(new Beacon(0, 0, 0));
    var notdone: Beacon[] = [...scanners];
    var max = 0;
    for (var a of scanners) {
      var remove = notdone.findIndex(x => x === a);
      notdone = [...notdone.slice(0, remove), ...notdone.slice(remove + 1)];
      for (var b of notdone) {
        var distance = a.getManhattenDistance(b);
        if (distance > max) {
          max = distance;
        }
      }
    }



    return { part1: this.scanners[0].beacons.length, part2: max };
  }
}
debug = false;
const parseInput = (rawInput: string) => {
  var scanners = rawInput
    .replace(/\r\n/g, '\n')
    .split(/\n\n/g);

  var puzzle: Scanner[] = scanners.map(s => s.split(/\n/g)).map(([name, ...beacons]) =>
    new Scanner(name, beacons.map(beacon => beacon.split(/,/g).map(a => parseInt(a))).map(([x, y, z]) => new Beacon(x, y, z))));

  return new Puzzle(puzzle).solve();
}


const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return input.part1;
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return input.part2;
};

const testInput = `
--- scanner 0 ---
404,-588,-901
528,-643,409
-838,591,734
390,-675,-793
-537,-823,-458
-485,-357,347
-345,-311,381
-661,-816,-575
-876,649,763
-618,-824,-621
553,345,-567
474,580,667
-447,-329,318
-584,868,-557
544,-627,-890
564,392,-477
455,729,728
-892,524,684
-689,845,-530
423,-701,434
7,-33,-71
630,319,-379
443,580,662
-789,900,-551
459,-707,401

--- scanner 1 ---
686,422,578
605,423,415
515,917,-361
-336,658,858
95,138,22
-476,619,847
-340,-569,-846
567,-361,727
-460,603,-452
669,-402,600
729,430,532
-500,-761,534
-322,571,750
-466,-666,-811
-429,-592,574
-355,545,-477
703,-491,-529
-328,-685,520
413,935,-424
-391,539,-444
586,-435,557
-364,-763,-893
807,-499,-711
755,-354,-619
553,889,-390

--- scanner 2 ---
649,640,665
682,-795,504
-784,533,-524
-644,584,-595
-588,-843,648
-30,6,44
-674,560,763
500,723,-460
609,671,-379
-555,-800,653
-675,-892,-343
697,-426,-610
578,704,681
493,664,-388
-671,-858,530
-667,343,800
571,-461,-707
-138,-166,112
-889,563,-600
646,-828,498
640,759,510
-630,509,768
-681,-892,-333
673,-379,-804
-742,-814,-386
577,-820,562

--- scanner 3 ---
-589,542,597
605,-692,669
-500,565,-823
-660,373,557
-458,-679,-417
-488,449,543
-626,468,-788
338,-750,-386
528,-832,-391
562,-778,733
-938,-730,414
543,643,-506
-524,371,-870
407,773,750
-104,29,83
378,-903,-323
-778,-728,485
426,699,580
-438,-605,-362
-469,-447,-387
509,732,623
647,635,-688
-868,-804,481
614,-800,639
595,780,-596

--- scanner 4 ---
727,592,562
-293,-554,779
441,611,-461
-714,465,-776
-743,427,-804
-660,-479,-426
832,-632,460
927,-485,-438
408,393,-506
466,436,-512
110,16,151
-258,-428,682
-393,719,612
-211,-452,876
808,-476,-593
-575,615,604
-485,667,467
-680,325,-822
-627,-443,-432
872,-547,-609
833,512,582
807,604,487
839,-516,451
891,-625,532
-652,-548,-490
30,-46,-14`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 79,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 3621,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
