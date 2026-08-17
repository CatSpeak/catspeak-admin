import { axiosClient, getResponseData } from "../../../lib/axios"
import type { VoucherStatsDto } from "../types"

/**
 * Lấy số lượng thống kê voucher theo trạng thái để hiển thị lên các thẻ Dashboard (GET /api/vouchers/stats)
 */
export const getVoucherStats = async (): Promise<VoucherStatsDto> => {
  return getResponseData(axiosClient.get<VoucherStatsDto>("/vouchers/stats"))
}
