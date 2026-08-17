import { axiosClient, getResponseData } from "../../../lib/axios"
import type { UpdateVoucherRequest, VoucherDetail } from "../types"

/**
 * Cập nhật cấu hình voucher (chỉ cho phép khi voucher đang ở trạng thái Draft).
 */
export const updateVoucher = async (
  id: number,
  payload: UpdateVoucherRequest,
): Promise<VoucherDetail> => {
  return getResponseData(
    axiosClient.put<VoucherDetail>(`/vouchers/${id}`, payload),
  )
}
