import type {
  EditHistoryEntry,
  TagItem,
  LanguageCommunity,
  LanguageCommunityNumber,
} from "../types";

export const MOCK_TAGS: TagItem[] = [
  { id: 1, label: "Family" },
  { id: 2, label: "Sports" },
  { id: 3, label: "Travel" },
  { id: 4, label: "Family" },
  { id: 5, label: "Sports" },
  { id: 6, label: "Travel" },
  { id: 7, label: "Family" },
  { id: 8, label: "Sports" },
  { id: 9, label: "Travel" },
  { id: 10, label: "Family" },
  { id: 11, label: "Sports" },
  { id: 12, label: "Travel" },
];

export const MOCK_EDIT_HISTORY: EditHistoryEntry[] = [
  {
    id: 1,
    label: "Today, 14:30",
    isCurrent: true,
    savedAt: new Date().toISOString(),
  },
  {
    id: 2,
    label: "Yesterday, 10:15",
    isCurrent: false,
    savedAt: new Date().toISOString(),
  },
  {
    id: 3,
    label: "10/20/2023, 16:45",
    isCurrent: false,
    savedAt: "2023-10-20T16:45:00.000Z",
  },
];

export const COMMUNITIES = ["All", "English", "Chinese", "Japanese"] as const;

export const COMMUNITY_TO_LANGUAGE_NUMBER: Record<
  LanguageCommunity,
  LanguageCommunityNumber
> = {
  All: 0,
  English: 1,
  Chinese: 2,
  Japanese: 3,
};

/**
 * Checks if a topic belongs to the "All" community or matches the post's specific language community.
 */
export const isTopicMatchingCommunity = (
  topicCommunity:
    | LanguageCommunityNumber
    | LanguageCommunity
    | number
    | string
    | undefined
    | null,
  postCommunity: LanguageCommunity,
): boolean => {
  // Topic with community 0, "All", "all", null or undefined matches any post
  if (
    topicCommunity === 0 ||
    topicCommunity === "0" ||
    topicCommunity === null ||
    topicCommunity === undefined ||
    (typeof topicCommunity === "string" && topicCommunity.toLowerCase() === "all")
  ) {
    return true;
  }

  const targetNumber = COMMUNITY_TO_LANGUAGE_NUMBER[postCommunity];

  if (typeof topicCommunity === "number") {
    return topicCommunity === targetNumber;
  }

  if (typeof topicCommunity === "string") {
    const parsed = Number.parseInt(topicCommunity, 10);
    if (!Number.isNaN(parsed)) {
      return parsed === targetNumber;
    }
    const topicLower = topicCommunity.toLowerCase();
    const postLower = postCommunity.toLowerCase();
    if (topicLower === postLower) return true;
    if (
      postCommunity === "English" &&
      (topicLower === "eng" || topicLower === "english")
    ) {
      return true;
    }
  }

  return false;
};

