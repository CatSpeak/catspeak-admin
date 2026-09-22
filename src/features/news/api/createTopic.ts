import { axiosClient, getResponseData } from "../../../lib/axios";
import type { CreateTopicPayload, Topic } from "../types";

/**
 * Create a new topic.
 */
export const createTopic = async (
  payload: CreateTopicPayload,
): Promise<Topic> => {
  return getResponseData(
    axiosClient.post<Topic>("/topics", payload),
  );
};
