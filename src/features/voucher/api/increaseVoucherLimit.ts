import { axiosClient, getResponseData } from "../../../lib/axios"
import type { IncreaseVoucherLimitRequest } from "../types"

/**
 * Tăng tổng lượt sử dụng khi voucher hết lượt.
 */
export const increaseVoucherLimit = async (
  id: number,
  payload: IncreaseVoucherLimitRequest,
): Promise<void> => {
  await getResponseData(
    axiosClient.post<void>(`/vouchers/${id}/increase-limit`, payload),
  )
}
