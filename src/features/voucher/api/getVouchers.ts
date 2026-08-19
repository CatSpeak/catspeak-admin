import { axiosClient, getResponseData } from "../../../lib/axios"
import type { GetVouchersParams, VoucherListResponse } from "../types"

/**
 * Lấy danh sách voucher hỗ trợ tìm kiếm, lọc theo nhiều tiêu chí và phân trang.
 */
export const getVouchers = async (
  params: GetVouchersParams = {},
): Promise<VoucherListResponse> => {
  const {
    page = 1,
    pageSize = 10,
    search,
    status,
    discountType,
    sponsorType,
  } = params

  const queryParams: Record<string, unknown> = {
    Page: page,
    PageSize: pageSize,
  }

  if (search && search.trim().length > 0) {
    queryParams.Search = search.trim()
  }
  if (status) {
    queryParams.Status = status
  }
  if (discountType) {
    queryParams.DiscountType = discountType
  }
  if (sponsorType) {
    queryParams.SponsorType = sponsorType
  }

  return getResponseData(
    axiosClient.get<VoucherListResponse>("/vouchers", {
      params: queryParams,
    }),
  )
}
