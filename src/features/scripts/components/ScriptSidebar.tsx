import { AlertCircle, Check, Users, Home, Settings, List } from "lucide-react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import { useLanguage } from "../../../stores/languageStore";
import { useToastStore } from "../../../stores/toastStore";
import type { LanguageType } from "../api/types";

interface ScriptSidebarProps {
  autoIpa: boolean;
  setAutoIpa: (val: boolean) => void;
  communities: LanguageType[];
  handleToggleCommunity: (lang: LanguageType) => void;
  publishStatus: "Draft" | "Published";
  setPublishStatus: (val: "Draft" | "Published") => void;
  displayOrder: number;
  setDisplayOrder: (val: number) => void;
  isSaving: boolean;
  showOnHome: boolean;
  setShowOnHome: (val: boolean) => void;
  onSave: (status: "Draft" | "Published") => void;
}

export default function ScriptSidebar({
  autoIpa,
  setAutoIpa,
  communities,
  handleToggleCommunity,
  publishStatus,
  setPublishStatus,
  displayOrder,
  setDisplayOrder,
  isSaving,
  showOnHome,
  setShowOnHome,
  onSave,
}: ScriptSidebarProps) {
  const { t } = useLanguage();
  const addToast = useToastStore((s) => s.addToast);

  return (
    <>
      {/* Community */}
      <Card noPadding className="border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2 text-gray-800 font-bold bg-white">
          <Users className="w-4 h-4 text-primary" />
          {t.scripts?.communitySection || "Applied Communities"}{" "}
          <span className="text-primary">*</span>
        </div>
        <div className="p-4 space-y-3 bg-gray-50/30">
          {/* English */}
          <div
            className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between bg-white ${
              communities.includes("English")
                ? "border-primary shadow-sm"
                : "border-gray-200 hover:border-primary/40"
            }`}
            onClick={() => handleToggleCommunity("English")}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  communities.includes("English")
                    ? "border-[5px] border-primary bg-white"
                    : "border border-gray-300 bg-white"
                }`}
              >
              </div>
              <div>
                <div className={`font-bold text-sm ${communities.includes("English") ? "text-gray-900" : "text-gray-700"}`}>
                  {t.scripts?.communityEnTitle || "English Community"}
                </div>
                {/* <div className="text-[11px] text-gray-500 mt-0.5">
                  {t.scripts?.communityEnDesc || "3,420 active students"}
                </div> */}
              </div>
            </div>
            <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-md">EN</span>
          </div>

          {/* Chinese */}
          <div
            className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between bg-white ${
              communities.includes("Chinese")
                ? "border-primary shadow-sm"
                : "border-gray-200 hover:border-primary/40"
            }`}
            onClick={() => handleToggleCommunity("Chinese")}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  communities.includes("Chinese")
                    ? "border-[5px] border-primary bg-white"
                    : "border border-gray-300 bg-white"
                }`}
              >
              </div>
              <div>
                <div className={`font-bold text-sm ${communities.includes("Chinese") ? "text-gray-900" : "text-gray-700"}`}>
                  {t.scripts?.communityChTitle || "Chinese Community"}
                </div>
                {/* <div className="text-[11px] text-gray-500 mt-0.5">
                  {t.scripts?.communityChDesc || "1,200 students"}
                </div> */}
              </div>
            </div>
            <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold px-2 py-0.5 rounded-md">CH</span>
          </div>

          {/* Japanese */}
          <div
            className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between bg-white ${
              communities.includes("Japanese")
                ? "border-primary shadow-sm"
                : "border-gray-200 hover:border-primary/40"
            }`}
            onClick={() => handleToggleCommunity("Japanese")}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  communities.includes("Japanese")
                    ? "border-[5px] border-primary bg-white"
                    : "border border-gray-300 bg-white"
                }`}
              >
              </div>
              <div>
                <div className={`font-bold text-sm ${communities.includes("Japanese") ? "text-gray-900" : "text-gray-700"}`}>
                  {t.scripts?.communityJaTitle || "Japanese Community"}
                </div>
                {/* <div className="text-[11px] text-gray-500 mt-0.5">
                  {t.scripts?.communityJaDesc || "1,120 students"}
                </div> */}
              </div>
            </div>
            <span className="bg-orange-50 text-orange-600 border border-orange-100 text-[10px] font-bold px-2 py-0.5 rounded-md">JA</span>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              onClick={() => addToast("info", t.scripts?.wipCommunity || "Community management feature is under development.")}
              variant="outline"
              className="w-full justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-300 border-dashed border-2 py-2"
            >
              + {t.scripts?.addCommunityBtn || "Add community"}
            </Button>
          </div>

          <div className="mt-3 bg-orange-50/50 p-3 rounded-lg flex items-start gap-2 border border-orange-100">
            <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-orange-700 leading-relaxed">
              {t.scripts?.communityWarning || "1 script chỉ áp dụng cho 1 cộng đồng. Ngôn ngữ dịch sẽ được tự động điều chỉnh theo cộng đồng này."}
            </p>
          </div>
        </div>
      </Card>

      {/* Display on Home */}
      <Card noPadding className="border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2 text-gray-800 font-bold bg-white">
          <Home className="w-4 h-4 text-blue-500" />
          {t.scripts?.homeDisplaySection || "Display on Home Page"}
        </div>
        <div className="p-5 bg-gray-50/30">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div
              className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
                showOnHome ? "bg-primary text-white" : "border border-gray-300"
              }`}
            >
              {showOnHome && <Check className="w-3.5 h-3.5" />}
            </div>
            <input
              type="checkbox"
              className="sr-only"
              checked={showOnHome}
              onChange={(e) => setShowOnHome(e.target.checked)}
            />
            <div>
              <div className="font-bold text-sm text-gray-900 group-hover:text-primary transition-colors">
                {t.scripts?.homeDisplayTitle || "Display in Script widget on Community Home"}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                {t.scripts?.homeDisplayDesc || "Allows random appearance in daily reading widgets."}
              </div>
            </div>
          </label>
          <div className="mt-4 bg-yellow-50/80 p-3 rounded-lg flex items-start gap-2 border border-yellow-200/60">
            <span className="text-[14px]">⚠️</span>
            <p className="text-[11px] text-yellow-800 leading-relaxed">
              {t.scripts?.homeDisplayWarning || "Only applies to selected communities. Script is randomized from the pool of all scripts with this option enabled."}
            </p>
          </div>
        </div>
      </Card>

      {/* Language Settings */}
      <Card noPadding className="border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2 text-gray-800 font-bold bg-white">
          <Settings className="w-4 h-4 text-green-500" />
          {t.scripts?.langSettingsTitle || "Language Settings"}
        </div>
        <div className="p-5 space-y-4 bg-gray-50/30">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-6 h-6 rounded bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold">A</span>
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                {t.scripts?.autoGenLangTitle || "AUTO-GENERATED SCRIPT LANGUAGE"}
              </h4>
              <p className="text-[13px] text-gray-900 mt-1 font-bold">
                {t.scripts?.autoGenLangDesc || "Automatically by community"}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {t.scripts?.autoGenLangSub || "Anh → English, Trung → 汉语, Nhật → 日本語"}
              </p>
            </div>
          </div>
          <hr className="border-gray-200" />
          <div className="flex items-center justify-between group">
            <div>
              <label className="text-[13px] font-bold text-gray-900 cursor-pointer group-hover:text-primary transition-colors">
                {t.scripts?.autoIpaTitle || "Auto IPA Analysis"}
              </label>
              <div className="text-[11px] text-gray-500 mt-0.5">
                {t.scripts?.autoIpaDesc || "CatSpeak Dictionary Engine v4.1"}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={autoIpa}
                onChange={(e) => setAutoIpa(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Status & Order */}
      <Card noPadding className="border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2 text-gray-800 font-bold bg-white">
          <List className="w-4 h-4 text-purple-500" />
          {t.scripts?.statusSection || "Status & Ordering"}
        </div>
        <div className="p-5 space-y-5 bg-gray-50/30">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              {t.scripts?.statusPublishTitle || "Publish Status"}
            </label>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  publishStatus === "Draft"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setPublishStatus("Draft")}
              >
                <div className={`w-2 h-2 rounded-full ${publishStatus === "Draft" ? "bg-gray-400" : "bg-transparent border border-gray-400"}`}></div>
                {t.scripts?.statusDraftLabel || "Draft"}
              </button>
              <button
                type="button"
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  publishStatus === "Published"
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setPublishStatus("Published")}
              >
                <div className={`w-2 h-2 rounded-full ${publishStatus === "Published" ? "bg-white" : "bg-transparent border border-gray-400"}`}></div>
                {t.scripts?.statusPublishedLabel || "Publish"}
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-bold text-gray-900">
                {t.scripts?.displayOrder || "Display Order"}
              </label>
              <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-1.5 py-0.5 rounded">
                {t.scripts?.displayOrderDesc || "Priority by small number (1, 2, 3...)"}
              </span>
            </div>
            <input
              type="number"
              min={1}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2 px-3 border bg-white"
            />
          </div>

          <hr className="border-gray-200" />
          <div className="text-[11px] space-y-2 text-gray-500">
            <div className="flex justify-between">
              <span>{t.scripts?.createdBy || "Record created by:"}</span>
              <span className="font-bold text-gray-900">{t.scripts?.adminYou || "Admin (You)"}</span>
            </div>
            <div className="flex justify-between">
              <span>{t.scripts?.version || "Managed version:"}</span>
              <span className="font-bold text-gray-900">v1.0.0-rc2</span>
            </div>
            <div className="flex justify-between items-center">
              <span>{t.scripts?.accessRight || "Access right:"}</span>
              <span className="font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                {t.scripts?.accessPublic || "Public for students"}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Button
        variant="primary"
        className="w-full py-3 text-sm font-bold shadow-md bg-primary hover:bg-primary/90 flex items-center justify-center gap-2"
        onClick={() => onSave("Published")}
        disabled={isSaving}
      >
        <Check className="w-5 h-5" />
        {t.scripts?.saveBtn || "Complete & Update"}
      </Button>
    </>
  );
}
