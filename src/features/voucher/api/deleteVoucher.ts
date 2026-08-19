import { axiosClient, getResponseData } from "../../../lib/axios"

/**
 * Xóa voucher.
 */
export const deleteVoucher = async (id: number): Promise<void> => {
  await getResponseData(axiosClient.delete<void>(`/vouchers/${id}`))
}
