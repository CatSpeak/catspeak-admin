import { axiosClient, getResponseData } from "../../../lib/axios"
import type { VoucherStats } from "../types"

/**
 * Lấy số lượng thống kê voucher theo trạng thái để hiển thị lên các thẻ Dashboard
 */
export const getVoucherStats = async (): Promise<VoucherStats> => {
  return getResponseData(axiosClient.get<VoucherStats>("/vouchers/stats"))
}
