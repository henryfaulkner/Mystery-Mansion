import { Furniture } from "./furniture";

/**
 * A single room.
 */
export class Room {
    name: string;
    code: number;
    furniture: number[]; 
    locked: boolean;
    filename: string;

    constructor(name: string, initialFurniture: number[]) {
        this.name = name;
        this.code = -1;
        this.furniture = initialFurniture;
        this.locked = false;
        this.filename = `rooms/${name.toLowerCase()}`;
    }

    toString(): string {
        const contains = this.furniture.join(', ');
        const lockedString = this.locked ? ' [LOCKED]' : '';

        return `${this.code.toString().padStart(2, ' ')}: ${this.name} - Contains: ${contains}${lockedString}`;
    }

    toJSON(): string {
        return `${this.code.toString().padStart(2, ' ')}: ${this.name}`;
    }

    containsFurniture(furnitureNumber: number): boolean {
        // Assuming furniture number is represented as a string for simplicity
        return this.furniture.includes(furnitureNumber);
    }
}
