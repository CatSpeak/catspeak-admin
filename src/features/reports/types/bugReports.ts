export type BugReportStatus = "pending" | "in_progress" | "resolved" | "closed"

export interface BugReportItem {
  id: string
  accountId?: number
  username?: string
  email?: string
  title: string
  category: string
  severity: string
  url: string
  status: BugReportStatus
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
  screenshots?: string | string[] // JSON string array of URLs, single URL, or decoded array (may include videos)
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
