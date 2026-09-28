import { axiosClient, getResponseData } from "../../../lib/axios";
import type { GetPostResponse } from "../types";

/**
 * Fetch a single post by its ID.
 */
export const getPostById = async (postId: number): Promise<GetPostResponse> => {
  return getResponseData(
    axiosClient.get<GetPostResponse>(`/post/${postId}`),
  );
};
