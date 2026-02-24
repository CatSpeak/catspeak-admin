import { Image as ImageIcon } from "lucide-react";
import CharCountInput from "./CharCountInput";

interface UploadBlockProps {
  caption: string;
  onCaptionChange: (val: string) => void;
  onUpload?: () => void;
}

const UploadBlock = ({
  caption,
  onCaptionChange,
  onUpload,
}: UploadBlockProps) => (
  <div className="w-full">
    <div
      role="button"
      tabIndex={0}
      onClick={onUpload}
      onKeyDown={(e) => e.key === "Enter" && onUpload?.()}
      className="w-full bg-white border border-dashed border-red-300 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-red-50/30 transition-colors min-h-[160px]"
    >
      <div className="text-red-400 flex flex-col items-center">
        <ImageIcon size={32} />
        <span className="text-xs font-medium mt-2">Upload image here</span>
      </div>
    </div>
    <CharCountInput
      value={caption}
      onChange={onCaptionChange}
      placeholder="Image Caption"
      className="text-xs text-gray-600 italic mt-2"
    />
  </div>
);

export default UploadBlock;
