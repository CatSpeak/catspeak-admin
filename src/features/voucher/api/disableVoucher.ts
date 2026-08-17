import { axiosClient, getResponseData } from "../../../lib/axios"

/**
 * Tạm dừng / Vô hiệu hóa voucher đang Active.
 */
export const disableVoucher = async (id: number): Promise<void> => {
  await getResponseData(axiosClient.post<void>(`/vouchers/${id}/disable`))
}
