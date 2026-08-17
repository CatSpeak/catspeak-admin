import { axiosClient, getResponseData } from "../../../lib/axios";

/**
 * POST /api/vouchers/{id}/approve-deposit
 * Admin xác nhận đã nhận tiền cọc -> ghi nhận cọc, chuyển trạng thái sang Active.
 */
export const approveVoucherDeposit = async (id: number): Promise<void> => {
  await getResponseData(
    axiosClient.post<void>(`/api/vouchers/${id}/approve-deposit`),
  );
};
