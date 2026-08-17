import { axiosClient, getResponseData } from "../../../lib/axios";

/**
 * DELETE /api/vouchers/{id}
 * Xóa voucher.
 */
export const deleteVoucher = async (id: number): Promise<void> => {
  await getResponseData(
    axiosClient.delete<void>(`/api/vouchers/${id}`),
  );
};
