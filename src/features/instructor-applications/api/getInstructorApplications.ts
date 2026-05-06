import { axiosClient, getResponseData } from "../../../lib/axios";
import type { GetInstructorApplicationsResponse, ApplicationStatus } from "../types";

export interface GetInstructorApplicationsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ApplicationStatus | "";
}

export const getInstructorApplications = async (
  params: GetInstructorApplicationsParams = {},
): Promise<GetInstructorApplicationsResponse> => {
  const { page = 1, pageSize = 20, search, status } = params;
  return getResponseData(
    axiosClient.get<GetInstructorApplicationsResponse>(
      "/Admin/instructor-profiles",
      {
        params: {
          page,
          pageSize,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
        },
      },
    ),
  );
};
