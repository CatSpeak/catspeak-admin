import { axiosClient, getResponseData } from "../../../lib/axios";
import type { RejectVoucherRequest } from "../types";

/**
 * POST /api/vouchers/{id}/reject
 * Admin từ chối & hủy voucher -> Lưu lý do từ chối, chuyển trạng thái sang Rejected.
 */
export const rejectVoucher = async (
  id: number,
  payload: RejectVoucherRequest,
): Promise<void> => {
  await getResponseData(
    axiosClient.post<void>(`/api/vouchers/${id}/reject`, payload),
  );
};
