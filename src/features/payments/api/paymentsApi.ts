import { axiosClient, getResponseData } from "../../../lib/axios";

export type PaymentStatus = 0 | 1 | 2 | 3 | 4 | number;

export interface Payment {
  paymentId: number;
  userId: number;
  username: string;
  email: string;
  amount: number;
  method: string;
  paymentType?: string;
  createDate: string;
  status: PaymentStatus;
  orderCode: number | null;
  adminNote: string | null;
}

export interface GetPaymentsParams {
  Page?: number;
  PageSize?: number;
  Status?: number;
  Search?: string;
  FromDate?: string;
  ToDate?: string;
  UserId?: number;
  SortBy?: string;
  SortOrder?: "asc" | "desc" | "Asc" | "Desc";
  // CamelCase support
  page?: number;
  pageSize?: number;
  status?: number;
  search?: string;
  fromDate?: string;
  toDate?: string;
  userId?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | "Asc" | "Desc";
}

export interface GetPaymentsResponse {
  data: Payment[];
  total: number;
}

/**
 * Fetch all payments/transactions with pagination, filtering and sorting
 */
export const getPayments = async (
  params: GetPaymentsParams = {},
): Promise<GetPaymentsResponse> => {
  try {
    const response = await getResponseData(
      axiosClient.get<unknown>("/v1/Payments/admin/list", { params }),
    );

    if (Array.isArray(response)) {
      return {
        data: response as Payment[],
        total: response.length,
      };
    }

    if (response && typeof response === "object") {
      const responseData = response as Record<string, unknown>;
      const total =
        typeof responseData.total_records === "number"
          ? responseData.total_records
          : typeof responseData.totalCount === "number"
            ? responseData.totalCount
            : typeof responseData.total === "number"
              ? responseData.total
              : Array.isArray(responseData.data)
                ? responseData.data.length
                : Array.isArray(responseData.items)
                  ? responseData.items.length
                  : 0;

      if ("data" in responseData && Array.isArray(responseData.data)) {
        return {
          data: responseData.data as Payment[],
          total,
        };
      }
      if ("items" in responseData && Array.isArray(responseData.items)) {
        return {
          data: responseData.items as Payment[],
          total,
        };
      }
    }

    return { data: [], total: 0 };
  } catch (error) {
    console.error("Error fetching payments list:", error);
    throw error;
  }
};
