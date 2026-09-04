import { useMemo } from "react"
import {
  Clock,
  Globe,
  User,
  Image as ImageIcon,
  Film,
  ExternalLink,
} from "lucide-react"
import { formatDateTime } from "../../../../lib/utils"
import type { BugReportDetail } from "../../api/bugReports"
import { getReporterName } from "../../utils/bugReportUtils"
import { parseBugReportMedia } from "../../utils/bugReportMedia"

interface BugReportOverviewTabProps {
  report: BugReportDetail
  parsedDevice: any
  /** Legacy prop: all attachment URLs (images and/or videos). */
  parsedScreenshots?: string[]
  images?: string[]
  videos?: string[]
  bugT: any
  onPreviewImage: (url: string) => void
  onPreviewVideo?: (url: string) => void
}

export default function BugReportOverviewTab({
  report,
  parsedDevice,
  parsedScreenshots,
  images: imagesProp,
  videos: videosProp,
  bugT,
  onPreviewImage,
  onPreviewVideo,
}: BugReportOverviewTabProps) {
  const { images, videos } = useMemo(() => {
    if (imagesProp || videosProp) {
      return { images: imagesProp ?? [], videos: videosProp ?? [] }
    }
    return parseBugReportMedia(parsedScreenshots ?? report.screenshots)
  }, [imagesProp, videosProp, parsedScreenshots, report.screenshots])
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Grid Metadata Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {bugT.labelReporter || "Người báo cáo"}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {getReporterName(report, bugT)}
              </div>
              <div className="text-xs text-gray-500">
                {report.category === "system_auto" && !report.email
                  ? bugT.systemReporterSub || "Tự động ghi nhận bởi CatSpeak Client"
                  : report.email || "Không có email"}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {bugT.labelReportedAt || "Thời gian & Trang lỗi"}
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{formatDateTime(report.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 truncate">
              <Globe className="w-4 h-4 text-gray-400 shrink-0" />
              <a
                href={report.url}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline truncate hover:text-primary-dark"
              >
                {report.url}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bug Description */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-2">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          {bugT.labelDescription || "Mô tả của người dùng"}
        </div>
        <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
          {report.description || "Không có mô tả chi tiết."}
        </div>
      </div>

      {/* Attachments: screenshots + videos uploaded by the user */}
      {images.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-primary" />
              <span>{bugT.labelScreenshots || "Ảnh chụp màn hình sự cố"}</span>
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary font-bold rounded-full text-[10px]">
                {images.length}
              </span>
            </div>
            <span className="text-[11px] text-gray-400">
              Click vào ảnh để xem kích thước lớn
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((url, index) => (
              <div
                key={`img-${index}`}
                className="group relative rounded-xl border border-gray-200 overflow-hidden bg-gray-100 aspect-video cursor-pointer hover:shadow-md transition-all"
                onClick={() => onPreviewImage(url)}
              >
                <img
                  src={url}
                  alt={`Screenshot ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    // Broken storage URL: hide the tile but keep the
                    // "open original" link below usable for diagnosis.
                    ;(e.currentTarget.closest("div.group") as HTMLElement | null)?.classList.add("hidden")
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-gray-800 text-[11px] font-semibold px-2 py-1 rounded-md shadow-sm">
                    Phóng to
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos Section */}
      {videos.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-primary" />
              <span>{bugT.labelVideos || "Video sự cố người dùng tải lên"}</span>
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary font-bold rounded-full text-[10px]">
                {videos.length}
              </span>
            </div>
            <span className="text-[11px] text-gray-400">
              Bấm play để xem trực tiếp
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {videos.map((url, index) => (
              <div
                key={`vid-${index}`}
                className="rounded-xl border border-gray-200 overflow-hidden bg-black shadow-xs"
              >
                <video
                  src={url}
                  controls
                  preload="metadata"
                  playsInline
                  className="w-full aspect-video bg-black cursor-pointer"
                  onClick={() => (onPreviewVideo ?? onPreviewImage)(url)}
                />
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-primary hover:underline bg-white"
                >
                  <ExternalLink className="w-3 h-3" />
                  Mở video gốc #{index + 1} trong tab mới
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Device / Client Environment */}
      {parsedDevice && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {bugT.labelEnvironment || "Môi trường & Thiết bị người dùng"}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-400 block text-[11px]">{bugT.labelBrowser || "Trình duyệt"}</span>
              <span className="font-semibold text-gray-800">
                {parsedDevice.browser || "Unknown"}
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-400 block text-[11px]">{bugT.labelOs || "Hệ điều hành"}</span>
              <span className="font-semibold text-gray-800">
                {parsedDevice.os || "Unknown"}
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-400 block text-[11px]">{bugT.labelResolution || "Độ phân giải"}</span>
              <span className="font-semibold text-gray-800">
                {parsedDevice.screenResolution || "N/A"}
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-400 block text-[11px]">{bugT.labelTimezone || "Múi giờ"}</span>
              <span className="font-semibold text-gray-800">
                {parsedDevice.timeZone || parsedDevice.timezone || "N/A"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
