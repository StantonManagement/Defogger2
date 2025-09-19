// Extend express-session types
declare module 'express-session' {
  interface SessionData {
    accessToken?: string;
    user?: {
      id: string;
      displayName: string;
      mail: string;
    };
  }
}

export {}; // Make this a module