import { axiosClient, getResponseData } from "../../../lib/axios"
import type { VoucherStats } from "../types"

/**
 * GET /api/vouchers/stats
 * Lấy số lượng thống kê voucher theo trạng thái để hiển thị lên các thẻ Dashboard
 */
export const getVoucherStats = async (): Promise<VoucherStats> => {
  return getResponseData(axiosClient.get<VoucherStats>("/api/vouchers/stats"))
}
