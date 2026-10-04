import { axiosClient, getResponseData } from "../../../lib/axios"
import type { PointRedemptionSummaryDto } from "../types"

/**
 * Lấy tổng quan 4 chỉ số thống kê danh mục đổi điểm (Tab Danh mục).
 * GET /admin/point-redemptions/summary
 */
export const getPointRedemptionSummary = async (): Promise<PointRedemptionSummaryDto> => {
  return getResponseData(
    axiosClient.get<PointRedemptionSummaryDto>("/admin/point-redemptions/summary"),
  )
}
