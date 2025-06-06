import run from "aocrunner";
import {
    assoc,
    converge,
    curry,
    identity,
    lens,
    Lens,
    map,
    match,
    max,
    min,
    pipe,
    prop,
    reduce,
    split,
    view
} from "ramda";

const integerRegex = /-?\d+/g;

const debug = false;
const parseInput = (rawInput: string) => rawInput;

interface Hailstone {
    x: number;
    y: number;
    z: number;
    dx: number;
    dy: number;
    dz: number;
}

const toHailstone = (input: number[]): Hailstone => {
    const [x, y, z, dx, dy, dz] = input;
    return {
        x,
        y,
        z,
        dx,
        dy,
        dz,
    }
};
const lensX = lens<number, number>(prop('x') as () => number, assoc('x'));
const lensY = lens<number, number>(prop('y') as () => number, assoc('y'));
const lensZ = lens<number, number>(prop('z') as () => number, assoc('z'));
// @ts-ignore
const minima: (input: number[]) => number = reduce<number>(min<number>, Infinity);
// @ts-ignore
const maxima: (input: number[]) => number = reduce<number>(max<number>, -Infinity);

const maxFromLens = curry((fn: Lens<number, number>, list: Hailstone[]) => {
    // @ts-ignore
    return maxima(map(view(fn))(list));
});
const minFromLens = curry((fn: Lens<number, number>, list: Hailstone[]) => {
    // @ts-ignore
    return minima(map(view(fn))(list));
});

const getMin = (hailstones: Hailstone[]): number[] => {
    // @ts-ignore
    const result = [minFromLens(lensX)(hailstones), maxFromLens(lensX)(hailstones)];
    if (debug) console.log({result})
    return result;
}

const translateOneToMin = curry((minHailstone: Hailstone, hailstone: Hailstone): Hailstone => {
    return {
        ...hailstone,
        x: hailstone.x - minHailstone.x,
        y: hailstone.y - minHailstone.y,
        z: hailstone.z - minHailstone.z,
    }
}); // replace with ramda negate etc and applySpec ?
const translateToMin = (hailstones: Hailstone[], fn: (a: Hailstone) => Hailstone): Hailstone[] => map(
    fn
)(hailstones);

const findCollision = curry((min:number, max:number, minHailstone: Hailstone, a: Hailstone, b: Hailstone): boolean => {
    // A: y = bAx + cA
    // B: y = bBx + cB
    // A - B
    // x = (cB - cA)/(bA - bB)
    // bA = dyA/dxA
    // bB = dyB/dxB
    // cA = yA + dyA - (dyA/dxA)*(xA + dxA)
    // cB = yB + dyB - (dyB/dxB)*(xB + dxB)

    const minX = min - minHailstone.x;
    const maxX = max - minHailstone.x;
    const minY = min - minHailstone.y;
    const maxY = max - minHailstone.y;
    const minZ = min - minHailstone.z;

    const {x: xA, y: yA, z: zA, dx: dxA, dy: dyA, dz: dzA} = a;
    const {x: xB, y: yB, z: zB, dx: dxB, dy: dyB, dz: dzB} = b;

    const cA = yA + dyA - (dyA / dxA) * (xA + dxA);
    const cB = yB + dyB - (dyB / dxB) * (xB + dxB);
    const bA = dyA / dxA;
    const bB = dyB / dxB;
    if (bA === bB) {
        if (debug) console.log({collision:false, reason: "parallel", cA, cB, bA, bB});
        return false;
    }
    const x = (cB - cA) / (bA - bB);
    const y = bA * x + cA;

    if (x < minX || x > maxX) {
        if (debug) console.log({collision:false, reason: 'x out of range', cA, cB, bA, bB});
        return false
    }

    if (y < minY || y > maxY) {
        if (debug) console.log({collision:false, reason: 'y out of range', cA, cB, bA, bB});
        return false
    }

    if (dxA > 0 && x < xA) {
        if (debug) console.log({collision:false, reason: 'collision in the past +', cA, cB, bA, bB});
        return false
    }

    if (dxA < 0 && x > xA) {
        if (debug) console.log({collision:false, reason: 'collision in the past -', cA, cB, bA, bB});
        return false
    }

    // and just in case dxA is zero ...
    if (dxB > 0 && x < xB) {
        if (debug) console.log({collision:false, reason: 'collision in the past B+', cA, cB, bA, bB});
        return false
    }

    if (dxB < 0 && x > xB) {
        if (debug) console.log({collision:false, reason: 'collision in the past B-', cA, cB, bA, bB});
        return false
    }

    if (debug) console.log({collision: true, cA, cB, bA, bB, x, y});

    return true;
});
const stoneA = toHailstone([19, 13, 30, -2, 1, -2]);
const stoneB = toHailstone([18, 19, 22, -1, -1, -2]);
const stoneC = toHailstone([20, 25, 34, -2, -2, -4]);
const stoneD = toHailstone([12, 31, 28, -1, -2, -1]);
const stoneE = toHailstone([20, 19, 15, 1, -5, -3]);

