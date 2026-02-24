import type { ReactNode } from "react";

export type Tab = "my_posts" | "create_new" | "manage";

export type PostStatus = "draft" | "published" | "scheduled" | "archived";

export interface ThumbnailImage {
  id: number;
  src: string;
  alt: string;
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
  title: string;
  content: string;
  status: PostStatus;
  community: string;
  tagIds: number[];
  thumbnailUrls: string[];
  publishAt: string | null;
}

export interface UpdatePostPayload extends Partial<CreatePostPayload> {
  id: number;
}

export interface PaginationData {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetPostsResponse {
  data: NewsPost[];
  additionalData: PaginationData;
}

export interface GetPostResponse {
  data: NewsPost;
}

export type ToolbarActionKey =
  | "bold"
  | "italic"
  | "underline"
  | "h1"
  | "h2"
  | "align"
  | "link"
  | "image"
  | "comment";

export type ToolbarItem =
  | { icon: ReactNode; key: ToolbarActionKey }
  | "divider";
