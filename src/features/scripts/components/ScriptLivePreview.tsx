import { useState, useEffect } from "react";
import { Monitor, Smartphone, Type, Globe, Shuffle, Languages, ChevronDown } from "lucide-react";
import { useLanguage } from "../../../stores/languageStore";

interface ScriptLivePreviewProps {
  title: string;
  topic?: string;
  content: string;
  highlightPhrase: string;
  highlights: { phrase: string; note?: string }[];
  isParagraphTranslationEnabled: boolean;
  defaultTranslationLanguage: string;
  translateHighlightPhrase: boolean;
  allowTranslationErrorReports: boolean;
  isTranslating: boolean;
  translatedContent: string;
  translatedHighlight: string;
  onTranslate: () => void;
  communities?: string[];
}

export default function ScriptLivePreview({
  title,
  topic,
  content,
  highlightPhrase,
  highlights,
  isParagraphTranslationEnabled,
  defaultTranslationLanguage,
  translateHighlightPhrase,
  allowTranslationErrorReports,
  isTranslating,
  translatedContent,
  translatedHighlight,
  onTranslate,
  communities = [],
}: ScriptLivePreviewProps) {
  const { t } = useLanguage();

  const [mode, setMode] = useState<"desktop" | "mobile">("desktop");
  const [collapsed, setCollapsed] = useState(false);
  const [previewTargetLanguage, setPreviewTargetLanguage] = useState(defaultTranslationLanguage);

  useEffect(() => {
    setPreviewTargetLanguage(defaultTranslationLanguage);
  }, [defaultTranslationLanguage]);

  const allLangs = ["English", "Vietnamese", "Chinese", "Japanese"];
  const sourceLang = communities.length > 0 ? communities[0] : "English";
  const availableTargets = allLangs.filter(l => l !== sourceLang);

  const getLangName = (lang: string) => {
    if (lang === "English") return "Tiếng Anh";
    if (lang === "Vietnamese") return "Tiếng Việt";
    if (lang === "Chinese") return "Tiếng Trung";
    if (lang === "Japanese") return "Tiếng Nhật";
    return lang;
  };

  // Simple function to highlight phrases in content
  const renderHighlightedContent = () => {
    if (!content) return null;
    let parts: { text: string; isHighlight: boolean; note?: string }[] = [{ text: content, isHighlight: false }];
    
    highlights.forEach(h => {
      if (!h.phrase) return;
      const newParts: typeof parts = [];
      parts.forEach(part => {
        if (part.isHighlight) {
          newParts.push(part);
          return;
        }
        
        const split = part.text.split(new RegExp(`(${h.phrase})`, 'gi'));
        split.forEach(s => {
          if (s.toLowerCase() === h.phrase.toLowerCase()) {
            newParts.push({ text: s, isHighlight: true, note: h.note });
          } else if (s) {
            newParts.push({ text: s, isHighlight: false });
          }
        });
      });
      parts = newParts;
    });

    return (
      <>
        {parts.map((p, i) => 
          p.isHighlight ? (
            <span key={i} className="text-primary font-bold cursor-pointer relative group">
              {p.text}
              {p.note && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] bg-white border border-orange-200 shadow-lg rounded-md p-2 text-xs font-normal text-gray-700 hidden group-hover:block z-10">
                  <div className="text-orange-600 font-semibold mb-1 flex items-center gap-1">
                    {t.scripts?.teacherNote || "📌 Cat Speak Teacher Note"}
                  </div>
                  {p.note}
                </div>
              )}
            </span>
          ) : (
            <span key={i}>{p.text}</span>
          )
        )}
      </>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm ">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <Monitor className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{t.scripts?.previewTitle || "Live Preview"}</h3>
            <p className="text-xs text-gray-500">{t.scripts?.previewDesc || "Simulate real student experience"}</p>
          </div>
        </div>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="text-sm font-semibold text-gray-500 hover:text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-md"
        >
          {collapsed
            ? t.scripts?.previewExpandBtn || "+ Expand"
            : t.scripts?.previewCollapsBtn || "- Collapse"}
        </button>
      </div>

      {!collapsed && (
        <div className="p-4 bg-gray-50 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-500 mr-2">{t.scripts?.previewModeLabel || "Preview mode:"}</span>
            <button 
              onClick={() => setMode("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === "desktop" ? "bg-gray-800 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"}`}
            >
              <Monitor className="w-4 h-4" /> {t.scripts?.desktopView || "Desktop"}
            </button>
            <button 
              onClick={() => setMode("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === "mobile" ? "bg-gray-800 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"}`}
            >
              <Smartphone className="w-4 h-4" /> {t.scripts?.mobileView || "Mobile"}
            </button>
          </div>

          {/* Device Mockup */}
          <div className={`bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 ${mode === "desktop" ? "w-full max-w-2xl" : "w-[375px]"}`}>
            <div className="p-6 md:p-8">
              {/* Translate button */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-bold bg-[#FFDAD6] text-red-700">
                  {topic ? topic : (communities && communities.length > 0 ? communities[0].toUpperCase() : "TOPIC")}
                </span>

                <button
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-transparent  border-[1.5px] border-solid border-[#990011] text-[#990011] transition-colors"
                  title={t.widget?.shuffleTopic || "Đổi chủ đề ngẫu nhiên"}
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                {isParagraphTranslationEnabled && (
                  <button
                    onClick={onTranslate}
                    disabled={isTranslating}
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-[1.5px] border-solid border-[#990011] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${translatedContent ? "bg-[#990011] text-white hover:bg-[#80000e]" : "bg-transparent text-[#990011] hover:bg-gray-100"}`}
                    title={t.widget?.translateFull || "Dịch cả đoạn văn"}
                  >
                    <Languages className="w-4 h-4" />
                  </button>
                )}
              </div>

              

              <h1 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
                {title ? (
                  title.split(' ').map((word, i) => (
                    <span key={i} className={i === 1 ? "text-primary" : ""}>{word} </span>
                  ))
                ) : (
                  <span className="text-gray-300">{t.scripts?.previewTitlePlaceholder || "Enter script title..."}</span>
                )}
              </h1>

              <div className="flex gap-2 items-start text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-6">
                <span className="text-yellow-500">💡</span>
                <p>{t.scripts?.previewClickHint || "Click any word to view its meaning and save to your personal learning list"}</p>
              </div>

              <div className="text-gray-800 text-lg leading-relaxed mb-6 font-medium">
                {content ? renderHighlightedContent() : <span className="text-gray-300 italic">{t.scripts?.previewContentPlaceholder || "Script content will be displayed here..."}</span>}
              </div>

              {highlightPhrase && (
                <div className="pl-4 border-l-4 border-primary bg-gray-50/50 py-3 mb-6 rounded-r-lg">
                  <p className="font-serif italic text-base text-gray-700 font-medium">"{highlightPhrase}"</p>
                </div>
              )}

              {isParagraphTranslationEnabled && (
                <div className="bg-red-50/50 rounded-xl border border-red-100 overflow-hidden mt-8">
                  <div className={`flex items-center ${mode === "desktop" ? "justify-between" : "flex-col gap-2"} px-4 py-3 bg-red-50/80 border-b border-red-100`}>
                    <div className="flex items-center gap-2 font-bold text-sm text-gray-800 tracking-wide">
                      <Globe className="w-5 h-5 text-blue-400" />
                      {t.scripts?.previewTranslationTitle || "BẢN DỊCH CẢ ĐOẠN VĂN"}
                    </div>
                    <div className="relative flex items-center w-full sm:w-auto rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary overflow-hidden">
                      {/* Visible custom UI */}
                      <div className="flex items-center w-full pl-3 pr-8 py-1.5 pointer-events-none select-none">
                        <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
                          {getLangName(sourceLang)} &rarr;
                        </span>
                        <span className="ml-1 text-sm font-bold text-gray-700">
                          {getLangName(previewTargetLanguage)}
                        </span>
                      </div>
                      
                      {/* Invisible select covering the whole wrapper */}
                      <select 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
                        value={previewTargetLanguage}
                        onChange={(e) => setPreviewTargetLanguage(e.target.value)}
                      >
                        {availableTargets.map(lang => (
                          <option key={lang} value={lang}>{getLangName(lang)}</option>
                        ))}
                      </select>

                      {/* Icon */}
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    {translatedContent ? (
                      <p className="text-gray-700 leading-relaxed">{translatedContent}</p>
                    ) : (
                      <p className="text-gray-400 italic text-sm">
                        {(t.scripts?.previewTranslationPlaceholder || 'Bấm "{btn}" để xem bản dịch AI.')
                          .replace("{btn}", (t.scripts?.translateBtn || "Dịch sang {lang}").replace("{lang}", t.room?.languages?.[defaultTranslationLanguage as keyof typeof t.room.languages] || defaultTranslationLanguage))}
                      </p>
                    )}

                    {translateHighlightPhrase && highlightPhrase && translatedContent && (
                      <div className="mt-3 pt-3 border-t border-red-100">
                        <div className="text-xs text-gray-500 mb-1 font-medium">{t.scripts?.previewOriginal || "Original"}:</div>
                        <div className="font-serif italic text-gray-700">
                          {translatedHighlight
                            ? <span>"{translatedHighlight}"</span>
                            : <span className="text-gray-400">{t.scripts?.previewHighlightLoading || "Loading highlight translation..."}</span>
                          }
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`px-4 py-3 bg-white/50 border-t border-red-50 flex ${mode === "desktop" ? "items-center justify-between" : "flex-col gap-2"} text-xs`}>
                    <div className="flex items-center gap-1.5 text-yellow-600">
                      <span className="text-sm">⚠️</span> {t.scripts?.previewAIDisclaimer || "AI translation is for reference only"}
                    </div>
                    {allowTranslationErrorReports && (
                      <button className="text-red-500 hover:text-red-700 flex items-center gap-1 font-medium transition-colors w-max">
                        ► {t.scripts?.previewReportError || "Report incorrect translation"}
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
