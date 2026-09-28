import { axiosClient, getResponseData } from "../../../lib/axios";
import type { GetPostResponse, UpdatePostPayload } from "../types";

/**
 * Update an existing news post.
 */
export const updatePost = async (
  payload: UpdatePostPayload,
): Promise<GetPostResponse> => {
  const { id, ...body } = payload;
  const formData = new FormData();
  if (body.Title) {
    formData.append("Title", body.Title);
  }
  formData.append("Content", body.Content);
  formData.append("Privacy", body.Privacy);
  
  if (body.Slug) {
    formData.append("Slug", body.Slug);
  } 
  if (body.LanguageCommunity) {
    formData.append("LanguageCommunity", body.LanguageCommunity);
  }

  // Append updated topic IDs
  const topicIds = body.TopicIds || body.topicIds;
  if (topicIds && topicIds.length > 0) {
    topicIds.forEach((topicId) => {
      formData.append("TopicIds", String(topicId));
    });
  }

  // Append newly added files (NewFiles)
  const newFiles = body.NewFiles || body.Files;
  if (newFiles && newFiles.length > 0) {
    newFiles.forEach((file) => formData.append("NewFiles", file));
  }

  // Append IDs of server media to remove (RemovedMediaIds)
  const removedMediaIds = body.RemovedMediaIds || body.DeletedMediaIds;
  if (removedMediaIds && removedMediaIds.length > 0) {
    removedMediaIds.forEach((mediaId) =>
      formData.append("RemovedMediaIds", String(mediaId)),
    );
  }

  return getResponseData(
    axiosClient.put<GetPostResponse>(`/post/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  );
};
