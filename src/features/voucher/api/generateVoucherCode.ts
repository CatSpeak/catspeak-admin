import { axiosClient, getResponseData } from "../../../lib/axios"
import type { GenerateCodeResponse } from "../types"

/**
 * Tự động sinh mã voucher ngẫu nhiên duy nhất theo Role (GET /api/vouchers/generate-code)
 */
export const generateVoucherCode = async (): Promise<GenerateCodeResponse> => {
  return getResponseData(
    axiosClient.get<GenerateCodeResponse>("/vouchers/generate-code"),
  )
}
