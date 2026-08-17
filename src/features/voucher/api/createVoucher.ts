import { axiosClient, getResponseData } from "../../../lib/axios";
import type { CreateVoucherRequest, VoucherDetail } from "../types";

/**
 * POST /api/vouchers
 * Tạo mới voucher hoặc lưu dưới dạng bản nháp.
 */
export const createVoucher = async (
  payload: CreateVoucherRequest,
): Promise<VoucherDetail> => {
  return getResponseData(
    axiosClient.post<VoucherDetail>("/api/vouchers", payload),
  );
};
