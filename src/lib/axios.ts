import axios from "axios";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../stores/authStore";
import { requestRefreshToken } from "../features/auth/api/refreshToken";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: {
    indexes: null,
  },
});

// Request Interceptor: Tự động gắn Access Token vào mọi request gửi đi
axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Biến cờ và hàng đợi để xử lý các request gọi đồng thời (tránh Race Condition)
interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, newAccessToken: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (newAccessToken) {
      prom.resolve(newAccessToken);
    }
  });
  failedQueue = [];
};

// Hàm xử lý đăng xuất khi phiên đăng nhập hoàn toàn kết thúc
const handleLogout = () => {
  useAuthStore.getState().logout();
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

// Response Interceptor: Xử lý khi nhận mã lỗi 401
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || "";
    // Không xử lý retry nếu lỗi đến từ chính endpoint login hoặc refresh-token hoặc endpoint xác thực OTP/mật khẩu
    const isAuthEndpoint =
      requestUrl.includes("/Auth/login") ||
      requestUrl.includes("/Auth/refresh-token") ||
      requestUrl.includes("/Auth/forgot-password") ||
      requestUrl.includes("/Auth/reset-password");

    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // Nếu gặp lỗi 401 và request này chưa từng được retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Đánh dấu request này đã retry để tránh lặp vô tận (infinite loop)
      originalRequest._retry = true;

      // TRƯỜNG HỢP 1: Đang có 1 request khác tiến hành refresh token
      // -> Đưa request hiện tại vào hàng đợi chờ
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // TRƯỜNG HỢP 2: Request đầu tiên phát hiện 401 -> Tiến hành refresh token
      isRefreshing = true;

      const { token: currentAccessToken, refreshToken: currentRefreshToken } =
        useAuthStore.getState();

      // Nếu không có token trong bộ nhớ -> Đăng xuất luôn
      if (!currentAccessToken || !currentRefreshToken) {
        handleLogout();
        return Promise.reject(error);
      }

      try {
        // Gọi API Backend: POST /api/Auth/refresh-token
        const data = await requestRefreshToken({
          token: currentAccessToken,
          refreshToken: currentRefreshToken,
        });

        const { token: newAccessToken, refreshToken: newRefreshToken, user } =
          data;

        // Lưu cặp token mới vào authStore (và sessionStorage qua Zustand persist)
        useAuthStore
          .getState()
          .setTokens(newAccessToken, newRefreshToken, user);

        // Cập nhật header mặc định
        axiosClient.defaults.headers.common["Authorization"] =
          `Bearer ${newAccessToken}`;

        // Giải phóng các request đang nằm chờ trong queue
        processQueue(null, newAccessToken);

        // Retry lại chính request vừa bị 401 ban đầu
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh token không hợp lệ hoặc đã hết hạn -> Buộc đăng xuất
        processQueue(refreshError, null);
        handleLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export const getResponseData = async <T>(
  request: Promise<AxiosResponse<T>>,
): Promise<T> => {
  const response = await request;
  return response.data;
};

export interface ApiErrorResponse {
  type?: string;
  title?: string;
  status?: number;
  message?: string;
  detail?: string;
  errors?: Record<string, string[] | string>;
  traceId?: string;
}

export const getApiErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data;
    if (data) {
      if (data.errors && typeof data.errors === "object") {
        const messages: string[] = [];
        for (const key in data.errors) {
          const val = data.errors[key];
          if (Array.isArray(val)) {
            messages.push(
              ...val.filter(
                (m): m is string => typeof m === "string" && m.trim().length > 0,
              ),
            );
          } else if (typeof val === "string" && val.trim().length > 0) {
            messages.push(val);
          }
        }
        if (messages.length > 0) {
          return messages.join("\n");
        }
      }

      if (typeof data.message === "string" && data.message.trim().length > 0) {
        return data.message;
      }
      if (typeof data.detail === "string" && data.detail.trim().length > 0) {
        return data.detail;
      }
      if (typeof data.title === "string" && data.title.trim().length > 0) {
        return data.title;
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};
