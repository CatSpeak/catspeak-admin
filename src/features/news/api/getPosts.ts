import { axiosClient, getResponseData } from "../../../lib/axios";
import type { GetPostsResponse } from "../types";

/**
 * Fetch paginated news posts.
 * Replace the endpoint URL with the actual backend route when available.
 */
export const getPosts = async (
  page: number = 1,
  pageSize: number = 10,
  status?: string,
): Promise<GetPostsResponse> => {
  return getResponseData(
    axiosClient.get<GetPostsResponse>("/admin/news", {
      params: { page, pageSize, status },
    }),
  );
};
