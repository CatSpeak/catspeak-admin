import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  Link,
  Image as ImageIcon,
  MessageSquare,
} from "lucide-react";
import type {
  Tab,
  ThumbnailImage,
  EditHistoryEntry,
  ToolbarItem,
  TagItem,
} from "../types";

export const TABS: { key: Tab; label: string }[] = [
  { key: "my_posts", label: "My Posts" },
  { key: "create_new", label: "Create New" },
  { key: "manage", label: "Manage" },
];

export const TOOLBAR_ITEMS: ToolbarItem[] = [
  { icon: <Bold size={16} />, key: "bold" },
  { icon: <Italic size={16} />, key: "italic" },
  { icon: <Underline size={16} />, key: "underline" },
  "divider",
  { icon: <span className="font-bold text-sm">H1</span>, key: "h1" },
  { icon: <span className="font-bold text-sm">H2</span>, key: "h2" },
  "divider",
  { icon: <AlignLeft size={16} />, key: "align" },
  { icon: <Link size={16} />, key: "link" },
  { icon: <ImageIcon size={16} />, key: "image" },
  { icon: <MessageSquare size={16} />, key: "comment" },
];

export const ADD_BLOCK_LABELS = ["Text", "Image", "Video"] as const;

export const MOCK_THUMBNAILS: ThumbnailImage[] = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    alt: "Cat 1",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    alt: "Cat 2",
  },
];

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

export const WORD_COUNT_THRESHOLD = 0;
