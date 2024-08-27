import * as crypto from 'crypto';
import seedrandom from 'seedrandom';

export class Game {
    private rng: seedrandom.prng;
    private seed: string;

    constructor(seed?: string) {
        // Generate a random seed if none is provided
        this.seed = seed || this.generateRandomSeed();
        this.rng = seedrandom(this.seed);
    }

    getRng(): number {
        return this.rng();
    }

    private generateRandomSeed(): string {
        // Generate a random 16-byte hexadecimal seed
        return crypto.randomBytes(16).toString('hex');
    }

    getSeed(): string {
        return this.seed;
    }
}