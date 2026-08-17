import { axiosClient, getResponseData } from "../../../lib/axios";
import type { VoucherDetail } from "../types";

/**
 * GET /api/vouchers/{id}
 * Lấy chi tiết cấu hình voucher, thông tin cọc/đối soát (Deposit & Escrow) và thống kê hiệu suất nhanh.
 */
export const getVoucherDetail = async (id: number): Promise<VoucherDetail> => {
  return getResponseData(
    axiosClient.get<VoucherDetail>(`/api/vouchers/${id}`),
  );
};
