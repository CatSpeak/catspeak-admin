import { axiosClient, getResponseData } from "../../../lib/axios";

export type PaymentIssueType = "REPORT" | "REFUND";

export interface PaymentIssue {
  type: PaymentIssueType;
  id: number;
  paymentId: number;
  paymentType?: string;
  userId: number;
  username?: string;
  email?: string;
  amountVnd: number;
  reason: string;
  proofUrl?: string | null;
  bankBin?: string | null;
  accountNumber?: string | null;
  accountHolderName?: string | null;
  payOSReferenceId?: string | null;
  status: number;
  adminResponseReason?: string | null;
  processedBy?: string | null;
  processedAt?: string | null;
  createDate: string;
}

export interface GetPaymentIssuesParams {
  Page?: number;
  PageSize?: number;
  Type?: "ALL" | "REPORT" | "REFUND" | string;
  Status?: number;
  Search?: string;
  FromDate?: string;
  ToDate?: string;
  SortBy?: "date" | "amount" | "status" | string;
  SortOrder?: "asc" | "desc" | "Asc" | "Desc";
  // Lower camelCase aliases
  page?: number;
  pageSize?: number;
  type?: string;
  status?: number;
  search?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface GetPaymentIssuesResponse {
  data: PaymentIssue[];
  total_records: number;
  page: number;
  pageSize: number;
  additionalData?: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export const getPaymentIssues = async (
  params: GetPaymentIssuesParams = {},
): Promise<GetPaymentIssuesResponse> => {
  const queryParams: Record<string, unknown> = {};
  const page = params.Page ?? params.page;
  const pageSize = params.PageSize ?? params.pageSize;
  const type = params.Type ?? params.type;
  const status = params.Status ?? params.status;
  const search = params.Search ?? params.search;
  const fromDate = params.FromDate ?? params.fromDate;
  const toDate = params.ToDate ?? params.toDate;
  const sortBy = params.SortBy ?? params.sortBy;
  const sortOrder = params.SortOrder ?? params.sortOrder;

  if (page !== undefined) queryParams.Page = page;
  if (pageSize !== undefined) queryParams.PageSize = pageSize;
  if (type && type !== "ALL") queryParams.Type = type;
  if (status !== undefined && status !== null) queryParams.Status = status;
  if (search) queryParams.Search = search;
  if (fromDate) queryParams.FromDate = fromDate;
  if (toDate) queryParams.ToDate = toDate;
  if (sortBy) queryParams.SortBy = sortBy;
  if (sortOrder) queryParams.SortOrder = sortOrder;

  const response = await getResponseData(
    axiosClient.get<unknown>("/v1/Payments/admin/issues", {
      params: queryParams,
    }),
  );

  if (response && typeof response === "object") {
    const res = response as Record<string, unknown>;
    const additional = res.additionalData as Record<string, unknown> | undefined;
    const total =
      typeof res.total_records === "number"
        ? res.total_records
        : typeof additional?.totalCount === "number"
          ? (additional.totalCount as number)
          : Array.isArray(res.data)
            ? res.data.length
            : 0;

    return {
      data: (Array.isArray(res.data) ? res.data : []) as PaymentIssue[],
      total_records: total,
      page: (res.page as number) ?? 1,
      pageSize: (res.pageSize as number) ?? 10,
      additionalData: additional as GetPaymentIssuesResponse["additionalData"],
    };
  }

  return { data: [], total_records: 0, page: 1, pageSize: 10 };
};
