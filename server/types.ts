// Extend express-session types
declare module 'express-session' {
  interface SessionData {
    accessToken?: string;
    user?: {
      id: string;
      displayName: string;
      mail: string;
    };
    githubAccessToken?: string;
    githubUser?: {
      id: number;
      login: string;
      avatar_url: string;
      html_url: string;
      name?: string;
    };
    oauthState?: string;
  }
}

export {}; // Make this a module