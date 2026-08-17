import { axiosClient, getResponseData } from "../../../lib/axios"
import type { GetVoucherUsagesParams, GetVoucherUsagesResponse } from "../types"

/**
 * Lấy danh sách lịch sử học viên đã sử dụng voucher.
 */
export const getVoucherUsages = async (
  id: number,
  params: GetVoucherUsagesParams = {},
): Promise<GetVoucherUsagesResponse> => {
  const { page = 1, pageSize = 10, search, status } = params

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

  return getResponseData(
    axiosClient.get<GetVoucherUsagesResponse>(`/vouchers/${id}/usages`, {
      params: queryParams,
    }),
  )
}
