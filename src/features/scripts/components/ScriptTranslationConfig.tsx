import Card from "../../../components/ui/Card";
import { useLanguage } from "../../../stores/languageStore";
import type { LanguageType } from "../api/types";
import { Globe } from "lucide-react";

interface ScriptTranslationConfigProps {
  isParagraphTranslationEnabled: boolean;
  setIsParagraphTranslationEnabled: (val: boolean) => void;
  defaultTranslationLanguage: LanguageType;
  setDefaultTranslationLanguage: (val: LanguageType) => void;
  translateHighlightPhrase: boolean;
  setTranslateHighlightPhrase: (val: boolean) => void;
  allowTranslationErrorReports: boolean;
  setAllowTranslationErrorReports: (val: boolean) => void;
}

export default function ScriptTranslationConfig({
  isParagraphTranslationEnabled,
  setIsParagraphTranslationEnabled,
  defaultTranslationLanguage,
  setDefaultTranslationLanguage,
  translateHighlightPhrase,
  setTranslateHighlightPhrase,
  allowTranslationErrorReports,
  setAllowTranslationErrorReports,
}: ScriptTranslationConfigProps) {
  const { t } = useLanguage();

  return (
    <Card noPadding className="border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-2 text-gray-800 font-bold">
          <Globe className="w-5 h-5 text-blue-400" />
          {t.scripts?.translationConfigTitle || "Translation Settings"}
        </div>
        <span className="text-[11px] font-normal text-gray-500">
          {t.scripts?.translationConfigDesc || "Customize display & AI translation support"}
        </span>
      </div>

      <div className="p-0 divide-y divide-gray-100">
        <div className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors">
          <div>
            <h4 className="text-sm font-bold text-gray-800">
              {t.scripts?.translateEnabledLabel || "Enable full paragraph translation"}
            </h4>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {t.scripts?.translateEnabledDesc || "Show 'Translate' button in the student interface for bilingual reading"}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isParagraphTranslationEnabled}
              onChange={(e) =>
                setIsParagraphTranslationEnabled(e.target.checked)
              }
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors">
          <div>
            <h4 className="text-sm font-bold text-gray-800">
              {t.scripts?.defaultLangLabel || "Default translation language"}
            </h4>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {t.scripts?.defaultLangDesc || "The initial language when the student opens the translation"}
            </p>
          </div>
          <select
            className="block w-52 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-1.5 px-3 border bg-white"
            value={defaultTranslationLanguage}
            onChange={(e) =>
              setDefaultTranslationLanguage(
                e.target.value as LanguageType
              )
            }
          >
            <option value="Vietnamese">Tiếng Việt (Vietnamese)</option>
            <option value="English">Tiếng Anh (English)</option>
            <option value="Chinese">Tiếng Trung (Chinese)</option>
            <option value="Japanese">Tiếng Nhật (Japanese)</option>
            <option value="Korean">Tiếng Hàn (Korean)</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors">
          <div>
            <h4 className="text-sm font-bold text-gray-800">
              {t.scripts?.translateHighlightTitle || "Translate highlight phrase"}
            </h4>
            <p className="text-[11px] text-gray-500 mt-0.5 max-w-sm">
              {t.scripts?.translateHighlightDesc || "When enabled, the highlight phrase will also be translated in the panel"}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={translateHighlightPhrase}
              onChange={(e) =>
                setTranslateHighlightPhrase(e.target.checked)
              }
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors">
          <div>
            <h4 className="text-sm font-bold text-gray-800">
              {t.scripts?.reportErrorTitle || "Allow translation error reports"}
            </h4>
            <p className="text-[11px] text-gray-500 mt-0.5 max-w-[300px]">
              {t.scripts?.reportErrorDesc || "Show a button to submit translation errors"}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={allowTranslationErrorReports}
              onChange={(e) =>
                setAllowTranslationErrorReports(e.target.checked)
              }
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>
    </Card>
  );
}
