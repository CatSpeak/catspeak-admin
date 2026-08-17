import { axiosClient, getResponseData } from "../../../lib/axios"
import type { VoucherDetailDto } from "../types"

/**
 * Lấy chi tiết cấu hình voucher, thông tin cọc/đối soát (Deposit & Escrow) và thống kê hiệu suất nhanh (GET /api/vouchers/{id})
 */
export const getVoucherDetail = async (
  id: number,
): Promise<VoucherDetailDto> => {
  return getResponseData(axiosClient.get<VoucherDetailDto>(`/vouchers/${id}`))
}
