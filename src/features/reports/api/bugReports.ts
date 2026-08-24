import { axiosClient, getResponseData } from "../../../lib/axios"

export interface BugReportItem {
  id: string
  accountId?: number
  username?: string
  email?: string
  title: string
  category: string
  severity: string
  url: string
  status: "pending" | "in_progress" | "resolved" | "closed"
  createdAt: string
  resolvedAt?: string
  hasConsoleErrors: boolean
  hasFailedRequests: boolean
}

export interface BugReportDetail extends BugReportItem {
  description: string
  userAgent?: string
  deviceInfo?: string // JSON string
  consoleLogs?: string // JSON string
  networkLogs?: string // JSON string
  screenshots?: string // JSON string array of URLs
  adminNotes?: string
}

export interface BugReportListResponse {
  data: BugReportItem[]
  total_records: number
  page: number
  pageSize: number
}

export interface BugReportStats {
  totalReports: number
  pendingCount: number
  inProgressCount: number
  resolvedCount: number
  closedCount: number
}

export interface GetBugReportsParams {
  pageNumber?: number
  pageSize?: number
  status?: string
  category?: string
  severity?: string
  searchKeyword?: string
  fromDate?: string
  toDate?: string
}

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
