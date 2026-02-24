import { axiosClient, getResponseData } from "../../../lib/axios";

/**
 * Delete a news post by ID.
 * Replace the endpoint URL with the actual backend route when available.
 */
export const deletePost = async (id: number): Promise<void> => {
  return getResponseData(axiosClient.delete<void>(`/admin/news/${id}`));
};
