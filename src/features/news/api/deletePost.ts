import { axiosClient, getResponseData } from "../../../lib/axios";

/**
 * Delete a news post by ID (also deletes associated PostTopic records).
 */
export const deletePost = async (id: number): Promise<void> => {
  return getResponseData(axiosClient.delete<void>(`/post/${id}`));
};
