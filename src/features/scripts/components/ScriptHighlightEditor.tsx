import { X, Pin } from "lucide-react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import { useLanguage } from "../../../stores/languageStore";
import type { ScriptHighlightCreate } from "../api/types";

interface ScriptHighlightEditorProps {
  highlights: ScriptHighlightCreate[];
  currentPhrase: string;
  currentNote: string;
  setCurrentPhrase: (val: string) => void;
  setCurrentNote: (val: string) => void;
  handleAddHighlight: () => void;
  removeHighlight: (index: number) => void;
}

export default function ScriptHighlightEditor({
  highlights,
  currentPhrase,
  currentNote,
  setCurrentPhrase,
  setCurrentNote,
  handleAddHighlight,
  removeHighlight,
}: ScriptHighlightEditorProps) {
  const { t } = useLanguage();

  return (
    <Card noPadding className="border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-start justify-between gap-4 bg-gray-50/50">
        <div>
          <div className="flex items-center gap-2 text-gray-800 font-bold">
            <Pin className="w-4 h-4 text-primary" />
            {t.scripts?.featuresSection || "Highlight Keywords"}
            <span className="text-xs font-normal text-gray-500">
              (Pre-highlighted Vocabulary)
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            {t.scripts?.highlightsDesc || "The system will automatically catch important vocabulary/idioms when students read the section containing them."}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleAddHighlight}
          className="bg-primary hover:bg-primary/90 shrink-0 text-sm py-1.5 px-3"
        >
          + {t.scripts?.addHighlightBtn || "Add keyword"}
        </Button>
      </div>

      <div className="p-5">
        {highlights.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {highlights.map((h, i) => (
                <div
                  key={i}
                  className="inline-flex items-center bg-primary/5 border border-primary/30 rounded-full px-3 py-1 shadow-sm"
                >
                  <span className="text-sm font-semibold text-primary mr-2">
                    {h.phrase}
                  </span>
                  {h.note && (
                    <span className="text-[10px] font-bold text-white bg-primary px-1.5 py-0.5 rounded mr-2">
                      {t.scripts?.hasNote || "Has note"}
                    </span>
                  )}
                  <button
                    onClick={() => removeHighlight(i)}
                    className="text-primary/60 hover:text-primary transition-colors focus:outline-none"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-400 mb-1.5 italic">
          {(t.scripts?.activeHighlights || "{count} Active Keywords").replace("{count}", highlights.length.toString())}
        </div>

        <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
          <input
            type="text"
            value={currentPhrase}
            onChange={(e) => setCurrentPhrase(e.target.value)}
            placeholder={t.scripts?.highlightPlaceholder || "Phrase to highlight..."}
            className="block w-full md:w-1/3 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border py-2 px-3 bg-gray-50/50"
          />
          <input
            type="text"
            value={currentNote}
            onChange={(e) => setCurrentNote(e.target.value)}
            placeholder={t.scripts?.notePlaceholderExt || "Teacher's extended notes (meaning, IPA, context)..."}
            className="block w-full flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border py-2 px-3 bg-gray-50/50"
          />
          <Button
            variant="outline"
            onClick={handleAddHighlight}
            className="w-full md:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 bg-blue-50/30"
          >
            {t.scripts?.saveHighlightBtn || "Save Card"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
