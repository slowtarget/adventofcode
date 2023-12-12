import run from "aocrunner";
import {flatten, map, pipe, sort, split } from "ramda";

const parseInput = (rawInput: string) => rawInput;

class Point {
    constructor(private x: number, private y: number) {

    }
    public getX = ():number => this.x;
    public getY = ():number => this.y;
}
class Galaxy {
  private point: Point;
  constructor(x: number, y: number) {
    this.point = new Point(x,y);
  }
  public getPoint = ():Point => this.point;

}

let mapToPoints = pipe(
    split("\n"),
    map(split("")),
    (input: string[][])=>input.map((row:string[],y:number)=>row.map((value:string,x:number)=>({x,y,value}))
        .filter((cell)=> cell.value==='#')),
    flatten,
    map((input:{x:number, y:number, value:string})=>new Galaxy(input.x, input.y))
);
const sortX = (a: Galaxy, b: Galaxy) => a.getPoint().getX() - b.getPoint().getX();
const sortY = (a: Galaxy, b: Galaxy) => a.getPoint().getY() - b.getPoint().getY();

let expandX = (galaxy: Galaxy[]) => {
    let growth = 0;
    let position = 0;
    let expandX: Galaxy[] = pipe(
        sort(sortX),
        map((galaxy: Galaxy)=>{
            if(galaxy.getPoint().getX() === position) {
              // another on the same row - no growth
              return new Galaxy(galaxy.getPoint().getX() + growth, galaxy.getPoint().getY());
            }
            // we have growth
            const diff = galaxy.getPoint().getX() - position;
            if (diff ===1 ) {
              // no empty space = no expansion
              position = galaxy.getPoint().getX();
              return new Galaxy(galaxy.getPoint().getX() + growth, galaxy.getPoint().getY());
            }
            // we have a gap
            // let us expand!
            position = galaxy.getPoint().getX();
            growth = growth + diff - 1;
            return new Galaxy(galaxy.getPoint().getX() + growth, galaxy.getPoint().getY());
        }),
    )(galaxy)
};
let expandY = (galaxy: Galaxy[]) => {
  let growth = 0;
  let position = 0;
  let expandX: Galaxy[] = pipe(
      sort(sortY),
      map((galaxy: Galaxy)=>{
        if(galaxy.getPoint().getX() === position) {
          // another on the same row - no growth
          return new Galaxy(galaxy.getPoint().getX() + growth, galaxy.getPoint().getY());
        }
        // we have growth
        const diff = galaxy.getPoint().getX() - position;
        if (diff ===1 ) {
          // no empty space = no expansion
          position = galaxy.getPoint().getX();
          return new Galaxy(galaxy.getPoint().getX() + growth, galaxy.getPoint().getY());
        }
        // we have a gap
        // let us expand!
        position = galaxy.getPoint().getX();
        growth = growth + diff - 1;
        return new Galaxy(galaxy.getPoint().getX() + growth, galaxy.getPoint().getY());
      }),
  )(galaxy)
};

const part1 = pipe(
    mapToPoints,
    expandX,
)

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return;
};

run({
  part1: {
    tests: [
      // {
      //   input: ``,
      //   expected: "",
      // },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      // {
      //   input: ``,
      //   expected: "",
      // },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
