import { axiosClient, getResponseData } from "../../../lib/axios"
import type {
  GetPointRedemptionHistoryParams,
  GetPointRedemptionHistoryResponse,
} from "../types"

/**
 * Lấy danh sách phân trang lịch sử giao dịch đổi điểm của học viên (Tab Lịch sử).
 * GET /admin/point-redemptions/history
 */
export const getPointRedemptionHistory = async (
  paramsOrPage: GetPointRedemptionHistoryParams | number = 1,
  pageSizeParam?: number,
): Promise<GetPointRedemptionHistoryResponse> => {
  let params: GetPointRedemptionHistoryParams

  if (typeof paramsOrPage === "number") {
    params = {
      page: paramsOrPage,
      pageSize: pageSizeParam ?? 10,
    }
  } else {
    params = {
      page: 1,
      pageSize: 10,
      ...paramsOrPage,
    }
  }

  return getResponseData(
    axiosClient.get<GetPointRedemptionHistoryResponse>(
      "/admin/point-redemptions/history",
      {
        params,
      },
    ),
  )
}
