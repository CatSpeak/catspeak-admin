import { axiosClient, getResponseData } from "../../../lib/axios"
import type {
  GetPointRedemptionItemsParams,
  GetPointRedemptionItemsResponse,
} from "../types"

/**
 * Lấy danh sách phân trang các mục đổi điểm với bộ lọc (Tab Danh mục).
 * GET /admin/point-redemptions
 */
export const getPointRedemptionItems = async (
  paramsOrPage: GetPointRedemptionItemsParams | number = 1,
  pageSizeParam?: number,
): Promise<GetPointRedemptionItemsResponse> => {
  let params: GetPointRedemptionItemsParams

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
    axiosClient.get<GetPointRedemptionItemsResponse>(
      "/admin/point-redemptions",
      {
        params,
      },
    ),
  )
}
