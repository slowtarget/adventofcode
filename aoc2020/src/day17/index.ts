import run from "aocrunner";
import * as Logger from "bunyan";

var log = Logger.createLogger({ name: "2021 day4", level: "warn" });

const debug = false;

const neighbours = [-1,0,1];
const adjacent:({dx:number, dy:number, dz:number})[] = neighbours.map(dx=>neighbours.map(dy=>neighbours.map(dz=>({dx,dy,dz}))))
        .flatMap(a=>a)
        .flatMap(a=>a)
        .filter(a=>(a.dx|a.dy|a.dz));

const adjacent4:({dx:number, dy:number, dz:number, dw:number})[] = neighbours
        .map(dx=>neighbours
            .map(dy=>neighbours
                .map(dz=>neighbours
                    .map(dw=>({dx,dy,dz,dw})))))
        .flatMap(a=>a)
        .flatMap(a=>a)
        .flatMap(a=>a)
        .filter(a=>(a.dx|a.dy|a.dz|a.dw));

        class Puzzle {
          public state:State;
          constructor(
              public dimension:string[]
          ) {
              var points = dimension.map((row,y)=>row.split('')
                  .map((cell,x)=>({cell,x}))
                      .filter(a=>a.cell!='.')
                      .map(a=>new Point(a.x,y,0,0)))
                      .flatMap(a=>a);
              this.state = new State(points);
          }
          public clone() {
              var puzzle = new Puzzle([""]);
              puzzle.state = this.state.clone();
              return puzzle;
          }
          public toString():string {
              var [minX, maxX, minY, maxY, minZ, maxZ] = [
                  Math.min(0,...this.state.points.map(p=>p.x)),
                  Math.max(...this.state.points.map(p=>p.x)),
                  Math.min(0,...this.state.points.map(p=>p.y)),
                  Math.max(...this.state.points.map(p=>p.y)),
                  Math.min(...this.state.points.map(p=>p.z)),
                  Math.max(...this.state.points.map(p=>p.z))];
              
              var result = "\n" + [minX, maxX, minY, maxY, minZ, maxZ].toString() + "\n";
      
              for (var z = minZ; z<=maxZ; z++) {
                  result += `z=${z}\n`;
                  for (var y = minY; y<=maxY; y++) {
                      for (var x = minX; x<=maxX; x++) {
                          if (this.state.pointMap[(new Point(x,y,z,0)).toString()]){
                              result += "#";
                          } else {
                              result += ".";
                          }
                      }
                      result+="\n";
                  }
                  result+="\n";
              }
              return result;
          }
      }
      type Points = {[point:string]:boolean};
      class State {
          public pointMap:Points;
          constructor(
              public points:Point[]
          ){
              this.pointMap = this.points.reduce((p,c)=>({...p, [c.toString()]:true}),{});
          }
          public clone() {
              return new State(this.points.map(p=>p.clone()));
          }
      }
      
      class Point {
          constructor (
              public x:number, 
              public y:number,
              public z:number,
              public w:number) {}
      
          public toString():string {
              return `(${this.x},${this.y},${this.z},${this.w})`
          }
          public clone() {
              return new Point(this.x, this.y, this.z, this.w);
          }
      }
          

const parseInput = (rawInput: string) => {
  return rawInput
    .replace(/\r\n/g, '\n')
    .split(/\n/g);
}


const part1 = (rawInput: string) => {
  const inputPuzzle = new Puzzle(parseInput(rawInput));
  var puzzle = inputPuzzle.clone();
  for (var step =0; step < 6; step ++) {
      var next = puzzle.state.clone();
      log.debug(step, puzzle.toString());
      // If a cube is active and exactly 2 or 3 of its neighbors are also active, the cube remains active. Otherwise, the cube becomes inactive.
      var inactiveChecked:{[p:string]:{point:Point,checked:number}} = {}
      next.points=puzzle.state.points.filter(a => {
          const neighbouring = adjacent.map(neighbour => new Point(a.x + neighbour.dx, a.y + neighbour.dy, a.z + neighbour.dz,0));
          var active = 0;
          neighbouring.forEach(n=>{
              const ns = n.toString();
              if (puzzle.state.pointMap[ns]) {
                  active++;
              } else {
                  if (inactiveChecked[ns]) {
                      inactiveChecked[ns].checked++;
                  } else {
                      inactiveChecked[ns]={point:n, checked:1};
                  }
              }
          });
          return [2,3].includes(active);
      });
// If a cube is inactive but exactly 3 of its neighbors are active, the cube becomes active. Otherwise, the cube remains inactive.
      next.points = [...next.points, ...Object.values(inactiveChecked).filter(a=>a.checked===3).map(a=>a.point)];
      puzzle.state = next.clone();
  }
  console.log(`part1: ${puzzle.state.points.length}`);
  return puzzle.state.points.length;
  //207 
};

const part2 = (rawInput: string) => {
  const inputPuzzle = new Puzzle(parseInput(rawInput));
  var puzzle = inputPuzzle.clone();
      
  for (var step =0; step < 6; step ++) {
      var next = puzzle.state.clone();
      console.log(`step: ${step} cells:${puzzle.state.points.length}`)
      // console.log(step, puzzle.toString());
// If a cube is active and exactly 2 or 3 of its neighbors are also active, the cube remains active. Otherwise, the cube becomes inactive.
      var inactiveChecked:{[p:string]:{point:Point,checked:number}} = {}
      next.points=puzzle.state.points.filter(a => {
          const neighbouring = adjacent4.map(neighbour => new Point(
              a.x + neighbour.dx, 
              a.y + neighbour.dy, 
              a.z + neighbour.dz,
              a.w + neighbour.dw));
          var active = 0;
          neighbouring.forEach(n=>{
              const ns = n.toString();
              if (puzzle.state.pointMap[ns]) {
                  active++;
              } else {
                  if (inactiveChecked[ns]) {
                      inactiveChecked[ns].checked++;
                  } else {
                      inactiveChecked[ns]={point:n, checked:1};
                  }
              }
          });
          return [2,3].includes(active);
      });
// If a cube is inactive but exactly 3 of its neighbors are active, the cube becomes active. Otherwise, the cube remains inactive.
      next.points = [...next.points, ...Object.values(inactiveChecked).filter(a=>a.checked===3).map(a=>a.point)];
      puzzle.state = next.clone();
  }
  return puzzle.state.points.length;
  // 10071 is too high
};

const testInput = `
.#.
..#
###`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 112,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 848,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  onlyTests: false,
});
