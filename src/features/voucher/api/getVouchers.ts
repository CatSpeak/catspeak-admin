import { axiosClient, getResponseData } from "../../../lib/axios"
import type { GetVouchersParams, GetVouchersResponse } from "../types"

/**
 * Lấy danh sách voucher hỗ trợ tìm kiếm, lọc theo nhiều tiêu chí và phân trang.
 */
export const getVouchers = async (
  params: GetVouchersParams = {},
): Promise<GetVouchersResponse> => {
  const {
    page = 1,
    pageSize = 10,
    search,
    status,
    discountType,
    sponsorType,
  } = params

  const queryParams: Record<string, unknown> = {
    page,
    pageSize,
  }

  if (search && search.trim().length > 0) {
    queryParams.search = search.trim()
  }
  if (status) {
    queryParams.status = status
  }
  if (discountType) {
    queryParams.discountType = discountType
  }
  if (sponsorType) {
    queryParams.sponsorType = sponsorType
  }

  return getResponseData(
    axiosClient.get<GetVouchersResponse>("/vouchers", {
      params: queryParams,
    }),
  )
}
