import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      // Add any additional user fields here
    } & DefaultSession["user"];
    accessToken?: string;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    // Add any additional user fields here
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    user?: {
      id: string;
      email: string;
      name: string;
      // Add any additional user fields here
    };
  }
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    // Add any additional user fields here
  };
}
