import run from "aocrunner";
class File {
  constructor(public size: number) {}
}
class Dir {
  public files: File[] = [];
  public dirs: Record<string, Dir> = {};

  constructor(public parent?: Dir) {}
  public addDir = (name: string) => {
    const sub = new Dir(this);
    this.dirs[name] = sub;
    return sub;
  };
  public addFile = (size: number) => {
    this.files.push(new File(size));
  };

  public getSize = () => {
    let total: number = Object.keys(this.dirs).reduce(
      (p, c) => p + this.dirs[c].getSize(),
      0,
    );
    total = this.files.reduce((p, c) => p + c.size, total);
    return total;
  };
  public getDirList = (): Dir[] => {
    return Object.keys(this.dirs)
      .map((key) => [this.dirs[key], ...this.dirs[key].getDirList()])
      .flat();
  };
}

let dir: Dir = new Dir();
let current = dir;
const parseInput = (rawInput: string) => {
  dir = new Dir();
  current = dir;
  rawInput
    .replace(/\r\n/g, "\n")
    .split(/\n/g)
    .forEach((line) => parseLine(line));
};
const parseLine = (line: string) => {
  if (line === "$ cd /") {
    current = dir;
    return;
  }
  if (line === "$ ls") {
    return;
  }
  const parts = line.split(" ");
  if (parts[0] === "$") {
    if (parts[1] === "cd") {
      if (parts[2] === "..") {
        current = current.parent!;
        return;
      }
      current = current.dirs[parts[2]];
      return;
    }
  }

  if (parts[0] === "dir") {
    current.addDir(parts[1]);
    return;
  }
  const size = Number(parts[0]);
  current.addFile(size);
  return;
};
const part1 = (rawInput: string) => {
  parseInput(rawInput);
  const max = 100000;
  console.log(dir.getSize());

  const allDirs = [dir, ...dir.getDirList()];

  return allDirs
    .map((d) => d.getSize())
    .filter((d) => d < max)
    .reduce((p, c) => p + c, 0);
};

const part2 = (rawInput: string) => {
  parseInput(rawInput);
  // The total disk space available to the filesystem is 70000000.
  // To run the update, you need unused space of at least 30000000.
  // You need to find a directory you can delete that will free up enough space to run the update.

  // In the example above, the total size of the outermost directory (and thus the total amount of used space) is 48381165;
  //  this means that the size of the unused space must currently be 21618835, which isn't quite the 30000000 required by the update.
  // Therefore, the update still requires a directory with total size of at least 8381165 to be deleted before it can run.

  const totalDiskSpace = 70000000;
  const freeSpaceRequired = 30000000;
  const used = dir.getSize();
  const unused = totalDiskSpace - used;
  const extraNeeded = freeSpaceRequired - unused;
  console.log(
    "dirs ",
    [dir, ...dir.getDirList()]
      .map((d) => d.getSize())
      .filter((d) => d >= extraNeeded)
      .sort(),
  );
  return [dir, ...dir.getDirList()]
    .map((d) => d.getSize())
    .filter((d) => d >= extraNeeded)
    .sort((a, b) => a - b)[0];
};

const testInput = `
$ cd /
$ ls
dir a
14848514 b.txt
8504156 c.dat
dir d
$ cd a
$ ls
dir e
29116 f
2557 g
62596 h.lst
$ cd e
$ ls
584 i
$ cd ..
$ cd ..
$ cd d
$ ls
4060174 j
8033020 d.log
5626152 d.ext
7214296 k
`;
run({
  part1: {
    tests: [
      {
        input: testInput,
        expected: 95437,
      },
    ],
    solution: part1,
  },
  part2: {
    tests: [
      {
        input: testInput,
        expected: 24933642,
      },
    ],
    solution: part2,
  },
  trimTestInputs: true,
  // onlyTests: true,
});
