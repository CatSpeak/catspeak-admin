import { axiosClient, getResponseData } from "../../../lib/axios"
import type { PointRedemptionHistoryDetailDto } from "../types"

/**
 * Lấy thông tin chi tiết của một giao dịch đổi điểm (Drawer / Modal Detail).
 * GET /admin/point-redemptions/history/{id}
 */
export const getPointRedemptionHistoryDetail = async (
  id: number,
): Promise<PointRedemptionHistoryDetailDto> => {
  return getResponseData(
    axiosClient.get<PointRedemptionHistoryDetailDto>(
      `/admin/point-redemptions/history/${id}`,
    ),
  )
}
