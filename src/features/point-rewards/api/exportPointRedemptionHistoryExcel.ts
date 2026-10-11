import { axiosClient, getResponseData } from "../../../lib/axios"
import type { ExportPointRedemptionHistoryParams } from "../types"

/**
 * Xuất danh sách lịch sử giao dịch đổi điểm ra file Excel (Blob).
 * GET /admin/point-redemptions/history/export-excel
 */
export const exportPointRedemptionHistoryExcel = async (
  params?: ExportPointRedemptionHistoryParams,
): Promise<Blob> => {
  return getResponseData(
    axiosClient.get<Blob>(
      "/admin/point-redemptions/history/export-excel",
      {
        params,
        responseType: "blob",
      },
    ),
  )
}
