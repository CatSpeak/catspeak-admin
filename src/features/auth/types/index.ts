import type { Account } from "../../../entities/types";

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

export interface AuthUser {
  accountId: number;
  username: string;
  email: string;
  roleId: number;
  roleName: string;
}
