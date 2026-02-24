import { axiosClient, getResponseData } from "../../../lib/axios";
import type { GetPostResponse, UpdatePostPayload } from "../types";

/**
 * Update an existing news post.
 * Replace the endpoint URL with the actual backend route when available.
 */
export const updatePost = async (
  payload: UpdatePostPayload,
): Promise<GetPostResponse> => {
  const { id, ...body } = payload;
  return getResponseData(
    axiosClient.put<GetPostResponse>(`/admin/news/${id}`, body),
  );
};
