import express, { Request, Response } from 'express';
import { Game, Process } from 'mystery-mansion-electronic-assistant';
import { reqClientError, reqServerError, reqSuccess } from './lib/format-api-responses';
import WebSocket from 'ws'; 
const app = express();
const port = 3000;

const server = app.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`);
});

app.get('/ping', (req: Request, res: Response) => {
  try {
    const resBody = reqSuccess<string>('Pong!');
    return res.status(resBody.statusCode).json(resBody);
  } catch (error) {
    const resBody = reqServerError<{}>({}, error, ['An error occurred on the server.'])
    return res.status(resBody.statusCode).json(resBody);
  }
});

// Create a WebSocket server and attach it to the HTTP server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('New client connected');
  var game: Game;

  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message.toString());
      const { action, data } = parsedMessage;

      switch (action) {
        case 'welcome':
          try {
            ws.send(JSON.stringify(reqSuccess<string>('Welcome!')));
          } catch (error) {
            ws.send(JSON.stringify(reqServerError<{}>({}, error, ['An error occurred while welcoming.'])));
          }
          break;

        case 'startGame':
          try {
            const seed = data?.seed;
            // Initialize or update the session with game state
            game = new Game(seed);
            ws.send(JSON.stringify(reqSuccess<string[]>(["New session created."])));
          } catch (error) {
            ws.send(JSON.stringify(reqServerError<{}>({}, error, ['An error occurred while starting the game.'])));
          }
          break;

        case 'testSeed':
          try {
            if (!validateSession(game)) {
              ws.send(JSON.stringify(reqClientError<string[]>(['Server session is not valid.'], ["Please start a new game."])));
              break;
            }
            const result = game.getRng();
            ws.send(JSON.stringify(reqSuccess<number>(result)));
          } catch (error) {
            ws.send(JSON.stringify(reqServerError<{}>({}, error, ['An error occurred while testing the seed.'])));
          }
          break;

        case 'explore':
          try {
            if (!validateSession(game)) {
              ws.send(JSON.stringify(reqClientError<string[]>(['Server session is not valid.'], ["Please start a new game."])));
              break;
            }
            let progressResult;
            if ((data.process as Process).action === 'explore-room') {
              game.exploreRoom(data.process, data.code, data.userInput);
            } else if ((data as Process).action === 'explore-furniture') {
              game.exploreFurniture(data.process, data.code, data.userInput);
            }
            ws.send(JSON.stringify(reqSuccess(progressResult)));
          } catch (error) {
            ws.send(JSON.stringify(reqServerError<{}>({}, error, ['An error occurred while retrieving progress.'])));
          }
          break;

        default:
          try {
            ws.send(JSON.stringify(reqClientError<string[]>(['Unknown action.'], [])));
          } catch (error) {
            ws.send(JSON.stringify(reqServerError<{}>({}, error, ['An error occurred while handling the action.'])));
          }
      }
    } catch (parseError) {
      ws.send(JSON.stringify(reqClientError<string[]>(['Invalid message format.'], [])));
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// true means game session is valid
function validateSession(game?: Game): boolean {
  if (game) return true;
  return false;
}
