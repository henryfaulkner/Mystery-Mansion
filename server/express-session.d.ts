// In a file like express-session.d.ts
import session from 'express-session';
import { Game } from 'mystery-mansion-electronic-assistant';

declare module 'express-session' {
  interface SessionData {
    seed: string | undefined;
  }
}
