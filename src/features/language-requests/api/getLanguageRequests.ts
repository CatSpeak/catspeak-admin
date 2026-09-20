import { axiosClient, getResponseData } from "../../../lib/axios";
import type {
  GetLanguageRequestsResponse,
  LanguageRequestType,
} from "../types";

export interface GetLanguageRequestsParams {
  page?: number;
  pageSize?: number;
  SearchKeyword?: string;
  search?: string;
  /** 0=Pending, 1=Approved, 2=Rejected, 3=Cancelled. */
  status?: number;
  /** 0=Add, 1=Update. */
  requestType?: LanguageRequestType | "";
}

export const getLanguageRequests = async (
  params: GetLanguageRequestsParams = {},
): Promise<GetLanguageRequestsResponse> => {
  const { page = 1, pageSize = 20, search, SearchKeyword, status, requestType } = params;
  const keyword = SearchKeyword ?? search;
  return getResponseData(
    axiosClient.get<GetLanguageRequestsResponse>(
      "/Admin/language-requests",
      {
        params: {
          page,
          pageSize,
          ...(keyword ? { SearchKeyword: keyword, search: keyword } : {}),
          ...(status !== undefined && status !== null ? { status } : {}),
          ...(requestType !== undefined && requestType !== "" ? { requestType } : {}),
        },
      },
    ),
  );
};
