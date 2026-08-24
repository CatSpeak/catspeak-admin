import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Bug, Search, X } from "lucide-react"
import { PageHeader } from "../../../components/ui/PageHeader"
import Table from "../../../components/ui/table/Table"
import Badge from "../../../components/ui/Badge"
import Button from "../../../components/ui/Button"
import { formatDateTime } from "../../../lib/utils"
import { useLanguage } from "../../../stores/languageStore"
import {
  getBugReports,
  type BugReportItem,
} from "../api/bugReports"
import { getCategoryLabel } from "../utils/bugReportUtils"
import BugReportsSummaryCards from "../components/BugReportsSummaryCards"

export default function BugReportsPage() {
  const { t } = useLanguage()
  const bugT = (t as any).bugReports || {}
  const navigate = useNavigate()

  const [searchKeyword, setSearchKeyword] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  const isFiltered =
    selectedCategory !== "all" ||
    selectedStatus !== "all" ||
    searchKeyword.trim().length > 0

  const handleClearFilters = useCallback(() => {
    setSelectedCategory("all")
    setSelectedStatus("all")
    setSearchKeyword("")
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={<Bug className="w-5 h-5" />}
        title={bugT.pageTitle || "Báo cáo sự cố & Lỗi người dùng"}
        desc={
          bugT.pageDesc ||
          "Theo dõi, tra cứu log kỹ thuật và xử lý các sự cố báo cáo từ phía người dùng."
        }
      />

      {/* Summary Stats Cards - Loaded independently */}
      <BugReportsSummaryCards />

      {/* Modern Filter Toolbar with Search & 2 Dropdowns */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Left: Search input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder={bugT.searchPlaceholder || "Tìm theo tiêu đề, mô tả hoặc URL..."}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 text-gray-800 shadow-2xs"
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: 2 Dropdown Selects + Clear Action */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Dropdown 1: Category */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">
              {bugT.labelCategory || "Phân loại:"}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2 text-xs font-semibold bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 text-gray-800 cursor-pointer shadow-2xs"
            >
              <option value="all">{bugT.allCategories || "Tất cả phân loại"}</option>
              <option value="ui_issue">{bugT.categoryUi || "Giao diện / Hiển thị"}</option>
              <option value="api_error">{bugT.categoryApi || "Lỗi kết nối / Tải dữ liệu"}</option>
              <option value="video_audio">{bugT.categoryVideo || "Video Call / Âm thanh"}</option>
              <option value="payment">{bugT.categoryPayment || "Thanh toán / Giao dịch"}</option>
              <option value="course_exam">{bugT.categoryCourse || "Khóa học / Bài tập"}</option>
              <option value="other">{bugT.categoryOther || "Khác"}</option>
            </select>
          </div>

          {/* Dropdown 2: Status */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">
              {bugT.columnStatus || "Trạng thái:"}
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3.5 py-2 text-xs font-semibold bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 text-gray-800 cursor-pointer shadow-2xs"
            >
              <option value="all">{bugT.filterAll || "Tất cả trạng thái"}</option>
              <option value="pending">{bugT.statusPending || "Chờ xử lý"}</option>
              <option value="in_progress">{bugT.statusInProgress || "Đang xử lý"}</option>
              <option value="resolved">{bugT.statusResolved || "Đã giải quyết"}</option>
              <option value="closed">{bugT.statusClosed || "Đã đóng"}</option>
            </select>
          </div>

          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
            >
              {bugT.clearFilter || "Xóa lọc"}
            </Button>
          )}
        </div>
      </div>

      {/* Main Bug Reports Table */}
      <Table<BugReportItem>
        key={`${selectedCategory}-${selectedStatus}-${searchKeyword}`}
        showGlobalSearch={false}
        fetcher={async (page = 1, pageSize = 10) => {
          try {
            const response = await getBugReports({
              pageNumber: page,
              pageSize,
              searchKeyword: searchKeyword.trim() || undefined,
              category: selectedCategory !== "all" ? selectedCategory : undefined,
              status: selectedStatus !== "all" ? selectedStatus : undefined,
            })
            return {
              data: response.data || [],
              total: response.total || 0,
            }
          } catch (error) {
            console.error("Error fetching bug reports:", error)
            return {
              data: [],
              total: 0,
            }
          }
        }}
        onClickRow={(row) => navigate(`/bug-reports/${row.id}`)}
        headers={[
          {
            name: "ID",
            accessorKey: "id",
            render: (r) => (
              <span className="font-mono text-xs font-semibold text-gray-500">
                #{r.id.slice(0, 8)}
              </span>
            ),
          },
          {
            name: bugT.columnTitle || "Tiêu đề & Phân loại",
            accessorKey: "title",
            render: (r) => (
              <div className="max-w-xs">
                <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                  {r.title}
                </div>
                <div className="text-xs text-primary font-medium mt-0.5">
                  {getCategoryLabel(r.category, bugT)}
                </div>
              </div>
            ),
          },
          {
            name: bugT.columnReporter || "Người báo cáo",
            accessorKey: "username",
            render: (r) => (
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {r.username || bugT.anonymousUser || "Khách"}
                </div>
                {r.email ? (
                  <div className="text-xs text-primary">{r.email}</div>
                ) : (
                  <div className="text-xs text-gray-400">—</div>
                )}
              </div>
            ),
          },
          {
            name: bugT.columnCreatedAt || "Thời gian",
            accessorKey: "createdAt",
            render: (r) => (
              <span className="whitespace-nowrap text-xs text-gray-600">
                {formatDateTime(r.createdAt)}
              </span>
            ),
          },
          {
            name: bugT.columnStatus || "Trạng thái",
            accessorKey: "status",
            render: (r) => {
              switch (r.status) {
                case "pending":
                  return <Badge title={bugT.statusPending || "Chờ xử lý"} type="Yellow" />
                case "in_progress":
                  return <Badge title={bugT.statusInProgress || "Đang xử lý"} type="Blue" />
                case "resolved":
                  return <Badge title={bugT.statusResolved || "Đã giải quyết"} type="Green" />
                case "closed":
                  return <Badge title={bugT.statusClosed || "Đã đóng"} type="Gray" />
                default:
                  return <Badge title={r.status} type="Gray" />
              }
            },
          },
          {
            name: bugT.columnActions || "Thao tác",
            accessorKey: "actions",
            render: (r) => (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/bug-reports/${r.id}`)
                }}
              >
                {bugT.viewDetails || "Xem chi tiết"}
              </Button>
            ),
          },
        ]}
      />
    </div>
  )
}
