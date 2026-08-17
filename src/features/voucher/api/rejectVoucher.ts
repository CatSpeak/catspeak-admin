import { axiosClient, getResponseData } from "../../../lib/axios"
import type { RejectVoucherRequest } from "../types"

/**
 * Admin từ chối & hủy voucher -> Lưu lý do từ chối, chuyển trạng thái sang Rejected.
 */
export const rejectVoucher = async (
  id: number,
  payload: RejectVoucherRequest,
): Promise<void> => {
  await getResponseData(
    axiosClient.post<void>(`/vouchers/${id}/reject`, payload),
  )
}
