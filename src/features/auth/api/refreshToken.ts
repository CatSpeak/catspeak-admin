import axios from "axios";
import type { AuthResponse, RefreshTokenModel } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const requestRefreshToken = async (
  data: RefreshTokenModel,
): Promise<AuthResponse> => {
  const normalizedBaseUrl = (API_BASE_URL || "/api").replace(/\/+$/, "");
  const response = await axios.post<AuthResponse>(
    `${normalizedBaseUrl}/Auth/refresh-token`,
    data,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
};
