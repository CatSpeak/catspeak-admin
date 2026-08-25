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

export interface PaymentSummary {
  total?: number;
  success?: number;
  failed?: number;
  pending?: number;
  refunded?: number;
  cancelled?: number;
  subscription?: number;
  classOpeningFee?: number;
  classEnrollment?: number;
  [key: string]: number | undefined;
}

export interface GetPaymentsParams {
  Page?: number;
  PageSize?: number;
  Status?: number;
  PaymentType?: string;
  Search?: string;
  FromDate?: string;
  ToDate?: string;
  UserId?: number;
  SortBy?: string;
  SortOrder?: "asc" | "desc" | "Asc" | "Desc";
  // Lower camelCase aliases
  page?: number;
  pageSize?: number;
  status?: number;
  paymentType?: string;
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
  summary?: PaymentSummary;
}

/**
 * Fetch all payments/transactions with pagination, filtering and sorting
 */
export const getPayments = async (
  params: GetPaymentsParams = {},
): Promise<GetPaymentsResponse> => {
  try {
    const queryParams: Record<string, unknown> = {};
    const page = params.Page ?? params.page;
    const pageSize = params.PageSize ?? params.pageSize;
    const status = params.Status ?? params.status;
    const paymentType = params.PaymentType ?? params.paymentType;
    const search = params.Search ?? params.search;
    const fromDate = params.FromDate ?? params.fromDate;
    const toDate = params.ToDate ?? params.toDate;
    const userId = params.UserId ?? params.userId;
    const sortBy = params.SortBy ?? params.sortBy;
    const sortOrder = params.SortOrder ?? params.sortOrder;

    if (page !== undefined) queryParams.Page = page;
    if (pageSize !== undefined) queryParams.PageSize = pageSize;
    if (status !== undefined && status !== null) queryParams.Status = status;
    if (paymentType) queryParams.PaymentType = paymentType;
    if (search) queryParams.Search = search;
    if (fromDate) queryParams.FromDate = fromDate;
    if (toDate) queryParams.ToDate = toDate;
    if (userId !== undefined) queryParams.UserId = userId;
    if (sortBy) queryParams.SortBy = sortBy;
    if (sortOrder) queryParams.SortOrder = sortOrder;

    const response = await getResponseData(
      axiosClient.get<unknown>("/v1/Payments/admin/list", { params: queryParams }),
    );

    if (Array.isArray(response)) {
      return {
        data: response as Payment[],
        total: response.length,
      };
    }

    if (response && typeof response === "object") {
      const responseData = response as Record<string, unknown>;
      const additional = responseData.additionalData as
        | Record<string, unknown>
        | undefined;

      const summary = (additional?.summary || additional?.Summary) as
        | PaymentSummary
        | undefined;

      const total =
        typeof responseData.total_records === "number"
          ? responseData.total_records
          : typeof responseData.totalCount === "number"
            ? responseData.totalCount
            : typeof responseData.total === "number"
              ? responseData.total
              : typeof additional?.totalCount === "number"
                ? additional.totalCount
                : Array.isArray(responseData.data)
                  ? responseData.data.length
                  : Array.isArray(responseData.items)
                    ? responseData.items.length
                    : 0;

      let data: Payment[] = [];
      if ("data" in responseData && Array.isArray(responseData.data)) {
        data = responseData.data as Payment[];
      } else if ("items" in responseData && Array.isArray(responseData.items)) {
        data = responseData.items as Payment[];
      }

      return {
        data,
        total,
        summary,
      };
    }

    return { data: [], total: 0 };
  } catch (error) {
    console.error("Error fetching payments list:", error);
    throw error;
  }
};
