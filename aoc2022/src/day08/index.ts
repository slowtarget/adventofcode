import run from "aocrunner";

type Dir = { name: string; dx: number; dy: number };

const neighbours: Dir[] = [
  { name: "up", dx: 0, dy: -1 },
  { name: "down", dx: 0, dy: 1 },
  { name: "left", dx: -1, dy: 0 },
  { name: "right", dx: 1, dy: 0 },
];
class Tree {
  public neighbours: Record<string, Tree> = {};
  public visible?: boolean;
  constructor(public x: number, public y: number, public h: number) {}
}
class Forest {
  public grid: Tree[][] = [];
  public add(tree: Tree) {
    this.grid[tree.y] = this.grid[tree.y] || [];
    this.grid[tree.y][tree.x] = tree;
  }
  public setNeighbours = () => {
    this.grid.forEach((row) =>
      row.forEach((tree) => {
        neighbours.forEach((dir) => {
          const x = tree.x + dir.dx;
          const y = tree.y + dir.dy;
          if (
            x > -1 &&
            y > -1 &&
            y < this.grid.length &&
            x < this.grid[y].length
          ) {
            tree.neighbours[dir.name] = this.grid[y][x];
          }
        });
      }),
    );
  };
  public setVisible = () => {
    this.grid.forEach((row) => {
      let max = -1;
      let next = row[0];
      while (next) {
        if (next.h > max) {
          next.visible = true;
          max = next.h;
        }
        next = next.neighbours.right;
      }
      max = -1;
      next = row[row.length - 1];
      while (next) {
        if (next.h > max) {
          next.visible = true;
          max = next.h;
        }
        next = next.neighbours.left;
      }
    });
    this.grid[0].forEach((tree, col) => {
      let max = -1;
      let next = this.grid[0][col];
      while (next) {
        if (next.h > max) {
          next.visible = true;
          max = next.h;
        }
        next = next.neighbours.down;
      }
      max = -1;
      next = this.grid[this.grid.length - 1][col];
      while (next) {
        if (next.h > max) {
          next.visible = true;
          max = next.h;
        }
        next = next.neighbours.up;
      }
    });
  };
  public countVisible = () => {
    return this.grid.reduce(
      (p, c) => p + c.reduce((p, c) => p + (c.visible ? 1 : 0), 0),
      0,
    );
  };
  public topScenic = () => {
    return this.grid.reduce(
      (best, row) =>
        Math.max(
          best,
          row.reduce((best, tree) => {
            return Math.max(best, this.getScenicScore(tree));
          }, 0),
        ),
      0,
    );
  };

  private getScenicScore(tree: Tree): number {
    return neighbours.reduce((total, dir) => {
      let sum = 0;
      let max = -1;
      let next = tree.neighbours[dir.name];
      while (next && max < tree.h) {
        sum++;
        if (next.h > max) {
          max = next.h;
        }
        next = next.neighbours[dir.name];
      }
      return total * sum;
    }, 1);
  }
}
const parseInput = (rawInput: string) => {
  const input = rawInput
    .replace(/\r\n/g, "\n")
    .split(/\n/g)
    .map((s) => s.split("").map(Number));
  const forest = new Forest();
  input.forEach((row: number[], y: number) => {
    row.forEach((height: number, x: number) => {
      forest.add(new Tree(x, y, height));
    });
  });
  forest.setNeighbours();
  forest.setVisible();
  return forest;
};

const part1 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return input.countVisible();
};

const part2 = (rawInput: string) => {
  const input = parseInput(rawInput);

  return input.topScenic();
};

const testInput = `
30373
25512
65332
33549
35390
`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 21,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 8,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  // onlyTests: true,
});
