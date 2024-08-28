import express, { Request, Response } from 'express';
import session from 'express-session';
import { playAudio, Game } from 'mystery-mansion-electronic-assistant';
import { reqClientError, reqServerError, reqSuccess } from './lib/format-api-responses';
import IApiResponse from './interfaces/api-response';
import { error } from 'console';
const app = express();
const port = 3000;

// Set up session middleware
app.use(session({
  secret: 'your-secret-key', // Replace with a strong secret in production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true } // Set to true if using HTTPS
}));

app.get('/welcome', (req: Request, res: Response) => {
  try {
    playAudio('welcome.wav');
    const resBody = reqSuccess<string>('Welcome!');
    return res.status(resBody.statusCode).json(resBody);
  } catch (error) {
    const resBody = reqServerError<{}>({}, error, ['An error occurred on the server.'])
    return res.status(resBody.statusCode).json(resBody);
  }
});

// uses optional route parameter
app.get('/start-game/:seed?', (req: Request, res: Response) => {
  try {
    const { seed } = req.params;

    // Initialize or update the session with game state
    req.session.seed = new Game(seed).getSeed();

    const resBody = reqSuccess<string[]>(["New session created."]);
    return res.status(resBody.statusCode).json(resBody);
  } catch (error) { 
    const resBody = reqServerError<{}>({}, error, ['An error occurred on the server.'])
    return res.status(resBody.statusCode).json(resBody);
  }
});

app.get('/test-seed', (req: Request, res: Response) => {
  try {
    if (!validateSession(req)) {
      const resBody = reqClientError<string[]>(['Server session is not valid.'], ["Please start a new game."]);
      return res.status(resBody.statusCode).json(resBody);
    }
    
    const game = new Game(req.session.seed);
    const result = game.getRng();
    
    const resBody = reqSuccess<number>(result);
    return res.status(resBody.statusCode).json(resBody);
  } catch (error) {
    console.log(error)
    const resBody = reqServerError<{}>({}, error, ['An error occurred on the server.'])
    return res.status(resBody.statusCode).json(resBody);
  }
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});

// true means game session is valid
function validateSession(req: Request): boolean {
  if (req.session?.seed) return true
  return false;
}
