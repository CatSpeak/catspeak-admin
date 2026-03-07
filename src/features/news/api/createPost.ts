import { axiosClient, getResponseData } from "../../../lib/axios";
import type { GetPostResponse, CreatePostPayload } from "../types";

/**
 * Create a new news post.
 * Replace the endpoint URL with the actual backend route when available.
 */
export const createPost = async (
  payload: CreatePostPayload,
): Promise<GetPostResponse> => {
  const formData = new FormData();
  formData.append("Title", payload.Title);
  formData.append("Content", payload.Content);
  formData.append("Privacy", payload.Privacy);

  if (payload.Files && payload.Files.length > 0) {
    payload.Files.forEach((file) => {
      formData.append("Files", file);
    });
  }

  return getResponseData(
    axiosClient.post<GetPostResponse>("/post", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  );
};
