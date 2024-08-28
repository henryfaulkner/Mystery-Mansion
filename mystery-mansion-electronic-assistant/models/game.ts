import * as crypto from 'crypto';
import seedrandom from 'seedrandom';
import { ItemOrPerson } from './item-or-person';
import { Furniture } from './furniture';
import { Room } from './room';
import { Note } from './note';
import { shuffle } from '../lib/shuffle';
import { sample } from '../lib/sample';
import { randomChoice } from '../lib/random-choice';

export class Game {
    private rng: seedrandom.prng;
    private seed: string;

    items: ItemOrPerson[];
    people: ItemOrPerson[];
    furniture: { [key: number]: Furniture };
    rooms: { [key: number]: Room};

    constructor(seed?: string) {
        // Generate a random seed if none is provided
        this.seed = seed || this.generateRandomSeed();
        this.rng = seedrandom(this.seed);
    }

    getSeed(): string {
        return this.seed;
    }

    getRng(): number {
        return this.rng();
    }

    private generateRandomSeed(): string {
        // Generate a random 16-byte hexadecimal seed
        return crypto.randomBytes(16).toString('hex');
    }

    // create physical cards
    buildItems() {
        this.items = [
            new ItemOrPerson("Tape"),
            new ItemOrPerson("Letter"),
            new ItemOrPerson("Photos"),
            new ItemOrPerson("Map"),
        ];
        this.people = [
            new ItemOrPerson("Cook"),
            new ItemOrPerson("Chauffeur"),
            new ItemOrPerson("Maid"),
            new ItemOrPerson("Butler"),
        ];
    }

    // Create the furniture
    buildFurniture(): void {
        const furniture: { [key: number]: Furniture } = {
            111: new Furniture("Dining Room Chair #1 [111]"),
            112: new Furniture("Dining Room Chair #2 [112]"),
            113: new Furniture("Dining Room Table"),
            114: new Furniture("China Cabinet"),
            121: new Furniture("Sofa"),
            122: new Furniture("Coffee Table"),
            123: new Furniture("Bed"),
            124: new Furniture("Dresser"),
            131: new Furniture("Small Bookcase"),
            132: new Furniture("Refrigerator"),
            133: new Furniture("Sink"),
            134: new Furniture("Oven"),
            141: new Furniture("Kitchen Table"),
            142: new Furniture("Pool Table"),
            143: new Furniture("Pinball Machines"),
            144: new Furniture("Large Bookcase"),
            211: new Furniture("Whirlpool"),
            212: new Furniture("Treadmill"),
            213: new Furniture("Piano"),
            214: new Furniture("Telescope"),
            221: new Furniture("Clock"),
            222: new Furniture("Computer"),
            223: new Furniture("Juke Box"),
            224: new Furniture("Rug"),
            231: new Furniture("Fireplace"),
            232: new Furniture("Knight"),
            233: new Furniture("Television"),
            234: new Furniture("Fish Tank"),
            241: new Furniture("Lamp"),
            242: new Furniture("Planter"),
            243: new Furniture("Easel"),
            244: new Furniture("Black Armchair #1 [244]"),
            311: new Furniture("Black Armchair #2 [311]"),
            312: new Furniture("White Armchair #1 [312]"),
            313: new Furniture("White Armchair #2 [313]"),
        };

        // Set the code property for each furniture item
        for (const [key, item] of Object.entries(furniture)) {
            item.code = Number(key);
        }

        // Assign the furniture to the instance property
        this.furniture = furniture;
    }

