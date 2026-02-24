import { Trash2, Image as ImageIcon } from "lucide-react";
import type { ThumbnailImage } from "../types";

interface ThumbnailGridProps {
  images: ThumbnailImage[];
  onDelete: (id: number) => void;
  onUpload?: () => void;
}

const ThumbnailGrid = ({ images, onDelete, onUpload }: ThumbnailGridProps) => (
  <div className="flex items-center gap-4 overflow-x-auto py-2 no-scrollbar">
    {images.map(({ id, src, alt }) => (
      <div
        key={id}
        className="relative shrink-0 w-32 h-32 rounded bg-gray-100 overflow-hidden group"
      >
        <img src={src} alt={alt} className="w-full h-full object-cover" />
        <button
          onClick={() => onDelete(id)}
          aria-label={`Delete ${alt}`}
          className="absolute top-1 right-1 p-1 bg-white/80 rounded-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={14} />
        </button>
      </div>
    ))}
    <button
      onClick={onUpload}
      className="shrink-0 w-32 h-32 rounded border border-dashed border-red-300 flex flex-col items-center justify-center gap-2 text-red-400 hover:bg-red-50/50 transition-colors bg-white"
    >
      <ImageIcon size={24} />
      <span className="text-xs font-medium">Upload image here</span>
    </button>
  </div>
);

export default ThumbnailGrid;
