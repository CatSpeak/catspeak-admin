import { axiosClient, getResponseData } from "../../../lib/axios";
import type { GetPostResponse, CreatePostPayload } from "../types";

/**
 * Create a new news post.
 * Replace the endpoint URL with the actual backend route when available.
 */
export const createPost = async (
  payload: CreatePostPayload,
): Promise<GetPostResponse> => {
  return getResponseData(
    axiosClient.post<GetPostResponse>("/admin/news", payload),
  );
};
