import { axiosClient, getResponseData } from "../../../lib/axios";

// 0: Pending, 1: Approved, 2: Rejected, 3: Failed
export type RefundStatus = 0 | 1 | 2 | 3;

export interface PaymentRefund {
  refundId: number;
  paymentId: number;
  userId: number;
  username: string;
  email: string;
  amountVnd: number;
  paymentType: string;
  bankBin: string;
  accountNumber: string;
  accountHolderName: string;
  reason: string;
  status: RefundStatus;
  payOSReferenceId: string | null;
  adminResponseReason: string | null;
  processedBy: string | null;
  createDate: string;
  processedAt: string | null;
}

export interface GetRefundsParams {
  page?: number;
  pageSize?: number;
  status?: RefundStatus | number;
  search?: string;
  fromDate?: string;
  toDate?: string;
}

export interface RefundsPaginationAdditionalData {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetRefundsResponse {
  total_records?: number;
  page?: number;
  pageSize?: number;
  data: PaymentRefund[];
  additionalData?: RefundsPaginationAdditionalData;
}

export interface ProcessRefundPayload {
  action: "Approve" | "Reject";
  reason: string;
}

export interface ProcessRefundResponse {
  success: boolean;
  message: string;
}

export interface PayoutBalanceData {
  accountNumber: string;
  accountName: string;
  currency: string;
  balance: string;
}

export interface PayoutBalanceResponse {
  code: string;
  desc: string;
  data?: PayoutBalanceData;
}

/**
 * Fetch list of refund requests with pagination and status filters.
 */
export const getRefunds = async (
  params?: GetRefundsParams
): Promise<GetRefundsResponse> => {
  try {
    const response = await getResponseData(
      axiosClient.get<unknown>("/v1/admin/refunds", { params })
    );

    // Defensive parsing for backend response shapes
    if (Array.isArray(response)) {
      return {
        total_records: response.length,
        page: 1,
        pageSize: response.length,
        data: response as PaymentRefund[],
      };
    }

    if (response && typeof response === "object") {
      const resObj = response as Record<string, unknown>;

      let items: PaymentRefund[] = [];
      if (Array.isArray(resObj.data)) {
        items = resObj.data as PaymentRefund[];
      } else if (Array.isArray(resObj.items)) {
        items = resObj.items as PaymentRefund[];
      }

      return {
        total_records:
          typeof resObj.total_records === "number"
            ? resObj.total_records
            : items.length,
        page: typeof resObj.page === "number" ? resObj.page : 1,
        pageSize: typeof resObj.pageSize === "number" ? resObj.pageSize : 10,
        data: items,
        additionalData: resObj.additionalData as RefundsPaginationAdditionalData,
      };
    }

    return { data: [] };
  } catch (error) {
    console.error("Error fetching refunds:", error);
    throw error;
  }
};

/**
 * Process a refund request (Approve or Reject).
 * When approving, backend automatically triggers PayOS Payout API.
 */
export const processRefund = async (
  refundId: number | string,
  payload: ProcessRefundPayload
): Promise<ProcessRefundResponse> => {
  const response = await getResponseData(
    axiosClient.post<ProcessRefundResponse>(
      `/v1/admin/refunds/${refundId}/process`,
      payload
    )
  );
  return response;
};

/**
 * Get current PayOS payout account balance details.
 */
export const getPayoutBalance = async (): Promise<PayoutBalanceResponse> => {
  const response = await getResponseData(
    axiosClient.get<PayoutBalanceResponse>("/v1/admin/refunds/payout-balance")
  );
  return response;
};
