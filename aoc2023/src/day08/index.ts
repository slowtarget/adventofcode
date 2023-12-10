import run from "aocrunner";
import {__, converge, equals, head, identity, last, map, pipe, reduce, split, tail, tap, trim } from "ramda";

// AAA = (BBB, CCC)
const nodeNamesRegex= /\w{3}/g;

const nodeNames = pipe(
    (line: string) => line.matchAll(nodeNamesRegex),
    Array.from,
    map(
        pipe(
            head,
            trim
        )
    )
);
// const lastMatches = (match: string) => pipe(split(''),tail,equals(match));
const lastMatches = (match: string) => (name:string) => name.endsWith(match);
const isStart = lastMatches('A');
const isEnd = lastMatches('Z');

console.log({isStart:isStart('AAA'), isEnd:isEnd('ZZZ')});
console.log({isStart:isStart('11A'), isEnd:isEnd('11Z')});
console.log({isStart:isStart('12A'), isEnd:isEnd('12Z')});
console.log({isStart:isStart('ZZA'), isEnd:isEnd('AAZ')});
class Node {
    name: string;
    leftName: string;
    rightName: string;
    left?: Node;
    right?: Node;
    start1:boolean;
    end1:boolean;
    start2:boolean;
    end2:boolean;
    constructor(input:string) {
        const [name, leftName, rightName] = nodeNames(input);
        this.name = name;
        this.leftName = leftName;
        this.rightName = rightName;
        this.start1=(name==='AAA');
        this.start2=isStart(name);
        this.end1=(name==='ZZZ');
        this.end2=isEnd(name);
    }
    setLeft(left:Node) {
        this.left = left;
    }
    setRight(right:Node) {
        this.right = right;
    }

    getLeft() {
        return this.left!;
    }
    getRight() {
        return this.right!;
    }
}

type Network = { [name: string]: Node };
let getNetwork =
    pipe(
        last,
        split(/\n/),
        map (
            (line: string) => new Node(line)
        ),
        converge(
            (xin:Network, nodes:Node[]) => {
                const xnew: Network = {};

                nodes.forEach(node => {
                    xnew[node.name] = node;
                    node.setLeft(xin[node.leftName]);
                    node.setRight(xin[node.rightName]);
                });
                // console.log({in:nodes.length, map: Object.keys(xin).length, keys: Object.keys(xin), xnewlen: Object.keys(xnew).length});
                return xnew;
            },
            [ reduce(
                (network: Network, node: Node) => {
                    network[node.name] = node;
                    return network;
                },
                {}
            ),
            identity]
        )
    );

let getMoves : (input:string[]) => string = head;
let moveToEnd = (moves:string, network:Network) => {
    // console.log({moves, network});
    const movesLength = moves.length;
    let index = 0;
    let currentNode = network['AAA'];
    while(!currentNode.end1) {
        if (moves[index % movesLength] === 'L') {
            currentNode = currentNode.getLeft();
        } else {
            currentNode = currentNode.getRight();
        }
        index++;
    }

    return index;
};

let moveToEnd2 = (moves:string, network:Network) => {
    // console.log({ moves, network });
    const movesLength = moves.length;
    let index = 0;
    // let currentNode = filter(prop('start2'))(network);
    let current:Node[] = Object.keys(network)
        .filter(
            (key) => network[key].start2
        )
        .map(k=>network[k]);
    const initial : number[] = [];
    const foundAt = current.reduce((acc,cur) => ([
        ...acc, 0
    ]), initial);
    // console.log({x:'2',current });
    console.log({foundAt});
    const starters = current.map((c)=>c.name);
    while (!current.every(c=>c.end2) && !foundAt.every(n=>n>0)) {
        current.map((node,i)=>({node, i}))
            .filter((c) => c.node.end2)
            .filter((c) => foundAt[c.i] === 0)
            .forEach(c => {
                // console.log({index, foundAt, c, current: current.map((w:Node)=>w.name)});
                // console.log({foundAti: foundAt[c.i]});
                foundAt[c.i] = index;
            });

        const left = (moves[index % movesLength] === "L");
        // console.log({left, index, moves, key:index % movesLength, value: moves[index % movesLength]})

        const newCurrent = current.map((c) => {
            if (left) {
                return c.getLeft();
            } else {
                return c.getRight();
            }
        });
        // console.log({left, old: current.map((w:Node)=>w.name), now: newCurrent.map((w:Node)=>w.name)});
        current = newCurrent;
        index++;
    }
    console.log({starters});
    console.log({foundAt});
    foundAt.forEach((f,i)=>{
        console.log({i, starter: starters[i], f});
    });
    for(let i = foundAt[0]; i < Number.MAX_SAFE_INTEGER - foundAt[0]; i = i + foundAt[0]) {
        if (foundAt.every((f) => i % f === 0 )) {
            console.log({foundAt, i});
            index = i;
            break;
        }
    }
    return index;
};

const part1 = pipe(
    split(/\n\n/),
    converge(moveToEnd,[getMoves,getNetwork])
)

const part2 = pipe(
    split(/\n\n/),
    converge(moveToEnd2,[getMoves,getNetwork])
);

const input11=
`RL

AAA = (BBB, CCC)
BBB = (DDD, EEE)
CCC = (ZZZ, GGG)
DDD = (DDD, DDD)
EEE = (EEE, EEE)
GGG = (GGG, GGG)
ZZZ = (ZZZ, ZZZ)`;
const input12 =
`LLR

AAA = (BBB, BBB)
BBB = (AAA, ZZZ)
ZZZ = (ZZZ, ZZZ)`;
const input21 =
`LR

11A = (11B, XXX)
11B = (XXX, 11Z)
11Z = (11B, XXX)
22A = (22B, XXX)
22B = (22C, 22C)
22C = (22Z, 22Z)
22Z = (22B, 22B)
XXX = (XXX, XXX)`


run({
  part1: {
    tests: [
      {
        input: input11,
        expected: 2,
      },
        {
            input: input12,
            expected: 6,
        },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: input21,
        expected: 6,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
