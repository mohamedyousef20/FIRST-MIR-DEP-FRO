"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { authService } from "@/lib/api";

let cachedSessionUser: any = null;
let hasFetchedSessionUser = false;
let isRefreshing = false;
let refreshQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = [];

type AuthContextValue = {
    user: any;
    setUser: (user: any) => void;
    refreshUser: (options?: { force?: boolean }) => Promise<any>;
    cookiesReady: boolean;
    isJwtToken: boolean;
    logout: () => Promise<void>;
};

// Helper to calculate token expiry - uses env variable or falls back to 15 minutes
const calculateTokenExpiry = (expFromToken?: number) => {
    // If we have exp from JWT token, use it
    if (expFromToken) {
        return expFromToken * 1000; // Convert seconds to milliseconds
    }

    // Otherwise use env variable or default
    const ttlSeconds = process.env.NEXT_PUBLIC_ACCESS_TOKEN_TTL
        ? parseInt(process.env.NEXT_PUBLIC_ACCESS_TOKEN_TTL)
        : 15 * 60; // Default 15 minutes in seconds

    return Date.now() + (ttlSeconds * 1000);
};

const normalizeUserPayload = (payload: any) => {
    if (!payload) return null;

    // Check if it's a JWT token payload (has iat/exp)
    if (payload.iat && payload.exp) {
        //console.log('Normalizing JWT token payload');
        return {
            _id: payload.id || payload._id,
            id: payload.id || payload._id,
            email: payload.email,
            role: payload.role,
            firstName: payload.firstName,
            lastName: payload.lastName,
            phone: payload.phone || '',
            isVerified: payload.isVerified || false,
            vendorProfile: payload.vendorProfile || null,
            wallet: payload.wallet || null,
            preferences: payload.preferences || null,
            profileImage: payload.profileImage || payload.avatar || '',
            isActive: payload.isActive || true,
            // Store token expiry from JWT
            tokenExpiry: calculateTokenExpiry(payload.exp),
            _isJwtToken: true
        };
    }

    // Check different possible structures
    if (payload.data?.user) {
        return {
            ...payload.data.user,
            tokenExpiry: calculateTokenExpiry(payload.data.user.exp)
        };
    }
    if (payload.user) {
        return {
            ...payload.user,
            tokenExpiry: calculateTokenExpiry(payload.user.exp)
        };
    }
    if (payload.data) {
        return {
            ...payload.data,
            tokenExpiry: calculateTokenExpiry(payload.data.exp)
        };
    }

    // Default case
    return {
        ...payload,
        tokenExpiry: calculateTokenExpiry(payload?.exp)
    };
};

const AuthContext = createContext<AuthContextValue>({
    user: null,
    setUser: () => { },
    refreshUser: async () => null,
    cookiesReady: false,
    isJwtToken: false,
    logout: async () => { },
});

