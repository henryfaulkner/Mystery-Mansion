import session from 'express-session';

// This is the client session object
declare module 'express-session' {
  interface SessionData {
    seed: string | undefined;
  }
}
