import { axiosClient, getResponseData } from "../../../lib/axios";
import type {
  GetInstructorRevisionsResponse,
  RevisionRequestType,
  RevisionStatus,
} from "../types";

export interface GetInstructorRevisionsParams {
  page?: number;
  pageSize?: number;
  SearchKeyword?: string;
  search?: string;
  status?: RevisionStatus | "";
  requestType?: RevisionRequestType | "";
}

export const getInstructorRevisions = async (
  params: GetInstructorRevisionsParams = {},
): Promise<GetInstructorRevisionsResponse> => {
  const { page = 1, pageSize = 20, search, SearchKeyword, status, requestType } = params;
  const keyword = SearchKeyword ?? search;
  return getResponseData(
    axiosClient.get<GetInstructorRevisionsResponse>(
      "/Admin/instructor-revisions",
      {
        params: {
          page,
          pageSize,
          ...(keyword ? { SearchKeyword: keyword, search: keyword } : {}),
          ...(status ? { status } : {}),
          ...(requestType !== undefined && requestType !== "" ? { requestType } : {}),
        },
      },
    ),
  );
};