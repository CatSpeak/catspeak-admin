import { TOOLBAR_ITEMS } from "../constants";

interface EditorToolbarProps {
  onAction?: (key: string) => void;
}

const EditorToolbar = ({ onAction }: EditorToolbarProps) => (
  <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 p-2 bg-gray-50/50">
    {TOOLBAR_ITEMS.map((item, idx) =>
      item === "divider" ? (
        <div key={`divider-${idx}`} className="w-px h-4 bg-gray-300 mx-1" />
      ) : (
        <button
          key={item.key}
          onClick={() => onAction?.(item.key)}
          aria-label={item.key}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          {item.icon}
        </button>
      ),
    )}
  </div>
);

export default EditorToolbar;
