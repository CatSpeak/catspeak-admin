import { axiosClient, getResponseData } from "../../../lib/axios";

/**
 * POST /api/vouchers/{id}/disable
 * Tạm dừng / Vô hiệu hóa voucher đang Active.
 */
export const disableVoucher = async (id: number): Promise<void> => {
  await getResponseData(
    axiosClient.post<void>(`/api/vouchers/${id}/disable`),
  );
};
