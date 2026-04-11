// ── Room Types — matching real API response ──

export type RoomType = "OneToOne" | "Group";
export type LanguageType = "Chinese" | "English" | "Vietnamese";
export type RequiredLevel =
  | "HSK1" | "HSK2" | "HSK3" | "HSK4" | "HSK5" | "HSK6"
  | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type RoomCategory = "Other" | "Knowledge" | "Culture" | "Lifestyle" | "Growth";
export type RoomPrivacy = "Public" | "Private";
export type RoomTopic =
  | "Other" | "History" | "Science" | "Philosophy" | "Psychology"
  | "Politics" | "Space" | "Movies" | "Music" | "Art"
  | "Fashion" | "Culture" | "Books" | "Travel" | "Food"
  | "Nature" | "Relationships" | "Sports" | "Finance"
  | "Startups" | "Productivity";

/** Matches GET /api/rooms response item */
export interface Room {
  roomId: number;
  name: string;
  creatorId: number;
  createDate: string;
  status: number; // 1 = active
  roomType: RoomType;
  maxParticipants: number | null;
  languageType: LanguageType;
  requiredLevel: RequiredLevel;
  topic: RoomTopic;
  description: string | null;
  categories: string; // JSON string e.g. "[\"Culture\"]"
  duration: number | null;
  currentParticipantCount: number;
}

/** Pagination metadata from API */
export interface AdditionalData {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/** UI-friendly pagination shape used by the Pagination component */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

/** GET /api/rooms response shape */
export interface GetRoomsResponse {
  data: Room[];
  additionalData: AdditionalData;
}

export interface RoomFilters {
  roomTypes: RoomType[];
  languageTypes: LanguageType[];
  requiredLevels: RequiredLevel[];
  categories: RoomCategory[];
  topics: RoomTopic[];
  roomName: string;
}

export interface CreateRoomPayload {
  name: string;
  roomType: RoomType;
  languageType: LanguageType;
  requiredLevel: RequiredLevel;
  topic: RoomTopic;
  description: string;
  privacy: RoomPrivacy;
  password: string;
  thumbnail: File | null;
}

export type ViewMode = "grid" | "table";
