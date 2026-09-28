import { axiosClient, getResponseData } from "../../../lib/axios";
import type { GetPostsResponse } from "../types";

export type PostSortBy = "Title" | "CreateDate";
export type SortOrder = "Asc" | "Desc";

export interface GetPostsParams {
  SearchKeyword?: string;
  Title?: string;
  Content?: string;
  FromDate?: string;
  ToDate?: string;
  LanguageCommunities?: string[];
  AuthorId?: number;
  IsPublished?: boolean;
  SortBy?: PostSortBy;
  Page?: number;
  PageSize?: number;
  SortOrder?: SortOrder;
  TopicIds?: number[];
  topicIds?: number[];
}

/**
 * Fetch paginated news posts.
 * Accepts either a GetPostsParams object or legacy (page, pageSize) positional arguments.
 */
export const getPosts = async (
  paramsOrPage: GetPostsParams | number = 1,
  pageSizeParam?: number,
): Promise<GetPostsResponse> => {
  let params: GetPostsParams;

  if (typeof paramsOrPage === "number") {
    params = {
      Page: paramsOrPage,
      PageSize: pageSizeParam ?? 10,
    };
  } else {
    const { topicIds, TopicIds, ...rest } = paramsOrPage;
    const finalTopicIds = TopicIds || topicIds;

    params = {
      Page: 1,
      PageSize: 10,
      ...rest,
      ...(finalTopicIds && finalTopicIds.length > 0
        ? { TopicIds: finalTopicIds, topicIds: finalTopicIds }
        : {}),
    };
  }

  return getResponseData(
    axiosClient.get<GetPostsResponse>("/post", {
      params,
    }),
  );
};
