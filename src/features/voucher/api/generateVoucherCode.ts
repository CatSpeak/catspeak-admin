import { axiosClient, getResponseData } from "../../../lib/axios";
import type { GenerateVoucherCodeResponse } from "../types";

/**
 * GET /api/vouchers/generate-code
 * Tự động sinh mã voucher ngẫu nhiên duy nhất theo Role.
 */
export const generateVoucherCode = async (): Promise<GenerateVoucherCodeResponse> => {
  return getResponseData(
    axiosClient.get<GenerateVoucherCodeResponse>("/api/vouchers/generate-code"),
  );
};
