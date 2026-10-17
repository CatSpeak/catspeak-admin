import { describe, expect, it, beforeEach } from "vitest";
import {
  useAuthStore,
  isTokenValid,
  isSessionActive,
  hasAdminAccess,
} from "./authStore";
import type { AuthUser } from "../features/auth/types";

// Helper to make a mock JWT token with given exp timestamp
const createMockJwt = (expInSeconds: number) => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ exp: expInSeconds }));
  return `${header}.${payload}.signature`;
};

describe("authStore & token helpers", () => {
  const adminUser: AuthUser = {
    accountId: 1,
    username: "admin_user",
    email: "admin@catspeak.com",
    roleId: 1,
    roleName: "Admin",
  };

  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  describe("isTokenValid", () => {
    it("returns false for null or empty token", () => {
      expect(isTokenValid(null)).toBe(false);
      expect(isTokenValid("")).toBe(false);
    });

    it("returns true for unexpired token", () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const validToken = createMockJwt(futureExp);
      expect(isTokenValid(validToken)).toBe(true);
    });

    it("returns false for expired token", () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600;
      const expiredToken = createMockJwt(pastExp);
      expect(isTokenValid(expiredToken)).toBe(false);
    });
  });

  describe("isSessionActive", () => {
    it("returns true when token is valid even without refresh token", () => {
      const validToken = createMockJwt(Math.floor(Date.now() / 1000) + 3600);
      expect(isSessionActive(validToken, null)).toBe(true);
    });

    it("returns true when token is expired but refreshToken exists", () => {
      const expiredToken = createMockJwt(Math.floor(Date.now() / 1000) - 3600);
      expect(isSessionActive(expiredToken, "valid-refresh-token")).toBe(true);
    });

    it("returns false when token is expired and refreshToken is null", () => {
      const expiredToken = createMockJwt(Math.floor(Date.now() / 1000) - 3600);
      expect(isSessionActive(expiredToken, null)).toBe(false);
    });
  });

  describe("hasAdminAccess", () => {
    it("returns true for Admin role or roleId 1 or 3", () => {
      expect(hasAdminAccess(adminUser)).toBe(true);
      expect(hasAdminAccess({ ...adminUser, roleId: 3, roleName: "Teacher" })).toBe(true);
    });

    it("returns false for regular User role", () => {
      expect(hasAdminAccess({ ...adminUser, roleId: 2, roleName: "User" })).toBe(false);
    });
  });

  describe("useAuthStore state management", () => {
    it("logs in and stores token and refreshToken", () => {
      const validToken = createMockJwt(Math.floor(Date.now() / 1000) + 3600);
      useAuthStore.getState().login(validToken, "my-refresh-token", adminUser);

      const state = useAuthStore.getState();
      expect(state.token).toBe(validToken);
      expect(state.refreshToken).toBe("my-refresh-token");
      expect(state.user).toEqual(adminUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it("updates tokens with setTokens without resetting user", () => {
      const oldToken = createMockJwt(Math.floor(Date.now() / 1000) + 3600);
      useAuthStore.getState().login(oldToken, "old-refresh", adminUser);

      const newToken = createMockJwt(Math.floor(Date.now() / 1000) + 7200);
      useAuthStore.getState().setTokens(newToken, "new-refresh");

      const state = useAuthStore.getState();
      expect(state.token).toBe(newToken);
      expect(state.refreshToken).toBe("new-refresh");
      expect(state.user).toEqual(adminUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it("clears state on logout", () => {
      const token = createMockJwt(Math.floor(Date.now() / 1000) + 3600);
      useAuthStore.getState().login(token, "refresh-123", adminUser);
      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
