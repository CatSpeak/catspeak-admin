import type { Account } from '../../users/types'; // Import generic Account/User type

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    refreshToken: string;
    expiration: string;
    user: Account;
}

// User object inside AuthResponse might need to be explicitly defined if it differs from the general Account type,
// but based on the JSON provided, it looks compatible with our Account interface (or a subset of it).
// Let's redefine it here just to be safe and strictly match the auth response.
export interface AuthUser {
    accountId: number;
    username: string;
    email: string;
    roleId: number;
    roleName: string;
}
