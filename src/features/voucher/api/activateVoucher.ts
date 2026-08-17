import { axiosClient, getResponseData } from "../../../lib/axios"

/**
 * Kích hoạt lại voucher (từ Disabled, Draft, Expired).
 */
export const activateVoucher = async (id: number): Promise<void> => {
  await getResponseData(axiosClient.post<void>(`/vouchers/${id}/activate`))
}
