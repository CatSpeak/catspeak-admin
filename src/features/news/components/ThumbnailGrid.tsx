import { Trash2, Image as ImageIcon } from "lucide-react";
import type { ThumbnailImage } from "../types";

interface ThumbnailGridProps {
  images: ThumbnailImage[];
  onDelete: (id: string | number) => void;
  onUpload?: () => void;
}

const ThumbnailGrid = ({ images, onDelete, onUpload }: ThumbnailGridProps) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 py-3">
    {images.map(({ id, src, alt }) => (
      <div
        key={id}
        className="relative w-full h-32 rounded-xl border border-gray-200/60 overflow-hidden group bg-gray-50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 ease-out"
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <button
          onClick={() => onDelete(id)}
          aria-label={`Delete ${alt}`}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/70 backdrop-blur-md text-red-600 border border-gray-100/50 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-sm cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
      </div>
    ))}
    <button
      onClick={onUpload}
      className="w-full h-32 rounded-xl border border-dashed border-primary/30 flex flex-col items-center justify-center gap-2 text-primary hover:text-primary-dark hover:border-primary/60 hover:bg-brand-50/40 transition-all duration-300 ease-out bg-white shadow-sm hover:shadow-md cursor-pointer group"
    >
      <ImageIcon size={22} />
      <span className="text-xs font-semibold tracking-wide">Upload thumbnail here</span>
    </button>
  </div>
);

export default ThumbnailGrid;
