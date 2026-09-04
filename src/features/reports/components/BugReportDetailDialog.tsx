import { useEffect, useState } from "react"
import {
  X,
  Bug,
  Server,
  Terminal,
  Clock,
  Loader2,
  Save,
  Info,
} from "lucide-react"
import { useLanguage } from "../../../stores/languageStore"
import { useToastStore } from "../../../stores/toastStore"
import Button from "../../../components/ui/Button"
import Badge from "../../../components/ui/Badge"
import {
  getBugReportById,
  updateBugReportStatus,
  type BugReportDetail,
} from "../api/bugReports"
import BugReportOverviewTab from "./bug-report/BugReportOverviewTab"
import BugReportNetworkTab from "./bug-report/BugReportNetworkTab"
import BugReportConsoleTab from "./bug-report/BugReportConsoleTab"
import BugReportBreadcrumbsTab from "./bug-report/BugReportBreadcrumbsTab"
import BugReportImageLightbox from "./bug-report/BugReportImageLightbox"
import { parseBugReportMedia } from "../utils/bugReportMedia"

interface BugReportDetailDialogProps {
  id: string
  onClose: () => void
  onUpdateSuccess: () => void
}

export default function BugReportDetailDialog({
  id,
  onClose,
  onUpdateSuccess,
}: BugReportDetailDialogProps) {
  const { t } = useLanguage()
  const bugT = (t as any).bugReports || {}
  const { addToast } = useToastStore()

  const [report, setReport] = useState<BugReportDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<
    "overview" | "network" | "console" | "breadcrumbs"
  >("overview")

  const [status, setStatus] = useState<string>("pending")
  const [adminNotes, setAdminNotes] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    getBugReportById(id)
      .then((data) => {
        if (!isMounted) return
        setReport(data)
        setStatus(data.status)
        setAdminNotes(data.adminNotes || "")
        setLoading(false)
      })
      .catch((err) => {
        if (!isMounted) return
        console.error("Error loading bug report detail:", err)
        addToast(
          "error",
          bugT.toastLoadError || "Không thể tải chi tiết báo cáo sự cố"
        )
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  const handleSaveStatus = async () => {
    setIsSaving(true)
    try {
      await updateBugReportStatus(id, {
        status,
        adminNotes,
      })
      addToast(
        "success",
        bugT.toastUpdateSuccess || "Cập nhật trạng thái sự cố thành công!"
      )
      onUpdateSuccess()
    } catch (err) {
      console.error("Failed to update status:", err)
      addToast(
        "error",
        bugT.toastUpdateError || "Cập nhật trạng thái thất bại. Vui lòng thử lại!"
      )
    } finally {
      setIsSaving(false)
    }
  }

  // Parse JSON payloads safely.
  // Screenshots payload may hold images and/or videos (JSON array string,
  // single URL, or already-decoded array from the jsonb column).
  let parsedDevice: any = null
  let parsedNetwork: any = null
  let parsedConsole: any = null
  let parsedScreenshots: string[] = []
  let reportImages: string[] = []
  let reportVideos: string[] = []

  if (report) {
    try {
      if (report.deviceInfo) parsedDevice = JSON.parse(report.deviceInfo as string)
    } catch {}
    try {
      if (report.networkLogs) parsedNetwork = JSON.parse(report.networkLogs as string)
    } catch {}
    try {
      if (report.consoleLogs) parsedConsole = JSON.parse(report.consoleLogs as string)
    } catch {}
    const media = parseBugReportMedia(report.screenshots)
    reportImages = media.images
    reportVideos = media.videos
    parsedScreenshots = media.all
  }

  const failedRequests = parsedNetwork?.failedRequests || []
  const networkBreadcrumbs = parsedNetwork?.recentBreadcrumbs || []
  const consoleErrors = parsedConsole?.errors || []

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                  {bugT.dialogTitle
                    ? bugT.dialogTitle.replace("{id}", id.slice(0, 8))
                    : `Chi tiết sự cố #${id.slice(0, 8)}`}
                </h3>
                {report && (
                  <Badge
                    title={
                      status === "pending"
                        ? bugT.statusPending || "Chờ xử lý"
                        : status === "in_progress"
                          ? bugT.statusInProgress || "Đang xử lý"
                          : status === "resolved"
                            ? bugT.statusResolved || "Đã giải quyết"
                            : bugT.statusClosed || "Đã đóng"
                    }
                    type={
                      status === "pending"
                        ? "Yellow"
                        : status === "in_progress"
                          ? "Blue"
                          : status === "resolved"
                            ? "Green"
                            : "Gray"
                    }
                  />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {report?.title || "Đang tải dữ liệu..."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-gray-200 bg-white gap-2 pt-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 pt-1 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Info className="w-4 h-4" />
            <span>{bugT.tabOverview || "Tổng quan & Mô tả"}</span>
          </button>

          <button
            onClick={() => setActiveTab("network")}
            className={`pb-3 pt-1 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "network"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Server className="w-4 h-4" />
            <span>{bugT.tabNetwork || "Lỗi Network"}</span>
            {failedRequests.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-700">
                {failedRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("console")}
            className={`pb-3 pt-1 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "console"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>{bugT.tabConsole || "Lỗi Console"}</span>
            {consoleErrors.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                {consoleErrors.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("breadcrumbs")}
            className={`pb-3 pt-1 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "breadcrumbs"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{bugT.tabContext || "Yêu cầu gần nhất"}</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/40">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-gray-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm">Đang tải thông tin chi tiết báo cáo...</p>
            </div>
          ) : !report ? (
            <div className="py-16 text-center text-gray-500">
              Không tìm thấy thông tin báo cáo sự cố.
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <BugReportOverviewTab
                  report={report}
                  parsedDevice={parsedDevice}
                  parsedScreenshots={parsedScreenshots}
                  images={reportImages}
                  videos={reportVideos}
                  bugT={bugT}
                  onPreviewImage={(url) => setPreviewImageUrl(url)}
                  onPreviewVideo={(url) => setPreviewMediaUrl(url)}
                />
              )}

              {activeTab === "network" && (
                <BugReportNetworkTab
                  failedRequests={failedRequests}
                  bugT={bugT}
                />
              )}

              {activeTab === "console" && (
                <BugReportConsoleTab
                  consoleErrors={consoleErrors}
                  bugT={bugT}
                />
              )}

              {activeTab === "breadcrumbs" && (
                <BugReportBreadcrumbsTab
                  networkBreadcrumbs={networkBreadcrumbs}
                  bugT={bugT}
                />
              )}
            </>
          )}
        </div>

        {/* Footer Admin Action Panel */}
        {report && (
          <div className="p-4 border-t border-gray-200 bg-white flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-700">
                  {bugT.labelUpdateStatus || "Trạng thái:"}
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary/20 text-gray-800"
                >
                  <option value="pending">🟡 {bugT.statusPending || "Pending"}</option>
                  <option value="in_progress">🔵 {bugT.statusInProgress || "In Progress"}</option>
                  <option value="resolved">🟢 {bugT.statusResolved || "Resolved"}</option>
                  <option value="closed">⚪ {bugT.statusClosed || "Closed"}</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-700">
                  {bugT.labelDevNotes || "Ghi chú nội bộ:"}
                </label>
                <input
                  type="text"
                  placeholder={bugT.placeholderDevNotes || "Ghi chú nguyên nhân / mã commit fix..."}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg w-64 focus:outline-hidden focus:ring-2 focus:ring-primary/20 text-gray-800"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                {bugT.btnCancel || (t as any).common?.close || "Đóng"}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveStatus}
                isLoading={isSaving}
                leftIcon={<Save className="w-3.5 h-3.5" />}
              >
                {bugT.btnSave || (t as any).common?.save || "Lưu thay đổi"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Media Preview Modal (images + videos) */}
      <BugReportImageLightbox
        imageUrl={previewImageUrl}
        mediaUrl={previewMediaUrl ?? previewImageUrl}
        onClose={() => {
          setPreviewImageUrl(null)
          setPreviewMediaUrl(null)
        }}
      />
    </div>
  )
}
