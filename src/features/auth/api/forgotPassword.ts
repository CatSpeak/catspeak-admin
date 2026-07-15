import { axiosClient, getResponseData } from "../../../lib/axios";
import type {
  ForgotPasswordRequest,
  VerifyResetOtpRequest,
  VerifyResetOtpResponse,
  ResetPasswordRequest,
} from "../types";

export const sendForgotPasswordOtp = async (
  data: ForgotPasswordRequest,
): Promise<void> => {
  return getResponseData(axiosClient.post("/api/Auth/forgot-password", data));
};

export const verifyResetOtp = async (
  data: VerifyResetOtpRequest,
): Promise<VerifyResetOtpResponse> => {
  return getResponseData(axiosClient.post("/api/Auth/verify-reset-otp", data));
};

export const resetPassword = async (
  data: ResetPasswordRequest,
): Promise<void> => {
  return getResponseData(axiosClient.post("/api/Auth/reset-password", data));
};
