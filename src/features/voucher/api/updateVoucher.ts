import { axiosClient, getResponseData } from "../../../lib/axios";
import type { UpdateVoucherRequest, VoucherDetail } from "../types";

/**
 * PUT /api/vouchers/{id}
 * Cập nhật cấu hình voucher (chỉ cho phép khi voucher đang ở trạng thái Draft).
 */
export const updateVoucher = async (
  id: number,
  payload: UpdateVoucherRequest,
): Promise<VoucherDetail> => {
  return getResponseData(
    axiosClient.put<VoucherDetail>(`/api/vouchers/${id}`, payload),
  );
};
