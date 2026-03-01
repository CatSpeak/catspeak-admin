import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser } from '../features/auth/types';

interface AuthState {
    token: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (token: string, user: AuthUser) => void;
    logout: () => void;
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

        const payload = JSON.parse(jsonPayload);
        if (payload && payload.exp) {
            return payload.exp * 1000 > Date.now();
        }
        return true;
    } catch {
        return false;
    }
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            login: (token, user) => set({ token, user, isAuthenticated: true }),
            logout: () => set({ token: null, user: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage', // The key used in localStorage
            storage: createJSONStorage(() => localStorage), // Can be omitted as localStorage is default

            // onRehydrateStorage runs when the app starts up and pulls from localStorage
            onRehydrateStorage: () => (state) => {
                // If there's a state, a token, and it's invalid, log them out immediately
                if (state && state.token && !isTokenValid(state.token)) {
                    state.logout();
                }
            },
        }
    )
);