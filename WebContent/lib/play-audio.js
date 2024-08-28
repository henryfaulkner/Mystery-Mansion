"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.playAudio = playAudio;
const path_1 = __importDefault(require("path"));
const fs = require('fs');
const Speaker = require('speaker');
function playAudio(relativePath) {
    const audioPath = path_1.default.join(__dirname, '..', 'assets', 'game-audio', relativePath);
    // Check if file exists
    if (!fs.existsSync(audioPath)) {
        throw new Error(`Audio file not found: ${audioPath}`);
    }
    // Create the Speaker instance
    const speaker = new Speaker({
        channels: 2, // 2 channels
        bitDepth: 16, // 16-bit samples
        sampleRate: 22050 // 44,100 Hz sample rate
    });
    // Create a readable stream from the file
    const fileStream = fs.createReadStream(audioPath);
    // Process and pipe the PCM data to the speaker
    fileStream.on('data', chunk => {
        // Ensure the chunk is correctly handled for playback
        if (chunk.length > 0) {
            speaker.write(chunk);
        }
    });
    fileStream.on('end', () => {
        speaker.end(); // End the stream when file reading is complete
    });
}
//# sourceMappingURL=play-audio.js.map