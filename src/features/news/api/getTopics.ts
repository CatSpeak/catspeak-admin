import { axiosClient, getResponseData } from "../../../lib/axios";
import type { GetTopicsParams, GetTopicsResponse } from "../types";

/**
 * Fetch a paginated list of topics with optional filters.
 */
export const getTopics = async (
  params?: GetTopicsParams,
): Promise<GetTopicsResponse> => {
  return getResponseData(
    axiosClient.get<GetTopicsResponse>("/topics", {
      params,
    }),
  );
};
