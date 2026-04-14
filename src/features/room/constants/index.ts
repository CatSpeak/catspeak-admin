import type {
  RoomType, LanguageType, RequiredLevel,
  RoomCategory, RoomTopic,
} from "../types";

// ── Enum value arrays for dropdowns & filters ──

export const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: "OneToOne", label: "1:1" },
  { value: "Group", label: "Group" },
];

export const LANGUAGE_TYPES: { value: LanguageType; label: string; flag: string }[] = [
  { value: "Chinese", label: "Chinese", flag: "/flags/cn.svg" },
  { value: "English", label: "English", flag: "/flags/en.svg" },
  { value: "Vietnamese", label: "Vietnamese", flag: "/flags/vn.svg" },
];

export const REQUIRED_LEVELS: { value: RequiredLevel; label: string; group: string }[] = [
  { value: "HSK1", label: "HSK 1", group: "HSK" },
  { value: "HSK2", label: "HSK 2", group: "HSK" },
  { value: "HSK3", label: "HSK 3", group: "HSK" },
  { value: "HSK4", label: "HSK 4", group: "HSK" },
  { value: "HSK5", label: "HSK 5", group: "HSK" },
  { value: "HSK6", label: "HSK 6", group: "HSK" },
  { value: "A1", label: "A1", group: "CEFR" },
  { value: "A2", label: "A2", group: "CEFR" },
  { value: "B1", label: "B1", group: "CEFR" },
  { value: "B2", label: "B2", group: "CEFR" },
  { value: "C1", label: "C1", group: "CEFR" },
  { value: "C2", label: "C2", group: "CEFR" },
];

export const ROOM_CATEGORIES: { value: RoomCategory; label: string; color: string }[] = [
  { value: "Knowledge", label: "Knowledge", color: "bg-blue-100 text-blue-700" },
  { value: "Culture", label: "Culture", color: "bg-purple-100 text-purple-700" },
  { value: "Lifestyle", label: "Lifestyle", color: "bg-pink-100 text-pink-700" },
  { value: "Growth", label: "Growth", color: "bg-emerald-100 text-emerald-700" },
  { value: "Other", label: "Other", color: "bg-gray-100 text-gray-700" },
];

export const ROOM_TOPICS: { value: RoomTopic; label: string }[] = [
  { value: "History", label: "History" },
  { value: "Science", label: "Science" },
  { value: "Philosophy", label: "Philosophy" },
  { value: "Psychology", label: "Psychology" },
  { value: "Politics", label: "Politics" },
  { value: "Space", label: "Space" },
  { value: "Movies", label: "Movies" },
  { value: "Music", label: "Music" },
  { value: "Art", label: "Art" },
  { value: "Fashion", label: "Fashion" },
  { value: "Culture", label: "Culture" },
  { value: "Books", label: "Books" },
  { value: "Travel", label: "Travel" },
  { value: "Food", label: "Food" },
  { value: "Nature", label: "Nature" },
  { value: "Relationships", label: "Relationships" },
  { value: "Sports", label: "Sports" },
  { value: "Finance", label: "Finance" },
  { value: "Startups", label: "Startups" },
  { value: "Productivity", label: "Productivity" },
  { value: "Other", label: "Other" },
];

// ── Style helpers ──

export const ROOM_TYPE_STYLES: Record<RoomType, { bg: string; text: string; dot: string }> = {
  OneToOne: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  Group: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
};

export const LANGUAGE_FLAGS: Record<LanguageType, string> = {
  Chinese: "/flags/cn.svg",
  English: "/flags/en.svg",
  Vietnamese: "/flags/vn.svg",
};
