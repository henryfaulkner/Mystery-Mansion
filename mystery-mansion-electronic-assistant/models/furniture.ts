import { Note } from "./note";

/**
 * A single piece of furniture.
 */
export class Furniture {
    name: string;
    code: number;
    note: Note | null;
    filename: string;

    constructor(name: string) {
        this.name = name;
        this.code = -1;
        this.note = null;

        this.filename = `furniture/${name.toLowerCase()}`;
        if (name.includes('#')) {
            this.filename = this.filename.substring(0, name.indexOf('#') - 1);
        }
    }

    toString(): string {
        return `${this.code.toString().padStart(3, ' ')}: ${this.name}`;
    }

    toJSON(): string {
        return this.toString();
    }
}
