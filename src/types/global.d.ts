/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    NEXTAUTH_URL?: string;
    NEXTAUTH_SECRET?: string;
    AUTH_SECRET?: string;
    NODE_ENV?: 'development' | 'production' | 'test';
    [key: string]: string | undefined;
  }
}

export {}; 