import { AlignLeft, AlignCenter, Link2, Mic, CheckCircle2, Bold, Italic, Underline, ChevronDown } from "lucide-react";
import { useLanguage } from "../../../stores/languageStore";
import { useToastStore } from "../../../stores/toastStore";

interface ScriptEditorToolbarProps {
  lastSavedTime: Date | null;
}

export default function ScriptEditorToolbar({ lastSavedTime }: ScriptEditorToolbarProps) {
  const { t } = useLanguage();
  const addToast = useToastStore((s) => s.addToast);

  const showWipToast = (msgKey: 'wipFormat' | 'wipRecord', fallback: string) => {
    addToast("info", t.scripts?.[msgKey] || fallback);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-1 p-1.5 border-b border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={() => showWipToast("wipFormat", "Tính năng định dạng đang được phát triển.")}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => showWipToast("wipFormat", "Tính năng định dạng đang được phát triển.")}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => showWipToast("wipFormat", "Tính năng định dạng đang được phát triển.")}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"
        >
          <Underline className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-gray-300 mx-1"></div>

        <button
          type="button"
          onClick={() => showWipToast("wipFormat", "Tính năng định dạng đang được phát triển.")}
          className="flex items-center gap-1 p-1.5 px-2 text-gray-600 hover:bg-gray-200 rounded text-xs font-bold"
        >
          16px (Body Regular) <ChevronDown className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-gray-300 mx-1"></div>

        <button
          type="button"
          onClick={() => showWipToast("wipFormat", "Tính năng định dạng đang được phát triển.")}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => showWipToast("wipFormat", "Tính năng định dạng đang được phát triển.")}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => showWipToast("wipFormat", "Tính năng định dạng đang được phát triển.")}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"
        >
          <Link2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => showWipToast("wipRecord", "Tính năng ghi âm đang được phát triển.")}
          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"
        >
          <Mic className="w-4 h-4" />
        </button>
      </div>

      {lastSavedTime && (
        <div className="px-3 py-1.5 bg-green-50/50 flex items-center gap-1.5 text-xs text-green-700 border-b border-green-100">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {(t.scripts?.autoSavedAt || "Đã lưu tự động lúc {time}").replace(
            "{time}",
            lastSavedTime.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })
          )}
        </div>
      )}
    </>
  );
}
