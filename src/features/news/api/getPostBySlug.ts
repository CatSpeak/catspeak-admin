import { axiosClient, getResponseData } from "../../../lib/axios";
import type { GetPostResponse } from "../types";

/**
 * Fetch a single post by its slug.
 */
export const getPostBySlug = async (slug: string): Promise<GetPostResponse> => {
  return getResponseData(
    axiosClient.get<GetPostResponse>(`/Post/slug/${slug}`),
  );
};
