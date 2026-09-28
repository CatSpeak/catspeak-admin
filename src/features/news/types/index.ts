export type PostStatus = "draft" | "published" | "scheduled" | "archived";

export const LanguageCommunityEnum = {
  All: 0,
  Eng: 1,
  Chinese: 2,
  Japanese: 3,
} as const;

export type LanguageCommunityNumber =
  (typeof LanguageCommunityEnum)[keyof typeof LanguageCommunityEnum];

export type LanguageCommunity = "All" | "English" | "Chinese" | "Japanese";

export interface Topic {
  topicId: number;
  title: string;
  slug: string;
  languageCommunity: LanguageCommunityNumber | LanguageCommunity | number;
}

export type Topics = Topic;

export interface PostTopic {
  topicId: number;
  postId: number;
}

export interface GetTopicsParams {
  languageCommunity?: LanguageCommunityNumber | LanguageCommunity | number;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface GetTopicsResponse {
  data: Topic[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface CreateTopicPayload {
  title: string;
  languageCommunity: LanguageCommunityNumber | LanguageCommunity | number;
  slug: string;
}

export interface UpdateTopicPayload {
  topicId: number;
  title: string;
  languageCommunity: LanguageCommunityNumber | LanguageCommunity | number;
  slug: string;
}

export interface ThumbnailImage {
  id: string | number;
  src: string;
  alt: string;
  file?: File;
}

export interface TagItem {
  id: number;
  label: string;
}

export interface EditHistoryEntry {
  id: number;
  label: string;
  isCurrent: boolean;
  savedAt: string; // ISO date string from API
}

export interface NewsPost {
  id: number;
  title: string;
  content: string;
  status: PostStatus;
  community: string;
  tags: TagItem[];
  thumbnails: ThumbnailImage[];
  publishAt: string | null; // ISO date string, null = not scheduled
  createdAt: string;
  updatedAt: string;
  authorId: string;
}

export interface CreatePostPayload {
  Title: string;
  Content: string;
  Privacy: "Public" | "Private";
  Slug?: string;
  LanguageCommunity: "All" | "English" | "Chinese" | "Japanese";
  Files?: File[];
  TopicIds?: number[];
  topicIds?: number[];
}

export interface UpdatePostPayload {
  id: number;
  Title?: string;
  Content: string;
  Privacy: "Public" | "Private";
  Slug?: string;
  LanguageCommunity?: "All" | "English" | "Chinese" | "Japanese";
  NewFiles?: File[];
  Files?: File[];
  RemovedMediaIds?: number[];
  DeletedMediaIds?: number[];
  TopicIds?: number[];
  topicIds?: number[];
}

export interface PostMedia {
  postMediaId: number;
  mediaUrl: string;
  mediaType: string;
  orderIndex: number;
}

export interface Post {
  postId: number;
  accountId: number;
  title?: string;
  Title?: string;
  authorName: string;
  avatarUrl: string;
  content: string;
  privacy: string;
  createDate: string;
  lastEdited: string;
  totalReactions: number;
  currentUserReaction: string | null;
  media: PostMedia[];
  slug: string;
  totalComments: number;
  viewCount: number;
  shareCount: number;
  languageCommunity: string | null;
  topics?: Topic[];
}

export interface PostAdditionalData {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetPostsResponse {
  data: Post[];
  page: number;
  pageSize: number;
  total_records: number;
  additionalData: PostAdditionalData;
}

export interface GetPostResponse {
  message?: string;
  data: Post;
}
