import axios from "axios";
import type { AxiosResponse } from "axios";
import { useAuthStore } from "../stores/authStore";

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

axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
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
