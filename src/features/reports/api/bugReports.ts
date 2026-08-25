import { axiosClient, getResponseData } from "../../../lib/axios"
import type {
  BugReportItem,
  BugReportDetail,
  BugReportStats,
  GetBugReportsParams,
} from "../types"

export type {
  BugReportItem,
  BugReportDetail,
  BugReportStats,
  GetBugReportsParams,
  BugReportListResponse,
  BugReportStatus,
} from "../types"

export const getBugReports = async (
  params: GetBugReportsParams = {},
): Promise<{ data: BugReportItem[]; total: number }> => {
  const raw = await getResponseData<any>(
    axiosClient.get("/admin/bug-reports", {
      params,
    }),
  )

  const payload = raw?.data ?? raw
  const list = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload)
    ? payload
    : []

  const total =
    payload?.total_records ??
    payload?.additionalData?.totalCount ??
    payload?.totalCount ??
    payload?.total ??
    list.length

  return {
    data: list,
    total,
  }
}

export const getBugReportById = async (
  id: string,
): Promise<BugReportDetail> => {
  const raw = await getResponseData<any>(
    axiosClient.get(`/admin/bug-reports/${id}`),
  )
  return raw?.data ?? raw
}

export const updateBugReportStatus = async (
  id: string,
  payload: { status: string; adminNotes?: string },
): Promise<void> => {
  return getResponseData(
    axiosClient.patch(`/admin/bug-reports/${id}/status`, payload),
  )
}

export const getBugReportStats = async (): Promise<BugReportStats> => {
  const raw = await getResponseData<any>(
    axiosClient.get("/admin/bug-reports/stats"),
  )
  return raw?.data ?? raw
}
