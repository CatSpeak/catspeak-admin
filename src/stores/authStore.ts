import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser } from "../features/auth/types";

export const ADMIN_ACCESS_ROLES = ["Admin", "Staff"] as const;

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (
    token: string,
    refreshTokenOrUser: string | AuthUser,
    user?: AuthUser,
  ) => void;
  setTokens: (token: string, refreshToken: string, user?: AuthUser) => void;
  logout: () => void;
}

interface JwtPayload {
  exp?: number;
}

const decodeBase64 = (str: string): string => {
  if (typeof atob === "function") {
    return atob(str);
  }
  if (typeof globalThis !== "undefined" && "Buffer" in globalThis) {
    const bufferCtor = (globalThis as Record<string, any>).Buffer;
    return bufferCtor.from(str, "base64").toString("binary");
  }
  return "";
};

// Helper to parse JWT and check expiration
export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return false;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const binary = decodeBase64(base64);
    if (!binary) return false;

    const jsonPayload = decodeURIComponent(
      binary
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    const payload = JSON.parse(jsonPayload) as JwtPayload;
    if (typeof payload.exp === "number") {
      return payload.exp * 1000 > Date.now();
    }
    return false;
  } catch {
    return false;
  }
};

export const hasAdminAccess = (user: AuthUser | null): boolean => {
  if (!user) return false;
  if (user.roleId === 1 || user.roleId === 3) return true;
  return ADMIN_ACCESS_ROLES.includes(
    user.roleName as (typeof ADMIN_ACCESS_ROLES)[number],
  );
};

export const isSessionActive = (
  token: string | null,
  refreshToken: string | null,
): boolean => {
  return isTokenValid(token) || Boolean(refreshToken);
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      login: (token, refreshTokenOrUser, maybeUser) => {
        let refreshToken: string | null = null;
        let user: AuthUser | null = null;

        if (typeof refreshTokenOrUser === "string") {
          refreshToken = refreshTokenOrUser;
          user = maybeUser || null;
        } else {
          user = refreshTokenOrUser;
        }

        set({
          token,
          refreshToken,
          user,
          isAuthenticated:
            isSessionActive(token, refreshToken) && hasAdminAccess(user),
        });
      },
      setTokens: (token, refreshToken, user) =>
        set((state) => {
          const nextUser = user ?? state.user;
          return {
            token,
            refreshToken,
            user: nextUser,
            isAuthenticated:
              isSessionActive(token, refreshToken) && hasAdminAccess(nextUser),
          };
        }),
      logout: () =>
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => {
        if (
          typeof window !== "undefined" &&
          typeof sessionStorage !== "undefined"
        ) {
          return sessionStorage;
        }
        const memory = new Map<string, string>();
        return {
          getItem: (name: string) => memory.get(name) ?? null,
          setItem: (name: string, value: string) => {
            memory.set(name, value);
          },
          removeItem: (name: string) => {
            memory.delete(name);
          },
        };
      }),

      // onRehydrateStorage runs when the app starts up and pulls from sessionStorage
      onRehydrateStorage: () => (state) => {
        // If persisted auth is invalid or not allowed in admin, log them out immediately.
        if (
          state &&
          (!isSessionActive(state.token, state.refreshToken) ||
            !hasAdminAccess(state.user))
        ) {
          state.logout();
        }
      },
    },
  ),
);
