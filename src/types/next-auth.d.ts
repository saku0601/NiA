import 'next-auth';
import { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXTAUTH_URL?: string;
      NEXTAUTH_SECRET?: string;
      AUTH_SECRET?: string;
      NODE_ENV?: 'development' | 'production' | 'test';
      [key: string]: string | undefined;
    }
  }
}

export {}; 