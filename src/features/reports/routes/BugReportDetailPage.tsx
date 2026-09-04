import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
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
import { getCategoryLabel } from "../utils/bugReportUtils"
import { parseBugReportMedia } from "../utils/bugReportMedia"
import BugReportOverviewTab from "../components/bug-report/BugReportOverviewTab"
import BugReportNetworkTab from "../components/bug-report/BugReportNetworkTab"
import BugReportConsoleTab from "../components/bug-report/BugReportConsoleTab"
import BugReportBreadcrumbsTab from "../components/bug-report/BugReportBreadcrumbsTab"
import BugReportImageLightbox from "../components/bug-report/BugReportImageLightbox"

export default function BugReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const bugT = (t as any).bugReports || {}
  const { addToast } = useToastStore()

  const [report, setReport] = useState<BugReportDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<
    "overview" | "network" | "console" | "breadcrumbs"
  >("overview")

  const [status, setStatus] = useState<
    "pending" | "in_progress" | "resolved" | "closed"
  >("pending")
  const [adminNotes, setAdminNotes] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
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
    if (!id) return
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
      setReport((prev) => (prev ? { ...prev, status, adminNotes } : prev))
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

  // Parse JSON telemetry payloads safely.
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

  if (loading) {
    return (
      <div className="min-h-[450px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-9 h-9 animate-spin text-primary" />
        <p className="text-sm text-gray-500 font-medium">
          Đang tải thông tin chi tiết sự cố...
        </p>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-4 max-w-lg mx-auto mt-12 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <Bug className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">
          Không tìm thấy báo cáo sự cố
        </h3>
        <p className="text-sm text-gray-500">
          Báo cáo này có thể đã bị xóa hoặc đường dẫn không hợp lệ.
        </p>
        <Button variant="primary" onClick={() => navigate("/bug-reports")}>
          Quay lại danh sách sự cố
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fade-in">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/bug-reports")}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all cursor-pointer shadow-2xs"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                #{id?.slice(0, 8)}
              </span>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                {report.title}
              </h1>
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
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1.5">
              <span>{bugT.labelCategory || "Phân loại:"}</span>
              <span className="font-semibold text-gray-800 px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200/60">
                {getCategoryLabel(report.category, bugT)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Status and Save Panel */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-600">
              Trạng thái:
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="px-3.5 py-2 text-xs font-semibold bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 text-gray-800 cursor-pointer shadow-2xs"
            >
              <option value="pending">{bugT.statusPending || "Chờ xử lý"}</option>
              <option value="in_progress">{bugT.statusInProgress || "Đang xử lý"}</option>
              <option value="resolved">{bugT.statusResolved || "Đã giải quyết"}</option>
              <option value="closed">{bugT.statusClosed || "Đã đóng"}</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={bugT.placeholderDevNotes || "Ghi chú nội bộ / mã commit fix..."}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="px-3.5 py-2 text-xs bg-white border border-gray-300 rounded-xl w-64 md:w-80 focus:outline-hidden focus:ring-2 focus:ring-primary/20 text-gray-800 shadow-2xs"
            />
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleSaveStatus}
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
            className="rounded-xl px-5"
          >
            {bugT.btnSave || (t as any).common?.save || "Lưu trạng thái"}
          </Button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="flex items-center px-6 border-b border-gray-200 bg-white gap-6 pt-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 pt-2.5 px-1 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === "overview"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            <Info className="w-4 h-4" />
            <span>{bugT.tabOverview || "Tổng quan & Mô tả"}</span>
            {parsedScreenshots.length > 0 && (
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[11px] font-bold">
                {reportImages.length > 0 && reportVideos.length > 0
                  ? `${reportImages.length} ảnh + ${reportVideos.length} video`
                  : reportVideos.length > 0
                    ? `${reportVideos.length} video`
                    : `${reportImages.length} ảnh`}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("network")}
            className={`pb-3 pt-2.5 px-1 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === "network"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            <Server className="w-4 h-4" />
            <span>{bugT.tabNetwork || "Lỗi Network HTTP"}</span>
            {failedRequests.length > 0 && (
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-red-100 text-red-700">
                {failedRequests.length} lỗi
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("console")}
            className={`pb-3 pt-2.5 px-1 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === "console"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>{bugT.tabConsole || "Lỗi Console & Runtime"}</span>
            {consoleErrors.length > 0 && (
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-100 text-amber-800">
                {consoleErrors.length} log
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("breadcrumbs")}
            className={`pb-3 pt-2.5 px-1 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === "breadcrumbs"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{bugT.tabContext || "Yêu cầu mạng gần nhất"}</span>
          </button>
        </div>

        {/* Tab Content Panel */}
        <div className="p-8 bg-gray-50/30">
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
        </div>
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
