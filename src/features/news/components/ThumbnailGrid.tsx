import { Trash2, Image as ImageIcon, Film, Play } from "lucide-react";
import type { ThumbnailImage } from "../types";

interface ThumbnailGridProps {
  images: ThumbnailImage[];
  onDelete: (id: string | number) => void;
  onUpload?: () => void;
}

const ThumbnailGrid = ({ images, onDelete, onUpload }: ThumbnailGridProps) => {
  const checkIsVideo = (img: ThumbnailImage) => {
    if (img.file?.type.startsWith("video/")) return true;
    const lowerSrc = img.src.toLowerCase();
    const lowerAlt = img.alt.toLowerCase();
    return (
      lowerSrc.endsWith(".mp4") ||
      lowerSrc.endsWith(".webm") ||
      lowerSrc.endsWith(".ogg") ||
      lowerSrc.includes("video") ||
      lowerAlt.includes("video")
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Thumbnail Assets ({images.length})
        </label>
        <span className="text-xs text-gray-400">
          Upload images for thumbnail
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {images.map((img) => {
          const isVideo = checkIsVideo(img);
          return (
            <div
              key={img.id}
              className="relative w-full h-32 rounded-2xl border border-gray-100 overflow-hidden group bg-gray-50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 ease-out"
            >
              {isVideo ? (
                <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
                  <video
                    src={img.src}
                    className="w-full h-full object-cover opacity-80"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="p-2.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 group-hover:scale-110 transition-transform duration-300">
                      <Play size={16} fill="currentColor" className="ml-0.5" />
                    </span>
                  </div>
                  <span className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] font-semibold text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md">
                    <Film size={10} /> Video
                  </span>
                </div>
              ) : (
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              {/* Blur Hover Overlay */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <button
                type="button"
                onClick={() => onDelete(img.id)}
                aria-label={`Delete ${img.alt}`}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/85 backdrop-blur-md text-red-600 border border-gray-100/50 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-sm cursor-pointer z-10"
              >
                <Trash2 size={13} />
              </button>
            </div>
          );
        })}

        {/* Upload Trigger */}
        <button
          type="button"
          onClick={onUpload}
          className="w-full h-32 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-primary hover:border-primary/40 hover:bg-brand-50/20 transition-all duration-300 bg-white shadow-sm hover:shadow-md cursor-pointer group"
        >
          <div className="p-2.5 rounded-full bg-gray-50 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300">
            <ImageIcon size={20} />
          </div>
          <span className="text-[11px] font-semibold tracking-wide uppercase">
            Add Media
          </span>
        </button>
      </div>
    </div>
  );
};

export default ThumbnailGrid;
