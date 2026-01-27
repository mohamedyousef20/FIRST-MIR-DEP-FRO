import { jwtDecode } from 'jwt-decode';

export interface TokenPayload {
  exp: number;
  iat: number;
  userId: string;
  // Add other token payload fields as needed
}

/**
 * Tokens are stored in HTTP-only cookies; exposing them to client JS defeats the purpose.
 * These helpers now return null and act as no-ops for backwards compatibility.
 */
export const getAccessToken = (): string | null => null;

export const getRefreshToken = (): string | null => null;

export const setAuthTokens = (_accessToken: string, _refreshToken: string): void => {
  // Intentionally left blank – cookies are managed server-side.
};

export const clearAuth = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const getTokenExpiration = (token: string): number | null => {
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded.exp;
  } catch (error) {
    return null;
  }
};

export const refreshToken = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    return data?.accessToken ?? null;
  } catch (error) {
    clearAuth();
    throw error;
  }
};

export const getCurrentUser = (): any => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: any): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};