function AuthContextWrapper({ children, initialUser }: { children: React.ReactNode; initialUser?: any }) {
    const { data: session } = useSession();
    const [cookiesReady, setCookiesReady] = useState(false);
    const [userState, setUserState] = useState(() => normalizeUserPayload(initialUser ?? cachedSessionUser ?? session?.user));
    const [isJwtToken, setIsJwtToken] = useState<boolean>(() => Boolean((initialUser ?? cachedSessionUser ?? session?.user)?._isJwtToken));

    // Refs for timers
    const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
    const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

    const clearTimers = () => {
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = null;
        }
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
            inactivityTimerRef.current = null;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearTimers();
            cachedSessionUser = null;
            hasFetchedSessionUser = false;
            setUserState(null);
            setIsJwtToken(false);

            // Clear any stored tokens
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
                sessionStorage.removeItem('auth_token');
            }
        }
    };

    const setUser = (value: any) => {
        const normalized = normalizeUserPayload(value);
        cachedSessionUser = normalized;
        setUserState(normalized);
        setIsJwtToken(Boolean(normalized?._isJwtToken));

        // Clear existing timers
        clearTimers();

        // Set up proactive token refresh if user exists
        if (normalized) {
            setupTokenRefresh(normalized);
            resetInactivityTimer();
        }
    };

    const setupTokenRefresh = (user: any) => {
        if (!user?.tokenExpiry) return;

        const expiryTime = user.tokenExpiry;
        const now = Date.now();
        const timeUntilExpiry = expiryTime - now;

        // Don't schedule refresh if expiry is more than 6 days away
        // This prevents unnecessary refreshes for long-lived tokens
        if (timeUntilExpiry > (6 * 24 * 60 * 60 * 1000)) {
            //console.log('Token expiry far in future (>6 days), skipping auto-refresh setup');
            return;
        }

        // If token is already expired or about to expire (less than 5 minutes left)
        if (timeUntilExpiry < (5 * 60 * 1000)) {
            // Refresh immediately
            setTimeout(() => {
                refreshUser({ force: true });
            }, 1000);
        } else {
            // Schedule refresh 5 minutes before expiry (more buffer than 2 minutes)
            const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 10000); // Min 10 seconds

            refreshTimerRef.current = setTimeout(() => {
                //console.log('Proactively refreshing token before expiry');
                refreshUser({ force: true });
            }, refreshTime);

            //console.log(`Token refresh scheduled in ${Math.floor(refreshTime / 60000)} minutes`);
        }
    };

    const resetInactivityTimer = () => {
        // Clear existing inactivity timer
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
        }

        // Set new inactivity timer (30 minutes)
        inactivityTimerRef.current = setTimeout(() => {
            //console.log('User inactive for 30 minutes, logging out');
            logout();
        }, 90 * 60 * 1000); // 30 minutes
    };

    const refreshUser = async ({ force = false }: { force?: boolean } = {}) => {
        // Prevent multiple simultaneous refresh requests
        if (isRefreshing && !force) {
            return new Promise((resolve, reject) => {
                refreshQueue.push({ resolve, reject });
            });
        }

        if (!force && hasFetchedSessionUser && cachedSessionUser !== undefined) {
            setUser(cachedSessionUser);
            return cachedSessionUser ?? null;
        }

        if (!force && hasFetchedSessionUser && cachedSessionUser === null) {
            setUser(null);
            return null;
        }

        isRefreshing = true;

        try {
            const res = await authService.getCurrentUser();
            const fetchedUser = normalizeUserPayload(res.data?.data);
            cachedSessionUser = fetchedUser ?? null;
            hasFetchedSessionUser = true;
            setUser(fetchedUser);

            // Process queued requests
            refreshQueue.forEach(({ resolve }) => resolve(fetchedUser));
            refreshQueue = [];

            return fetchedUser;
        } catch (err) {
            const error = err as any;

            // Process queued requests with error
            refreshQueue.forEach(({ reject }) => reject(error));
            refreshQueue = [];

            // Handle network errors specifically
            if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                console.warn('Network error when fetching user - might be unauthenticated');
                // Set as not fetched yet to retry later
                hasFetchedSessionUser = false;
                cachedSessionUser = null;
                setUser(null);
                return null;
            }

            // Handle different error scenarios
            if (error?.response?.status === 401) {
                // User is not authenticated - this is expected for logged out users
                console.log('User not authenticated (401) - normal for logged out state');
                cachedSessionUser = null;
                hasFetchedSessionUser = true; // Mark as fetched to avoid retries
                setUser(null);
                return null;
            } else if (error?.response?.status === 403) {
                console.warn('Forbidden - user may be blocked or session invalid');
                logout();
            } else {
                console.error('Server error:', error.message);
            }

            cachedSessionUser = null;
            hasFetchedSessionUser = true;
            setUser(null);
            return null;
        } finally {
            isRefreshing = false;
        }
    };

    // Set up activity listeners
    useEffect(() => {
        const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];

        const resetActivityTimer = () => {
            if (userState) {
                resetInactivityTimer();
            }
        };

        activityEvents.forEach(event => {
            window.addEventListener(event, resetActivityTimer);
        });

        return () => {
            activityEvents.forEach(event => {
                window.removeEventListener(event, resetActivityTimer);
            });
            clearTimers();
        };
    }, [userState]);

    useEffect(() => {
        //console.log("AuthProvider mounted");

        // Clear timers on mount
        clearTimers();

        if (initialUser) {
            cachedSessionUser = normalizeUserPayload(initialUser);
            hasFetchedSessionUser = true;
            setUser(initialUser);
            setIsJwtToken(Boolean((initialUser as any)?._isJwtToken));
            return;
        }

        if (session?.user) {
            setUser(session.user);
            setIsJwtToken(Boolean((session.user as any)?._isJwtToken));

            if (typeof window !== 'undefined') {
                setCookiesReady(false);
                const syncCookies = async () => {
                    try {
                        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/social-set-cookies`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({
                                accessToken: (session.user as any).accessToken,
                                refreshToken: (session.user as any).refreshToken,
                                role: (session.user as any).role
                            })
                        });
                    } catch (err) {
                        console.error('Failed to sync cookies', err);
                    } finally {
                        setCookiesReady(true);
                    }
                };

                syncCookies();
            }
        } else {
            setCookiesReady(true);
        }

        if (!hasFetchedSessionUser) {
            refreshUser();
        }

        // Cleanup on unmount
        return () => {
            clearTimers();
        };
    }, [session]);

    return (
        <AuthContext.Provider value={{
            user: userState,
            setUser,
            refreshUser,
            cookiesReady,
            isJwtToken,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function AuthProvider({ children, initialUser }: { children: React.ReactNode; initialUser?: any }) {
    return (
        <SessionProvider>
            <AuthContextWrapper initialUser={initialUser}>{children}</AuthContextWrapper>
        </SessionProvider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}