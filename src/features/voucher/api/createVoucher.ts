import { axiosClient, getResponseData } from "../../../lib/axios"
import type { CreateVoucherRequest, VoucherDetailDto } from "../types"

/**
 * Tạo mới voucher hoặc lưu dưới dạng bản nháp (POST /api/vouchers)
 */
export const createVoucher = async (
  payload: CreateVoucherRequest,
): Promise<VoucherDetailDto> => {
  return getResponseData(
    axiosClient.post<VoucherDetailDto>("/vouchers", payload),
  )
}
