import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id: string;
      role: 'admin' | 'seller' | 'user' | 'driver';
      accessToken: string;
    } & DefaultSession['user'];
  }

  /**
   * Extend the built-in user types
   */
  interface User extends DefaultUser {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'seller' | 'user' | 'driver';
    accessToken: string;
  }
}

declare module 'next-auth/jwt' {
  /** Extend the built-in JWT types */
  interface JWT {
    accessToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: 'admin' | 'seller' | 'user' | 'driver';
    };
  }
}
