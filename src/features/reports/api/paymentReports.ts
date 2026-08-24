import { axiosClient, getResponseData } from "../../../lib/axios"

// 0: Pending, 1: Accepted, 2: Denied (based on backend enum)
export type PaymentReportStatus = 0 | 1 | 2

export interface PaymentReport {
  reportId: number
  paymentId: number
  paymentType?: string
  userId: number
  username: string
  email: string
  amount: number
  userExplanation: string
  proofUrl: string | null
  createDate: string
  status: PaymentReportStatus
  adminResponseReason: string | null
  processedBy: string | null
  processedAt: string | null
}

export interface ProcessReportPayload {
  action: "Accept" | "Deny"
  reason: string
}

export type PaymentReportSortBy = "ReportDate" | "Amount" | "Status"
export type SortOrder = "Asc" | "Desc"

export interface GetPaymentReportsParams {
  SearchKeyword?: string
  UserEmail?: string
  MaxAmount?: number
  Statuses?: number[]
  PaymentTypes?: string[]
  SortBy?: PaymentReportSortBy
  Reason?: string
  FromDate?: string
  ToDate?: string
  Page?: number
  PageSize?: number
  SortOrder?: SortOrder
}

export type PaymentReportStatusFilter =
  | "Pending"
  | "Accepted"
  | "Denied"
  | "All"
  | null

/**
 * Fetch payment reports from the backend.
 * Accepts either a GetPaymentReportsParams object or legacy statusFilter string.
 */
export const getPaymentReports = async (
  paramsOrStatusFilter?: GetPaymentReportsParams | PaymentReportStatusFilter,
): Promise<PaymentReport[]> => {
  let params: GetPaymentReportsParams = {}

  if (
    paramsOrStatusFilter === null ||
    paramsOrStatusFilter === undefined ||
    typeof paramsOrStatusFilter === "string"
  ) {
    const statusFilter = paramsOrStatusFilter as PaymentReportStatusFilter
    if (statusFilter && statusFilter !== "All") {
      if (statusFilter === "Pending") params.Statuses = [0]
      else if (statusFilter === "Accepted") params.Statuses = [1]
      else if (statusFilter === "Denied") params.Statuses = [2]
    }
  } else {
    params = paramsOrStatusFilter
  }

  try {
    const response = await getResponseData(
      axiosClient.get<unknown>("/v1/Payments/admin/reports", { params }),
    )

    // Defensive parsing for various backend payload patterns:
    if (Array.isArray(response)) {
      return response as PaymentReport[]
    }
    if (response && typeof response === "object") {
      const responseData = response as Record<string, unknown>
      if ("data" in responseData && Array.isArray(responseData.data)) {
        return responseData.data as PaymentReport[]
      }
      if ("items" in responseData && Array.isArray(responseData.items)) {
        return responseData.items as PaymentReport[]
      }
    }
    return []
  } catch (error) {
    console.error("Error fetching payment reports:", error)
    throw error
  }
}

/**
 * Process a specific payment report (Accept / Deny) with a reason.
 */
export const processPaymentReport = async (
  reportId: string | number,
  payload: ProcessReportPayload,
): Promise<void> => {
  await getResponseData(
    axiosClient.post<void>(
      `/v1/Payments/admin/reports/${reportId}/process`,
      payload,
    ),
  )
}

export interface Payment {
  paymentId: number
  userId: number
  username: string
  email: string
  amount: number
  method: string
  paymentType?: string
  createDate: string
  status: number
  orderCode: number | null
  adminNote: string | null
}

export interface GetPaymentsParams {
  status?: number
  fromDate?: string
  toDate?: string
  search?: string
  userId?: number
}

export const getPayments = async (params: GetPaymentsParams = {}): Promise<Payment[]> => {
  try {
    const response = await getResponseData(
      axiosClient.get<unknown>("/v1/Payments/admin/list", { params }),
    )
    if (Array.isArray(response)) {
      return response as Payment[]
    }
    if (response && typeof response === "object") {
      const responseData = response as Record<string, unknown>
      if ("data" in responseData && Array.isArray(responseData.data)) {
        return responseData.data as Payment[]
      }
      if ("items" in responseData && Array.isArray(responseData.items)) {
        return responseData.items as Payment[]
      }
    }
    return []
  } catch (error) {
    console.error("Error fetching payments:", error)
    throw error
  }
}
