import { WORD_COUNT_THRESHOLD } from "../constants";
import EditorToolbar from "./EditorToolbar";

interface PostEditorProps {
  content: string;
  onContentChange: (val: string) => void;
  onToolbarAction?: (key: string) => void;
  autoSavedAt?: string;
}

const PostEditor = ({
  content,
  onContentChange,
  onToolbarAction,
  autoSavedAt,
}: PostEditorProps) => {
  const wordCount = content
    .split(" ")
    .filter((w) => w.length > WORD_COUNT_THRESHOLD).length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
      <EditorToolbar onAction={onToolbarAction} />
      <textarea
        className="flex-1 w-full p-4 sm:p-6 text-sm resize-none focus:outline-none placeholder:text-gray-300"
        placeholder="Start writing your post content here..."
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
      />
      <div className="flex justify-between items-center p-3 text-[11px] text-gray-400 bg-gray-50/30 border-t border-gray-50">
        <div className="flex gap-4">
          <span>Words: {wordCount}</span>
          <span>Characters: {content.length}</span>
        </div>
        {autoSavedAt && <span>Auto-saved at {autoSavedAt}</span>}
      </div>
    </div>
  );
};

export default PostEditor;
