export interface Draw {
    [colour: string]: number;
}
export class Game {
    id: number;
    draws: Draw[];
    max: Draw;
    input: string;
    constructor(input: string) {
        this.input = input;
        const parts = input.split(": ");
        this.id = Number.parseInt(parts[0].split(" ")[1]);

        this.draws = parts[1].split("; ")
            .map(draw => draw.split(", ")
                .map(balls=> {
                    const ballParts = balls.split(" ");
                    return {colour: ballParts[1], qty: Number.parseInt(ballParts[0])};
                })
                .reduce((acc, curr) => {
                    acc[curr.colour] = curr.qty;
                    return acc;
                }, {} as Draw));

        this.max = this.draws.reduce((acc, curr) => {
            Object.keys(curr).forEach((key) => {
                if (acc[key] === undefined || acc[key] < curr[key]) {
                    acc[key] = curr[key];
                }
            });
            return acc;
        }, {} as Draw);
    }
    isPossible(test: Draw) {
        return Object.keys(test).every((key) => {
            return this.max[key] <= test[key];
        });
    }

    power() {
        return Object.values(this.max).reduce((acc, curr) => acc * curr, 1);
    }
}