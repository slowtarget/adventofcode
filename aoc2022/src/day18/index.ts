import run from "aocrunner";


// type DirKey = "^" | ">" | "<" | "v" | ".";
type DirKey = "N" | "E" | "W" | "S" | "F" | "B";
interface DirRecord {
  key: DirKey;
  dx: number;
  dy: number;
  dz: number;
}

const directions: Record<DirKey, DirRecord> = {
  "N": { key: "N", dx: 0,  dy: -1  , dz: 0},
  "S": { key: "S", dx: 0,  dy: 1   , dz: 0},
  "W": { key: "W", dx: -1, dy: 0   , dz: 0},
  "E": { key: "E", dx: 1,  dy: 0   , dz: 0},
  "F": { key: "F", dx: 0,  dy: 0   , dz: 1 },
  "B": { key: "B", dx: 0,  dy: 0   , dz: -1},
};

const dirKeys = Object.keys(directions).map(key => key as DirKey);

class Point{
  public visited: boolean = false;
  constructor(
    public x: number,
    public y: number,
    public z: number
  ) {
    
  }
  hash(){
    return Point.getHash(this.x, this.y, this.z)
  }
  static getHash(x: number, y: number, z: number) {
    return x * 10000 + y * 100 + z;
  }
}

class Droplet{
  public layout: Record<number, Point> = {};
  public steam: Record<number, Point> = {};
  constructor(
    public points: Point[]
  ) {
    points.forEach(p => this.layout[p.hash()] = p);
  }

  joined() {
    let count = 0;
    this.points.forEach(p => {
      dirKeys.map(key => directions[key]).forEach(dir => {
        const hash = Point.getHash(p.x + dir.dx, p.y + dir.dy, p.z + dir.dz);
        if (this.layout[hash]) {
          count ++;
        }
      })
    });
    return count;
  }

