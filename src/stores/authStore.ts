import { create } from 'zustand';
import type { AuthUser } from '../features/auth/types';

interface AuthState {
    token: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (token: string, user: AuthUser) => void;
    logout: () => void;
}

// Helper to get initial state from localStorage
const getInitialState = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    let user: AuthUser | null = null;
    try {
        user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        console.error('Failed to parse user from localStorage', e);
    }

    return {
        token,
        user,
        isAuthenticated: !!token,
    };
};

export const useAuthStore = create<AuthState>((set) => ({
    ...getInitialState(),
    login: (token, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ token, user, isAuthenticated: true });
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ token: null, user: null, isAuthenticated: false });
    },
}));
