import { axiosClient, getResponseData } from "../../../lib/axios"
import type { UpdateVoucherRequest, VoucherDetailDto } from "../types"

/**
 * Cập nhật cấu hình voucher (chỉ cho phép khi voucher đang ở trạng thái Draft) (PUT /api/vouchers/{id})
 */
export const updateVoucher = async (
  id: number,
  payload: UpdateVoucherRequest,
): Promise<VoucherDetailDto> => {
  return getResponseData(
    axiosClient.put<VoucherDetailDto>(`/vouchers/${id}`, payload),
  )
}
