import { describe, expect, it, vi, beforeEach } from "vitest";
import axios from "axios";
import { axiosClient } from "./axios";
import { useAuthStore } from "../stores/authStore";
import type { AuthUser, AuthResponse } from "../features/auth/types";
import * as refreshApi from "../features/auth/api/refreshToken";

describe("axiosClient response interceptor & refresh token", () => {
  const adminUser: AuthUser = {
    accountId: 1,
    username: "admin_test",
    email: "admin@catspeak.com",
    roleId: 1,
    roleName: "Admin",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.getState().logout();
  });

  it("does not attempt refresh for /Auth/login endpoint errors", async () => {
    const requestRefreshTokenSpy = vi.spyOn(
      refreshApi,
      "requestRefreshToken",
    );

    // Mock axiosClient request failure on /Auth/login
    const mockError = {
      response: { status: 401 },
      config: { url: "/Auth/login" },
    };

    // We can directly test interceptor reject handling
    await expect(
      (axiosClient.interceptors.response as any).handlers[0].rejected(mockError),
    ).rejects.toEqual(mockError);

    expect(requestRefreshTokenSpy).not.toHaveBeenCalled();
  });

  it("refreshes token and retries failed request on 401", async () => {
    useAuthStore
      .getState()
      .login("expired-access-token", "valid-refresh-token", adminUser);

    const newAuthResponse: AuthResponse = {
      token: "new-access-token",
      refreshToken: "new-refresh-token",
      expiration: "2026-12-31T23:59:59Z",
      user: adminUser,
    };

    const requestRefreshTokenSpy = vi
      .spyOn(refreshApi, "requestRefreshToken")
      .mockResolvedValueOnce(newAuthResponse);

    // Mock request execution so node adapter doesn't fail on relative URL
    vi.spyOn(axios.Axios.prototype, "request").mockResolvedValue({
      data: { success: true },
    });

    const originalRequest: any = {
      baseURL: "http://localhost",
      url: "/admin/users",
      headers: {},
      adapter: async (config: any) => ({
        data: { success: true },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      }),
    };

    const mockError = {
      response: { status: 401 },
      config: originalRequest,
    };

    const responseHandler = (axiosClient.interceptors.response as any).handlers[0];
    await responseHandler.rejected(mockError);

    expect(requestRefreshTokenSpy).toHaveBeenCalledWith({
      token: "expired-access-token",
      refreshToken: "valid-refresh-token",
    });

    const storeState = useAuthStore.getState();
    expect(storeState.token).toBe("new-access-token");
    expect(storeState.refreshToken).toBe("new-refresh-token");
  });

  it("logs out and redirects to /login when refresh token fails", async () => {
    useAuthStore
      .getState()
      .login("expired-access-token", "expired-refresh-token", adminUser);

    vi.spyOn(refreshApi, "requestRefreshToken").mockRejectedValueOnce(
      new Error("Invalid refresh token"),
    );

    const originalRequest = {
      url: "/admin/rooms",
      headers: {} as any,
    };

    const mockError = {
      response: { status: 401 },
      config: originalRequest,
    };

    const responseHandler = (axiosClient.interceptors.response as any).handlers[0];
    await expect(responseHandler.rejected(mockError)).rejects.toThrow(
      "Invalid refresh token",
    );

    const storeState = useAuthStore.getState();
    expect(storeState.token).toBeNull();
    expect(storeState.refreshToken).toBeNull();
    expect(storeState.isAuthenticated).toBe(false);
  });

  it("handles concurrent requests queue and calls refresh only once", async () => {
    useAuthStore
      .getState()
      .login("expired-token", "valid-refresh", adminUser);

    let resolveRefresh: (val: AuthResponse) => void;
    const refreshPromise = new Promise<AuthResponse>((resolve) => {
      resolveRefresh = resolve;
    });

    const requestRefreshTokenSpy = vi
      .spyOn(refreshApi, "requestRefreshToken")
      .mockReturnValue(refreshPromise);

    const adapterMock = vi.fn(async (config: any) => ({
      data: { url: config.url },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    }));

    const req1: any = {
      baseURL: "http://localhost",
      url: "/api/endpoint1",
      headers: {},
      adapter: adapterMock,
    };
    const req2: any = {
      baseURL: "http://localhost",
      url: "/api/endpoint2",
      headers: {},
      adapter: adapterMock,
    };

    const responseHandler = (axiosClient.interceptors.response as any).handlers[0];

    // Fire two 401s concurrently
    const p1 = responseHandler.rejected({ response: { status: 401 }, config: req1 });
    const p2 = responseHandler.rejected({ response: { status: 401 }, config: req2 });

    // Only one refresh request should be made
    expect(requestRefreshTokenSpy).toHaveBeenCalledTimes(1);

    // Resolve the refresh
    resolveRefresh!({
      token: "new-token-123",
      refreshToken: "new-refresh-123",
      expiration: "2026-12-31T23:59:59Z",
      user: adminUser,
    });

    const [res1, res2] = await Promise.all([p1, p2]);
    expect(res1.data.url).toBe("/api/endpoint1");
    expect(res2.data.url).toBe("/api/endpoint2");
    expect(req1.headers.Authorization).toBe("Bearer new-token-123");
    expect(req2.headers.Authorization).toBe("Bearer new-token-123");
  });
});
