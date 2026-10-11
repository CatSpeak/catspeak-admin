import { axiosClient, getResponseData } from "../../../lib/axios"
import type {
  ExportPointRedemptionReportsParams,
  ReportPeriod,
} from "../types"

/**
 * Xuất bản in báo cáo hiệu quả đổi điểm ra file PDF (Blob).
 * GET /admin/point-redemptions/reports/export-pdf
 */
export const exportPointRedemptionReportsPdf = async (
  paramsOrPeriod?: ExportPointRedemptionReportsParams | ReportPeriod | string,
): Promise<Blob> => {
  let params: ExportPointRedemptionReportsParams | undefined

  if (typeof paramsOrPeriod === "string") {
    params = { period: paramsOrPeriod }
  } else if (paramsOrPeriod) {
    params = paramsOrPeriod
  }

  return getResponseData(
    axiosClient.get<Blob>(
      "/admin/point-redemptions/reports/export-pdf",
      {
        params,
        responseType: "blob",
      },
    ),
  )
}
