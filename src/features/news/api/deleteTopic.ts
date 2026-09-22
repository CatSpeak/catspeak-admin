import { axiosClient, getResponseData } from "../../../lib/axios";

/**
 * Delete a topic by its ID.
 */
export const deleteTopic = async (topicId: number): Promise<void> => {
  return getResponseData(
    axiosClient.delete<void>(`/topics/${topicId}`),
  );
};
