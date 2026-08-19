import { axiosClient, getResponseData } from "../../../lib/axios"
import type { ExtendVoucherRequest } from "../types"

/**
 * Gia hạn ngày hết hạn mới cho voucher CatSpeak.
 */
export const extendVoucher = async (
  id: number,
  payload: ExtendVoucherRequest,
): Promise<void> => {
  await getResponseData(
    axiosClient.post<void>(`/vouchers/${id}/extend`, payload),
  )
}
