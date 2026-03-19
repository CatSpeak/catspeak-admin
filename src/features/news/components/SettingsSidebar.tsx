import { ChevronDown, CalendarDays, Clock } from "lucide-react";
import { MOCK_EDIT_HISTORY, COMMUNITIES } from "../constants";
import type { TagItem } from "../types";

const PRIVACY_OPTIONS = ["Public", "FriendsOnly", "Private"] as const;

interface SettingsSidebarProps {
  privacy: "Public" | "FriendsOnly" | "Private";
  onPrivacyChange: (val: "Public" | "FriendsOnly" | "Private") => void;
  publishDate: string;
  publishTime: string;
  onPublishDateChange: (val: string) => void;
  onPublishTimeChange: (val: string) => void;
  community: string;
  onCommunityChange: (val: string) => void;
  tags: TagItem[];
  activeTagId: number | null;
  onTagToggle: (id: number) => void;
  onPublish: () => void;
  isSubmitting?: boolean;
}

const SettingsSidebar = ({
  privacy,
  onPrivacyChange,
  publishDate,
  publishTime,
  onPublishDateChange,
  onPublishTimeChange,
  community,
  onCommunityChange,
  tags,
  activeTagId,
  onTagToggle,
  onPublish,
  isSubmitting,
}: SettingsSidebarProps) => (
  <div className="w-full xl:w-[320px] 2xl:w-90 shrink-0 bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-6 space-y-6">
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
        Status
      </span>
      <div className="relative w-full max-w-45">
        <select
          value={privacy}
          onChange={(e) =>
            onPrivacyChange(e.target.value as (typeof PRIVACY_OPTIONS)[number])
          }
          className="w-full appearance-none bg-white border border-gray-200 rounded-full px-4 py-1.5 text-xs text-gray-600 focus:outline-none focus:border-primary shadow-sm hover:border-gray-300 transition-colors"
        >
          {PRIVACY_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p.replace(/([A-Z])/g, " $1").trim()}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    </div>

    {/* Publish Time */}
    <div className="space-y-3">
      <span className="text-sm font-semibold text-gray-900 block">
        Publish Time
      </span>
      <div className="relative">
        <input
          type="text"
          placeholder="mm/dd/yyyy"
          value={publishDate}
          onChange={(e) => onPublishDateChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-gray-300"
        />
        <CalendarDays
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none"
        />
      </div>
      <div className="relative">
        <input
          type="text"
          placeholder="--:-- --"
          value={publishTime}
          onChange={(e) => onPublishTimeChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-gray-300"
        />
        <Clock
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none"
        />
      </div>
    </div>

    {/* Community */}
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
        Community
      </span>
      <div className="relative w-full max-w-45">
        <select
          value={community}
          onChange={(e) => onCommunityChange(e.target.value)}
          className="w-full appearance-none bg-white border border-gray-200 rounded-full px-4 py-1.5 text-xs text-gray-600 focus:outline-none focus:border-primary shadow-sm hover:border-gray-300 transition-colors"
        >
          {COMMUNITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    </div>

    {/* Tags */}
    <div className="space-y-3">
      <span className="text-sm font-semibold text-gray-900 block">Tags</span>
      <div className="flex flex-wrap gap-2">
        {tags.map(({ id, label }) => (
          <span
            key={id}
            role="button"
            tabIndex={0}
            onClick={() => onTagToggle(id)}
            onKeyDown={(e) => e.key === "Enter" && onTagToggle(id)}
            className={`px-4 py-1 text-xs rounded-full cursor-pointer transition-colors ${
              id === activeTagId
                ? "bg-primary text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>

    {/* Edit History */}
    <div className="space-y-3 pt-2">
      <span className="text-sm font-semibold text-gray-900 block">
        Edit History
      </span>
      <div className="space-y-4">
        {MOCK_EDIT_HISTORY.map(({ id, label, isCurrent }) => (
          <div key={id} className="flex justify-between items-center text-xs">
            <span
              className={
                isCurrent ? "text-primary font-medium" : "text-gray-600"
              }
            >
              {label}
            </span>
            {isCurrent && <span className="text-gray-400">Current</span>}
          </div>
        ))}
        <button className="text-xs text-blue-500 hover:text-blue-600 hover:underline pt-2 inline-block">
          View all history
        </button>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex items-center gap-3 justify-center">
      <button
        onClick={onPublish}
        disabled={isSubmitting}
        className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-full transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Publishing..." : "Publish"}
      </button>
    </div>
  </div>
);

export default SettingsSidebar;
