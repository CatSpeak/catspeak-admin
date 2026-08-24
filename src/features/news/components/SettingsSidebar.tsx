import { Globe, Lock } from "lucide-react";
import { COMMUNITIES } from "../constants";
import type { TagItem } from "../types";
import { useLanguage } from "../../../stores/languageStore";

const PRIVACY_OPTIONS = ["Public", "Private"] as const;

interface SettingsSidebarProps {
  mode?: "create" | "edit";
  privacy: "Public" | "Private";
  onPrivacyChange: (val: "Public" | "Private") => void;
  publishDate: string;
  publishTime: string;
  onPublishDateChange: (val: string) => void;
  onPublishTimeChange: (val: string) => void;
  community: "All" | "English" | "Chinese" | "Japanese";
  onCommunityChange: (val: "All" | "English" | "Chinese" | "Japanese") => void;
  tags: TagItem[];
  activeTagId: number | null;
  onTagToggle: (id: number) => void;
  onPublish: () => void;
  isSubmitting?: boolean;
}

const SettingsSidebar = ({
  mode = "create",
  privacy,
  onPrivacyChange,
  community,
  onCommunityChange,
  onPublish,
  isSubmitting,
}: SettingsSidebarProps) => {
  const { t } = useLanguage();

  const privacyDetails = {
    Public: { label: t.news.publicLabel, icon: Globe, desc: t.news.publicDesc },
    Private: {
      label: t.news.privateLabel,
      icon: Lock,
      desc: t.news.privateDesc,
    },
  };

  return (
    <div className="w-full xl:w-[320px] 2xl:w-90 shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      {/* Visibility / Privacy Section */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
          {t.news.visibility}
        </label>
        <div className="space-y-2">
          {PRIVACY_OPTIONS.map((option) => {
            const details = privacyDetails[option];
            const Icon = details.icon;
            const isSelected = privacy === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onPrivacyChange(option)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-primary bg-brand-50/10 shadow-sm ring-1 ring-primary/20"
                    : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/30"
                }`}
              >
                <span
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isSelected
                      ? "bg-primary text-white border-primary"
                      : "bg-gray-50 text-gray-500 border-gray-100"
                  }`}
                >
                  <Icon size={14} />
                </span>
                <div>
                  <span
                    className={`text-xs font-semibold block transition-colors ${
                      isSelected ? "text-primary" : "text-gray-900"
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
          {t.news.languageCommunity}
        </label>
        <div className="bg-gray-50 p-1 rounded-xl flex gap-1 border border-gray-100">
          {COMMUNITIES.map((c) => {
            const isSelected = community === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => onCommunityChange(c)}
                className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
                    : "text-gray-500 hover:text-gray-800 border border-transparent"
                }`}
              >
                {c === "All" ? t.common.all : (t.room?.languages?.[c] || c)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-gray-100" />

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
              {mode === "edit" ? t.news.updatingPost : t.news.publishing}
            </>
          ) : (
            <>{mode === "edit" ? t.news.updatePost : t.news.publishPost}</>
          )}
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          className="w-full py-2 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all hover:text-gray-800 disabled:opacity-50 cursor-pointer text-center"
        >
          {t.news.saveDraft}
        </button>
      </div>
    </div>
  );
};

export default SettingsSidebar;