    // Create and add notes to the furniture.
    // This is the step that hides the money and clues.
    buildNotes(): void {
        const furnitureToUse = Object.values(this.furniture);
        shuffle(furnitureToUse);

        // Hide the money
        const moneyFurniture = furnitureToUse.pop()!;
        const moneyRoom = this.findFurniture(moneyFurniture.code);
        const moneyNote = new Note();
        moneyNote.money = true;
        moneyNote.ask = true;
        moneyNote.item = randomChoice<ItemOrPerson>(this.items);
        moneyNote.person = randomChoice<ItemOrPerson>(this.people);
        moneyFurniture.note = moneyNote;

        const nonMoneyFurniture = [...furnitureToUse];
        nonMoneyFurniture.splice(nonMoneyFurniture.indexOf(moneyFurniture), 1);

        const nonMoneyRooms = Object.values(this.rooms).filter(room => room !== moneyRoom);

        // Generate 11 "You found a clue!" notes
        const clueFurniture: Furniture[] = [];
        for (let i = 0; i < 11; i++) {
            const note = new Note();
            note.clue = 2; // Furniture starts with 2 clues
            const furniture = furnitureToUse.pop()!;
            furniture.note = note;
            clueFurniture.push(furniture);
        }

        // Trapdoor
        const trapdoorNote = new Note();
        trapdoorNote.trapdoor = true;
        furnitureToUse.pop()!.note = trapdoorNote;

        // Secret, 1-item, non-room clues
        for (let i = 0; i < 2; i++) {
            const note = new Note();
            note.ask = true;
            if (Math.random() < 0.5) {
                note.item = randomChoice<ItemOrPerson>(this.items);
                note.person = undefined;
            } else {
                note.item = undefined;
                note.person = randomChoice<ItemOrPerson>(this.people);
            }
            note.secret = `The money is not in the ${randomChoice<Room>(nonMoneyRooms).name}.`;
            furnitureToUse.pop()!.note = note;
        }

        // 2-item, normal clue
        for (let i = 0; i < 1; i++) {
            const note = new Note();
            note.ask = true;
            note.item = randomChoice<ItemOrPerson>(this.items);
            note.person = randomChoice<ItemOrPerson>(this.people);
            note.clue = 2;
            furnitureToUse.pop()!.note = note;
        }

        // Not in furniture
        for (let i = 0; i < 6; i++) {
            const note = new Note();
            note.notIn = randomChoice<Furniture>(nonMoneyFurniture);
            furnitureToUse.pop()!.note = note;
        }

        // Look in furniture for clue
        for (let i = 0; i < 4; i++) {
            const note = new Note();
            note.lookIn = randomChoice<Furniture>(clueFurniture);
            furnitureToUse.pop()!.note = note;
        }
    }

    private findFurniture(furnitureNumber: number) {
        for (const [key, room] of Object.entries(this.rooms)) {
            if (room.containsFurniture(furnitureNumber)) {
                return room;
            }
        }
    }

    buildRooms(): void {
        const roomNames = [
            new Room("Living Room", [121, 122]),  // Sofa, Coffee Table
            new Room("Bed Room", [123, 124]),    // Bed, Dresser
            new Room("Kitchen", [132, 133, 134, 141]),  // Refrigerator, Sink, Oven, Kitchen Table
            new Room("Music Room", [213]),        // Piano
            new Room("Game Room", [142, 143]),    // Pool Table, Pinball Machines
            new Room("Study", [131]),             // Small Bookcase
            new Room("Library", [144]),           // Large Bookcase
            new Room("Dining Room", [111, 112, 113]),    // (2) Dining Room Chairs, Dining Room Table
            new Room("Gym", [211, 212])           // Whirlpool, Treadmill
        ];

        const roomNumbers = [11, 12, 13, 14, 21, 22, 23, 24, 31];
        shuffle(roomNames);

        const rooms = Object.fromEntries(
            roomNumbers.map((num, index) => [num, roomNames[index]])
        );

        for (const num of roomNumbers) {
            rooms[num].code = num;
        }

        this.rooms = rooms;
    }

    lockRooms(): void {
        const roomNumbers = Object.keys(this.rooms).map(Number);
        const firstRoomNumber = 11;
        const filteredRoomNumbers = roomNumbers.filter(num => num !== firstRoomNumber);

        const numRoomsToLock = Math.floor(this.rng() * 2) + 1; // Randomly 1 or 2 rooms
        const roomNumbersToLock = sample(filteredRoomNumbers, numRoomsToLock);

        for (const num of roomNumbersToLock) {
            this.rooms[num].locked = true;
        }
    }

    furnishRoomsRandom(): void {
        const furnitureToUse = Object.keys(this.furniture).map(Number);
        shuffle(furnitureToUse);

        const roomsToUse = Object.values(this.rooms);
        shuffle(roomsToUse);

        // 8 rooms get 4 pieces, 1 room gets 3 pieces
        let start = 0;
        for (const room of roomsToUse) {
            room.furniture = furnitureToUse.slice(start, start + 4);
            start += 4;
        }
    }

    furnishRoomsSmart(): void {
        const furnitureToUse = Object.keys(this.furniture).map(Number);
        const roomsToUse = Object.values(this.rooms);

        // Remove the used furniture
        for (const room of roomsToUse) {
            for (const furniture of room.furniture) {
                const index = furnitureToUse.indexOf(furniture);
                if (index !== -1) {
                    furnitureToUse.splice(index, 1); // Remove used furniture
                }
            }
        }

        shuffle(furnitureToUse);
        shuffle(roomsToUse);

        // Assign the remaining furniture
        while (furnitureToUse.length > 0) {
            for (const room of roomsToUse) {
                if (room.furniture.length < 4 && furnitureToUse.length > 0) {
                    room.furniture.push(furnitureToUse.pop()!);
                }
            }
        }
    }

    

    

    

}