import { axiosClient, getResponseData } from "../../../lib/axios";
import type { AuthResponse, LoginCredentials } from "../types";

export const loginWithEmailAndPassword = async (
  data: LoginCredentials,
): Promise<AuthResponse> => {
  return getResponseData(axiosClient.post<AuthResponse>("/api/Auth/login", data));
};
