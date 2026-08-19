import { axiosClient, getResponseData } from "../../../lib/axios"
import type {
  GetVoucherUsagesParams,
  VoucherUsageListResponse,
} from "../types"

/**
 * Lấy danh sách lịch sử học viên đã sử dụng voucher.
 */
export const getVoucherUsages = async (
  id: number,
  params: GetVoucherUsagesParams = {},
): Promise<VoucherUsageListResponse> => {
  const { page = 1, pageSize = 10, search, status } = params

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

  return getResponseData(
    axiosClient.get<VoucherUsageListResponse>(`/vouchers/${id}/usages`, {
      params: queryParams,
    }),
  )
}
