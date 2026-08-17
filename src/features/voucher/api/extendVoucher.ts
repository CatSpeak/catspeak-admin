import { axiosClient, getResponseData } from "../../../lib/axios";
import type { ExtendVoucherRequest } from "../types";

/**
 * POST /api/vouchers/{id}/extend
 * Gia hạn ngày hết hạn mới cho voucher CatSpeak.
 */
export const extendVoucher = async (
  id: number,
  payload: ExtendVoucherRequest,
): Promise<void> => {
  await getResponseData(
    axiosClient.post<void>(`/api/vouchers/${id}/extend`, payload),
  );
};
