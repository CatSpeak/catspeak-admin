import { axiosClient, getResponseData } from "../../../lib/axios";

// 0: Pending, 1: Accepted, 2: Denied (based on backend enum)
export type PaymentReportStatus = 0 | 1 | 2;

export interface PaymentReport {
  reportId: number;
  paymentId: number;
  userId: number;
  username: string;
  email: string;
  amount: number;
  userExplanation: string;
  proofUrl: string | null;
  createDate: string;
  status: PaymentReportStatus;
  adminResponseReason: string | null;
  processedBy: string | null;
  processedAt: string | null;
}

export interface ProcessReportPayload {
  action: "Accept" | "Deny";
  reason: string;
}

/**
 * Fetch payment reports from the backend, supporting status filtering.
 * Maps client tab string options ("Pending", "Accepted", "Denied") to backend status numbers (0, 1, 2).
 */
export const getPaymentReports = async (
  statusFilter?: "Pending" | "Accepted" | "Denied" | "All" | null
): Promise<PaymentReport[]> => {
  const params: Record<string, number> = {};

  if (statusFilter && statusFilter !== "All") {
    if (statusFilter === "Pending") params.status = 0;
    else if (statusFilter === "Accepted") params.status = 1;
    else if (statusFilter === "Denied") params.status = 2;
  }

  try {
    const response = await getResponseData(
      axiosClient.get<unknown>("/v1/Payments/admin/reports", { params })
    );

    // Defensive parsing for various backend payload patterns:
    if (Array.isArray(response)) {
      return response as PaymentReport[];
    }
    if (response && typeof response === "object") {
      const responseData = response as Record<string, unknown>;
      if ("data" in responseData && Array.isArray(responseData.data)) {
        return responseData.data as PaymentReport[];
      }
      if ("items" in responseData && Array.isArray(responseData.items)) {
        return responseData.items as PaymentReport[];
      }
    }
    return [];
  } catch (error) {
    console.error("Error fetching payment reports:", error);
    throw error;
  }
};

/**
 * Process a specific payment report (Accept / Deny) with a reason.
 */
export const processPaymentReport = async (
  reportId: string | number,
  payload: ProcessReportPayload
): Promise<void> => {
  await getResponseData(
    axiosClient.post<void>(`/v1/Payments/admin/reports/${reportId}/process`, payload)
  );
};

