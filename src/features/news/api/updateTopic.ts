import { axiosClient, getResponseData } from "../../../lib/axios";
import type { UpdateTopicPayload, Topic } from "../types";

/**
 * Update an existing topic by its ID.
 */
export const updateTopic = async (
  payload: UpdateTopicPayload,
): Promise<Topic> => {
  const { topicId, ...body } = payload;
  return getResponseData(
    axiosClient.put<Topic>(`/topics/${topicId}`, body),
  );
};
