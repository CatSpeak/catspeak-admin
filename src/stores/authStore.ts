import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser } from '../features/auth/types';

export const ADMIN_ACCESS_ROLES = ["Admin", "Staff"] as const;

interface AuthState {
    token: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (token: string, user: AuthUser) => void;
    logout: () => void;
}

interface JwtPayload {
    exp?: number;
}

// Helper to parse JWT and check expiration
const isTokenValid = (token: string | null): boolean => {
    if (!token) return false;
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return false;

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        const payload = JSON.parse(jsonPayload) as JwtPayload;
        if (typeof payload.exp === 'number') {
            return payload.exp * 1000 > Date.now();
        }
        return false;
    } catch {
        return false;
    }
};

export const hasAdminAccess = (user: AuthUser | null): boolean =>
    ADMIN_ACCESS_ROLES.includes(user?.roleName as (typeof ADMIN_ACCESS_ROLES)[number]);

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            login: (token, user) =>
                set({
                    token,
                    user,
                    isAuthenticated: isTokenValid(token) && hasAdminAccess(user),
                }),
            logout: () => set({ token: null, user: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => sessionStorage),

            // onRehydrateStorage runs when the app starts up and pulls from sessionStorage
            onRehydrateStorage: () => (state) => {
                // If persisted auth is invalid or not allowed in admin, log them out immediately.
                if (
                    state &&
                    (!isTokenValid(state.token) || !hasAdminAccess(state.user))
                ) {
                    state.logout();
                }
            },
        }
    )
);
