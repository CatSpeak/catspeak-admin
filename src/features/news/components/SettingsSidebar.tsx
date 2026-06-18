// import { useState } from "react";
import {
  Globe,
  Users,
  Lock,
  // CalendarDays,
  // Clock,
  // Tag,
  History,
  // Check,
} from "lucide-react";
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
  community: "All" | "English" | "Chinese";
  onCommunityChange: (val: "All" | "English" | "Chinese") => void;
  tags: TagItem[];
  activeTagId: number | null;
  onTagToggle: (id: number) => void;
  onPublish: () => void;
  isSubmitting?: boolean;
}

const PRIVACY_DETAILS = {
  Public: { label: "Public", icon: Globe, desc: "Visible to everyone on the app" },
  FriendsOnly: { label: "Friends Only", icon: Users, desc: "Only shown to connections" },
  Private: { label: "Private", icon: Lock, desc: "Only visible to you" },
};

const SettingsSidebar = ({
  privacy,
  onPrivacyChange,
  // publishDate,
  // publishTime,
  // onPublishDateChange,
  // onPublishTimeChange,
  community,
  onCommunityChange,
  // tags,
  // activeTagId,
  // onTagToggle,
  onPublish,
  isSubmitting,
}: SettingsSidebarProps) => {
  // const [prevPublishDate, setPrevPublishDate] = useState(publishDate);
  // const [prevPublishTime, setPrevPublishTime] = useState(publishTime);
  // const [showSchedule, setShowSchedule] = useState(
  //   !!publishDate || !!publishTime
  // );

  // if (publishDate !== prevPublishDate || publishTime !== prevPublishTime) {
  //   setPrevPublishDate(publishDate);
  //   setPrevPublishTime(publishTime);
  //   if (publishDate || publishTime) {
  //     setShowSchedule(true);
  //   }
  // }

  return (
    <div className="w-full xl:w-[320px] 2xl:w-90 shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      {/* Visibility / Privacy Section */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
          Visibility
        </label>
        <div className="space-y-2">
          {PRIVACY_OPTIONS.map((option) => {
            const details = PRIVACY_DETAILS[option];
            const Icon = details.icon;
            const isSelected = privacy === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onPrivacyChange(option)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${isSelected
                  ? "border-primary bg-brand-50/10 shadow-sm ring-1 ring-primary/20"
                  : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/30"
                  }`}
              >
                <span
                  className={`p-1.5 rounded-lg border transition-colors ${isSelected
                    ? "bg-primary text-white border-primary"
                    : "bg-gray-50 text-gray-500 border-gray-100"
                    }`}
                >
                  <Icon size={14} />
                </span>
                <div>
                  <span
                    className={`text-xs font-semibold block transition-colors ${isSelected ? "text-primary" : "text-gray-900"
                      }`}
                  >
                    {details.label}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium leading-normal block mt-0.5">
                    {details.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Target Community Section */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
          Language Community
        </label>
        <div className="bg-gray-50 p-1 rounded-xl flex gap-1 border border-gray-100">
          {COMMUNITIES.map((c) => {
            const isSelected = community === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => onCommunityChange(c)}
                className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${isSelected
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
                  : "text-gray-500 hover:text-gray-800 border border-transparent"
                  }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Tags Selector Section */}
      {/* <div className="space-y-3">
        <div className="flex items-center gap-1.5">
          <Tag size={13} className="text-gray-400" />
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Category Tags
          </label>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
          {tags.map(({ id, label }) => {
            const isSelected = id === activeTagId;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onTagToggle(id)}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${isSelected
                    ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
              >
                {isSelected && <Check size={10} strokeWidth={3} />}
                {label}
              </button>
            );
          })}
        </div>
      </div> */}

      {/* <div className="h-px bg-gray-100" /> */}

      {/* Scheduling Section */}
      {/* <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Schedule Publish
          </span>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showSchedule}
              onChange={(e) => {
                setShowSchedule(e.target.checked);
                if (!e.target.checked) {
                  onPublishDateChange("");
                  onPublishTimeChange("");
                }
              }}
              className="sr-only peer"
            />
            <div className="w-8 h-4.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-3.5 after:content-[''] after:absolute after:top-[2.5px] after:left-[2.5px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {showSchedule && (
          <div className="space-y-2.5 p-3.5 bg-gray-50 border border-gray-100 rounded-xl animate-fadeIn">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Publish Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={publishDate}
                  onChange={(e) => onPublishDateChange(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
                <CalendarDays
                  size={13}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Publish Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={publishTime}
                  onChange={(e) => onPublishTimeChange(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
                <Clock
                  size={13}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          </div>
        )}
      </div> */}

      <div className="h-px bg-gray-100" />

      {/* Revision History Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5">
          <History size={13} className="text-gray-400" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Revision History
          </span>
        </div>
        <div className="relative pl-4 border-l border-gray-100 ml-1.5 space-y-4">
          {MOCK_EDIT_HISTORY.map(({ id, label, isCurrent }) => (
            <div key={id} className="relative">
              <span
                className={`absolute -left-[20.5px] top-1.5 rounded-full size-2 border transition-all ${isCurrent
                  ? "bg-primary border-primary ring-4 ring-primary/10"
                  : "bg-gray-200 border-white shadow-sm"
                  }`}
              />
              <div className="flex flex-col">
                <span
                  className={`text-xs font-semibold ${isCurrent ? "text-primary" : "text-gray-700"
                    }`}
                >
                  {label}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                  {isCurrent ? "Active revision" : "Saved draft"}
                </span>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="text-[11px] text-blue-500 font-semibold hover:text-blue-600 transition-colors pt-1 block cursor-pointer hover:underline"
          >
            View all history
          </button>
        </div>
      </div>

      {/* Save / Publish Action Section */}
      <div className="space-y-2.5 pt-4 border-t border-gray-100 flex flex-col">
        <button
          type="button"
          onClick={onPublish}
          disabled={isSubmitting}
          className="w-full py-2.5 text-xs font-bold text-white bg-primary rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 rounded-full animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              Publish Post
            </>
          )}
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          className="w-full py-2 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all hover:text-gray-800 disabled:opacity-50 cursor-pointer text-center"
        >
          Save Draft
        </button>
      </div>
    </div>
  );
};

export default SettingsSidebar;
