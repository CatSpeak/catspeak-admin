import { axiosClient, getResponseData } from "../../../lib/axios";
import type { IncreaseVoucherLimitRequest } from "../types";

/**
 * POST /api/vouchers/{id}/increase-limit
 * Tăng tổng lượt sử dụng khi voucher hết lượt.
 */
export const increaseVoucherLimit = async (
  id: number,
  payload: IncreaseVoucherLimitRequest,
): Promise<void> => {
  await getResponseData(
    axiosClient.post<void>(`/api/vouchers/${id}/increase-limit`, payload),
  );
};
