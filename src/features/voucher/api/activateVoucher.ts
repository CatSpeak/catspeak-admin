import { axiosClient, getResponseData } from "../../../lib/axios";

/**
 * POST /api/vouchers/{id}/activate
 * Kích hoạt lại voucher (từ Disabled, Draft, Expired).
 */
export const activateVoucher = async (id: number): Promise<void> => {
  await getResponseData(
    axiosClient.post<void>(`/api/vouchers/${id}/activate`),
  );
};
