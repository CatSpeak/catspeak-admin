import { axiosClient, getResponseData } from "../../../lib/axios"
import type {
  GetPointRedemptionReportsParams,
  PointRedemptionReportsDto,
  ReportPeriod,
} from "../types"

/**
 * Lấy dữ liệu báo cáo & thống kê hiệu quả đổi điểm (Tab Báo cáo).
 * GET /admin/point-redemptions/reports
 */
export const getPointRedemptionReports = async (
  paramsOrPeriod?: GetPointRedemptionReportsParams | ReportPeriod | string,
): Promise<PointRedemptionReportsDto> => {
  let params: GetPointRedemptionReportsParams | undefined

  if (typeof paramsOrPeriod === "string") {
    params = { period: paramsOrPeriod }
  } else if (paramsOrPeriod) {
    params = paramsOrPeriod
  }

  return getResponseData(
    axiosClient.get<PointRedemptionReportsDto>(
      "/admin/point-redemptions/reports",
      {
        params,
      },
    ),
  )
}
