import { X } from "lucide-react"

interface BugReportImageLightboxProps {
  imageUrl: string | null
  onClose: () => void
}

export default function BugReportImageLightbox({
  imageUrl,
  onClose,
}: BugReportImageLightboxProps) {
  if (!imageUrl) return null

  return (
    <div
      className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[96vw] max-h-[96vh] flex flex-col items-center justify-center animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-2 sm:right-0 p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer shadow-lg hover:scale-110"
          title="Đóng xem ảnh"
        >
          <X className="w-6 h-6" />
        </button>

        {/* High-res Image */}
        <img
          src={imageUrl}
          alt="Screenshot Preview"
          className="w-auto h-auto max-w-[95vw] max-h-[90vh] rounded-2xl object-contain shadow-2xl border border-white/15 select-none"
        />
      </div>
    </div>
  )
}