  steaming() {

    const minX = Math.min(...this.points.map(p => p.x)) - 2;
    const maxX = Math.max(...this.points.map(p => p.x)) + 2;
    const minY = Math.min(...this.points.map(p => p.y)) - 2;
    const maxY = Math.max(...this.points.map(p => p.y)) + 2;
    const minZ = Math.min(...this.points.map(p => p.z)) - 2;
    const maxZ = Math.max(...this.points.map(p => p.z)) + 2;


    for (let x = minX; x <= maxX; x ++) {
      const planeX = this.points.filter(p => p.x === x);
      if (planeX.length) {
        for (let y = minY; y <= maxY; y ++) {
          const lineY = planeX.filter(p => p.y === y);
          if (lineY.length) {
            const pMinZ = Math.min(...lineY.map(p => p.z)) ;
            const pMaxZ = Math.max(...lineY.map(p => p.z)) ;
            for (let z = minZ; z < pMinZ; z ++) {
              const hash = Point.getHash(x, y, z);
  
              if (!this.layout[hash] && !this.steam[hash]) {
                this.steam[hash] = new Point(x, y, z);
              }
            }
            for (let z = pMaxZ; z <= maxZ; z ++) {
              const hash = Point.getHash(x, y, z);
  
              if (!this.layout[hash] && !this.steam[hash]) {
                this.steam[hash] = new Point(x, y, z);
              }
            }
          }
        }

        for (let z = minZ; z <= maxZ; z ++) {
          const lineZ = planeX.filter(p => p.z === z);
          if (lineZ.length) {

            const pMinY = Math.min(...lineZ.map(p => p.y)) ;
            const pMaxY = Math.max(...lineZ.map(p => p.y)) ;
            for (let y = minY; y < pMinY; y ++) {
              const hash = Point.getHash(x, y, z);
  
              if (!this.layout[hash] && !this.steam[hash]) {
                this.steam[hash] = new Point(x, y, z);
              }
            }
            for (let y = pMaxY; y <= maxY; y ++) {
              const hash = Point.getHash(x, y, z);
  
              if (!this.layout[hash] && !this.steam[hash]) {
                this.steam[hash] = new Point(x, y, z);
              }
            }
          }
        }
      }
    }

    for (let z = minZ; z <= maxZ; z ++) {
      const planeZ = this.points.filter(p => p.z === z);
      if (planeZ.length) {

        for (let y = minY; y <= maxY; y ++) {
          const lineY = planeZ.filter(p => p.y === y);
          if (lineY.length) {
            const pMinX = Math.min(...lineY.map(p => p.x)) ;
            const pMaxX = Math.max(...lineY.map(p => p.x)) ;
            for (let x = minX; x < pMinX; x ++) {
              const hash = Point.getHash(x, y, z);
    
              if (!this.layout[hash] && !this.steam[hash]) {
                this.steam[hash] = new Point(x, y, z);
              }
            }
            for (let x = pMaxX; x <= maxX; x ++) {
              const hash = Point.getHash(x, y, z);
    
              if (!this.layout[hash] && !this.steam[hash]) {
                this.steam[hash] = new Point(x, y, z);
              }
            }

          }
        }
  
        for (let x = minX; x <= maxX; x ++) {
          const lineX = planeZ.filter(p => p.x === x);
          if (lineX.length) {
            const pMinY = Math.min(...lineX.map(p => p.y)) ;
            const pMaxY = Math.max(...lineX.map(p => p.y)) ;
            for (let y = minY; y < pMinY; y ++) {
              const hash = Point.getHash(x, y, z);
    
              if (!this.layout[hash] && !this.steam[hash]) {
                this.steam[hash] = new Point(x, y, z);
              }
            }
            for (let y = pMaxY; y <= maxY; y ++) {
              const hash = Point.getHash(x, y, z);
    
              if (!this.layout[hash] && !this.steam[hash]) {
                this.steam[hash] = new Point(x, y, z);
              }
            }

          }
        }
      }
    }

    let added = true;
    while (added) {
      added = false;
      Object.values(this.steam)
      .filter(p => !p.visited)
      .forEach(p => {
        p.visited = true;
        dirKeys
        .map(key => directions[key])
        .map(dir => ({x: p.x + dir.dx, y: p.y + dir.dy, z: p.z + dir.dz}))
        .filter(({x}) => x > minX && x < maxX)
        .filter(({y}) => y > minY && y < maxY)
        .filter(({z}) => z > minZ && z < maxZ)
        .forEach(({x, y, z}) => {
          const hash = Point.getHash(x, y, z);
  
          if (!this.layout[hash] && !this.steam[hash]) {
            this.steam[hash] = new Point(x, y, z);
            added = true;
          }
        })
      })
    }


  }
  
  steamy() {
    let count = 0;
    this.points.forEach(p => {
      dirKeys.map(key => directions[key]).forEach(dir => {
        const hash = Point.getHash(p.x + dir.dx, p.y + dir.dy, p.z + dir.dz);
        if (this.steam[hash]) {
          count ++;
        }
      })
    });
    return count;
  }
}

const parseInput = (rawInput: string) => {
  const coords = rawInput.replace(/\r\n/g, "\n").split(/\n/g).map(line => {
    const [x,y,z] = line.split(/,/g).map(Number)
    return new Point(x, y, z);
  })
  return new Droplet(coords);
};

const part1 = (rawInput: string) => {
  const droplet = parseInput(rawInput);
  return (droplet.points.length * 6) - droplet.joined();
};

const part2 = (rawInput: string) => {
  const droplet = parseInput(rawInput);
  droplet.steaming();

  return droplet.steamy();
};

const testInput = `
2,2,2
1,2,2
3,2,2
2,1,2
2,3,2
2,2,1
2,2,3
2,2,4
2,2,6
1,2,5
3,2,5
2,1,5
2,3,5
`;
run({
  part1: {
    tests: [
      {
        input: `
1,1,1
2,1,1`,
        expected: 10,
      },
      {
        input: testInput,
        expected: 64,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 58,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  // onlyTests: true,
});
