export type ReelPrivacy = "Public" | "FriendsOnly" | "Private";

// Mapped statuses for the frontend UI display
export type ReelStatus = "Published" | "Draft" | "Processing" | "Failed";
export type ChallengeStatusFilter = "All" | "Active" | "Upcoming" | "Completed";

export interface ChallengeDto {
  challengeId: number;
  hashtag?: string | null;
  name?: string | null;
  description?: string | null;
  bannerUrl?: string | null;
  startDate: string;
  endDate: string;
  status?: string | null;
  createdAt?: string;
}

export interface ChallengeCreateDto {
  hashtag: string;
  name: string;
  description: string;
  bannerFile?: File | null;
  startDate: string;
  endDate: string;
}

export interface ChallengeResponseDto {
  message?: string | null;
  data?: ChallengeDto | null;
}

export interface ReelDto {
  reelId: number;
  accountId?: number | null;
  username?: string | null;
  avatarUrl?: string | null;
  nickname?: string | null;
  title?: string | null;
  description?: string | null;
  videoUrl?: string | null;
  coverUrl?: string | null;
  privacy: ReelPrivacy;
  source?: string | null;
  status?: string | null; // e.g. "Public", "Private", "Blocked", "Warned"
  blockReason?: string | null;
  viewCount: number;
  createdAt: string;
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
  hashtags?: string[] | null;
  connectedChallenges?: ChallengeDto[] | null;

  // Custom local field for simulated fields like duration or scheduled dates
  duration?: number; // duration in seconds
  scheduledAt?: string | null; // scheduled publish date ISO string
}

export interface WarnOrBlockReelDto {
  status: "Public" | "Private" | "Blocked" | "Warned";
  blockReason?: string | null;
}

export interface UploadReelPayload {
  Title: string;
  Description: string;
  Privacy: ReelPrivacy;
  VideoFile: File;
  CoverFile?: File | null;
  Tags?: string[];
  ScheduledAt?: string | null;
}

export interface UpdateReelMetadataPayload {
  title?: string;
  description?: string;
  privacy?: ReelPrivacy;
  tags?: string[];
  coverUrl?: string;
  scheduledAt?: string | null;
}

export interface ActionResponseDto {
  success?: boolean;
  message?: string | null;
}

export interface ReelResponseDto {
  message?: string | null;
  data?: ReelDto | null;
}

export interface ReelFilterParams {
  search: string;
  status: ReelStatus | "All";
  startDate: string | null;
  endDate: string | null;
  sortBy: "createdAt" | "viewCount" | "duration" | "title";
  sortOrder: "asc" | "desc";
}
