import type { Tab, EditHistoryEntry, TagItem } from "../types";

export const TABS: { key: Tab; label: string }[] = [
  { key: "my_posts", label: "My Posts" },
  { key: "create_new", label: "Create New" },
  { key: "manage", label: "Manage" },
];

export const ADD_BLOCK_LABELS = ["Text", "Image", "Video"] as const;

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

export const COMMUNITIES = ["English", "Vietnamese"] as const;
