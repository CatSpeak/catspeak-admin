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
  const formData = new FormData();
  if (body.Title) {
    formData.append("Title", body.Title);
  }
  formData.append("Content", body.Content);
  formData.append("Privacy", body.Privacy);

  return getResponseData(
    axiosClient.put<GetPostResponse>(`/post/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  );
};
