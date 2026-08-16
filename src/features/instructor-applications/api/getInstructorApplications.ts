import { axiosClient, getResponseData } from "../../../lib/axios";
import type {
  GetInstructorApplicationsResponse,
  ApplicationStatus,
} from "../types";

export interface GetInstructorApplicationsParams {
  page?: number;
  pageSize?: number;
  SearchKeyword?: string;
  search?: string;
  status?: ApplicationStatus | "";
}

export const getInstructorApplications = async (
  params: GetInstructorApplicationsParams = {},
): Promise<GetInstructorApplicationsResponse> => {
  const { page = 1, pageSize = 20, search, SearchKeyword, status } = params;
  const keyword = SearchKeyword ?? search;
  return getResponseData(
    axiosClient.get<GetInstructorApplicationsResponse>(
      "/Admin/instructor-profiles",
      {
        params: {
          page,
          pageSize,
          ...(keyword ? { SearchKeyword: keyword, search: keyword } : {}),
          ...(status ? { status } : {}),
        },
      },
    ),
  );
};