const stoneF = toHailstone([18, 19, 22, -13, -27, -2]);
const stoneG = toHailstone([20, 25, 34, -26, -54, -4]);

const testFindCollision = findCollision(7, 27, toHailstone([0,0,0,0,0,0]));

console.log("A vs B : inside  : true", testFindCollision(stoneA, stoneB));
console.log("A vs C : inside  : true", testFindCollision(stoneA, stoneC));
console.log("A vs D : outside : false", testFindCollision(stoneA, stoneD));
console.log("A vs E : past  :   false", testFindCollision(stoneA, stoneE));
console.log("B vs C : parallel: false", testFindCollision(stoneB, stoneC));
console.log("F vs G : parallel: false", testFindCollision(stoneF, stoneG));
const translateHailStones: (x: number, y: number, z: number, hailstones: Hailstone[]) => Hailstone[] =
    (x, y, z, hailstones) => {
        const minHailstone: Hailstone = {x, y, z, dx: 0, dy: 0, dz: 0};
        const translateFn: (a: Hailstone) => Hailstone = translateOneToMin(minHailstone);
        const translated: Hailstone[] = map(translateFn)(hailstones);
        return [minHailstone, ...translated];
    }
const part1 = (rawInput: string) => {
    // const config = {min: 7, max: 27};
    const config = {min: 200000000000000, max: 400000000000000};

    // @ts-ignore
    const result = pipe(
        split("\n"),
        map(
            pipe(
                match(integerRegex),
                map(parseInt),
                toHailstone
            )
        ),
        converge(
            translateHailStones,
            [
                minFromLens(lensX),
                minFromLens(lensY),
                minFromLens(lensZ),
                identity
            ]
        ),
        (input: Hailstone[]) => {
            const [minHailstone, ...hailstones] = input;
            const pairs: {a:Hailstone, b:Hailstone}[] = hailstones.map((a: Hailstone, index , self) => {
                const tail = self.slice(index + 1);
                return tail.map((b:Hailstone)=>({a, b}));
            }).flat();
            return {minHailstone, pairs};
        },
        ({minHailstone, pairs}) => {
            const findCollisionFn = findCollision(config.min, config.max, minHailstone);
            return pairs.filter(({a, b}) => findCollisionFn(a, b)).length;
        }
    )(rawInput);
    // result.forEach((hailstone:Hailstone)=>console.log(hailstone.toString()));
    console.log(JSON.stringify({result}, null, 2));
    return result;
};

const part2 = (rawInput: string) => {
    const input = parseInput(rawInput);

    return;
};
const testA = {
        input: `19, 13, 30 @ -2,  1, -2
18, 19, 22 @ -1, -1, -2
20, 25, 34 @ -2, -2, -4
12, 31, 28 @ -1, -2, -1
20, 19, 15 @  1, -5, -3`,
        expected: 2,
    };
run({
    part1: {
        tests: [

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

