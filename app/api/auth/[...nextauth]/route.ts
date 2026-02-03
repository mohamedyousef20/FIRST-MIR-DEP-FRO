import NextAuth from 'next-auth';
import type { NextAuthConfig, Session, Account, Profile } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';

const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google OAuth credentials in environment variables');
}

type BackendUser = {
  id: string;
  role: 'admin' | 'seller' | 'user' | 'driver';
  firstName?: string;
  lastName?: string;
  email: string;
};

type ExtendedToken = JWT & {
  backendUser?: BackendUser;
  accessToken?: string;
  refreshToken?: string;
};

export const authOptions: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account, profile }: { token: ExtendedToken; account?: Account | null; profile?: Profile }) {
      if (account?.provider === 'google' && profile) {
        const payload = {
          email: profile.email,
          firstName: (profile as any).given_name || profile.name?.split(' ')?.[0] || 'Google',
          lastName: (profile as any).family_name || profile.name?.split(' ')?.slice(1).join(' ') || 'User',
          googleId: profile.sub || account.providerAccountId,
          avatar: (profile as any).picture,
        };

        const response = await fetch(`${backendBaseUrl}/api/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          console.error('Failed to sync Google user with backend:', await response.text());
          throw new Error('Failed to sign in with Google');
        }

        const data = await response.json();
        const { tokens, data: userData } = data;
        const backendUser = userData.user as BackendUser;

        token.backendUser = backendUser;
        token.accessToken = tokens.accessToken;
        token.refreshToken = tokens.refreshToken;

        // Cookies will be set client-side via /api/auth/social-set-cookies after login
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: ExtendedToken }) {
      if (token?.backendUser) {
        session.user = {
          ...session.user,
          id: token.backendUser.id,
          role: token.backendUser.role,
          email: token.backendUser.email,
          firstName: (token.backendUser as any).firstName,
          lastName: (token.backendUser as any).lastName,
          profileImage: (token.backendUser as any).avatar || (session.user as any).image || '',
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
        } as any;
      }

      return session;
    },
  },
};

export const { handlers: { GET, POST } } = NextAuth(authOptions);
