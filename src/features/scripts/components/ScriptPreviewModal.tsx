import React, { useState } from "react";
import { X } from "lucide-react";
import ScriptLivePreview from "./ScriptLivePreview";
import { translateScriptPreview } from "../api/scriptApi";
import { useToastStore } from "../../../stores/toastStore";
import type { Script } from "../api/types";

interface ScriptPreviewModalProps {
  script: Script | null;
  onClose: () => void;
}

export default function ScriptPreviewModal({ script, onClose }: ScriptPreviewModalProps) {
  const addToast = useToastStore((s) => s.addToast);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState("");
  const [translatedHighlight, setTranslatedHighlight] = useState("");

  if (!script) return null;

  const handleTranslatePreview = async () => {
    if (!script.content?.trim()) return;

    setIsTranslating(true);
    try {
      const res = await translateScriptPreview(
        script.content,
        script.defaultTranslationLanguage,
        script.translateHighlightPhrase ? script.highlightPhrase : undefined
      );
      setTranslatedContent(res.translatedText);
      setTranslatedHighlight(res.translatedHighlight ?? "");
      addToast("success", "Dịch thành công!");
    } catch (error) {
      addToast("error", "Lỗi khi gọi AI dịch thuật.");
      console.error(error);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full h-full flex flex-col overflow-hidden relative">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900">Xem trước hiển thị: {script.title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
          <ScriptLivePreview
            title={script.title}
            topic={script.topic}
            content={script.content}
            highlightPhrase={script.highlightPhrase || ""}
            highlights={script.highlights || []}
            isParagraphTranslationEnabled={script.isParagraphTranslationEnabled}
            defaultTranslationLanguage={script.defaultTranslationLanguage}
            translateHighlightPhrase={script.translateHighlightPhrase}
            allowTranslationErrorReports={script.allowTranslationErrorReports}
            isTranslating={isTranslating}
            translatedContent={translatedContent}
            translatedHighlight={translatedHighlight}
            onTranslate={handleTranslatePreview}
            communities={script.communities}
          />
        </div>
      </div>
    </div>
  );
}
