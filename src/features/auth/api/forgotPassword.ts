import { axiosClient, getResponseData } from "../../../lib/axios";
import type {
  ForgotPasswordRequest,
  VerifyResetOtpRequest,
  ResetPasswordRequest,
} from "../types";

export const sendForgotPasswordOtp = async (
  data: ForgotPasswordRequest,
): Promise<void> => {
  return getResponseData(axiosClient.post("/Auth/forgot-password", data));
};

export const verifyResetOtp = async (
  data: VerifyResetOtpRequest,
): Promise<void> => {
  return getResponseData(axiosClient.post("/Auth/verify-reset-otp", data));
};

export const resetPassword = async (
  data: ResetPasswordRequest,
): Promise<void> => {
  return getResponseData(axiosClient.post("/Auth/reset-password", data));
};
