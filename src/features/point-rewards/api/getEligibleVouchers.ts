import { axiosClient, getResponseData } from "../../../lib/axios"
import type { EligibleVoucherDto } from "../types"

/**
 * Lấy danh sách các Voucher hợp lệ do CatSpeak tài trợ để hiển thị trong Dropdown khi Tạo mục đổi điểm.
 * GET /admin/point-redemptions/eligible-vouchers
 */
export const getEligibleVouchers = async (): Promise<EligibleVoucherDto[]> => {
  return getResponseData(
    axiosClient.get<EligibleVoucherDto[]>(
      "/admin/point-redemptions/eligible-vouchers",
    ),
  )
}
