export type PostStatus = "draft" | "published" | "scheduled" | "archived";

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
  Privacy: "Public" | "FriendsOnly" | "Private";
  Files?: File[];
}

export interface UpdatePostPayload {
  id: number;
  Title?: string;
  Content: string;
  Privacy: "Public" | "FriendsOnly" | "Private";
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
}

export interface GetPostsResponse {
  data: Post[];
  page: number;
  pageSize: number;
}

export interface GetPostResponse {
  message?: string;
  data: Post;
}
