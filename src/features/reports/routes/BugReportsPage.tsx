import { useState } from "react"
import { Bug, ExternalLink } from "lucide-react"
import { PageHeader } from "../../../components/ui/PageHeader"
import Table from "../../../components/ui/table/Table"
import Badge from "../../../components/ui/Badge"
import Button from "../../../components/ui/Button"
import { formatDateTime } from "../../../lib/utils"
import { useLanguage } from "../../../stores/languageStore"
import {
  getBugReports,
  type BugReportItem,
  type GetBugReportsParams,
} from "../api/bugReports"
import BugReportDetailDialog from "../components/BugReportDetailDialog"

export default function BugReportsPage() {
  const { t } = useLanguage()
  const bugT = (t as any).bugReports || {}
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

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

      <Table<BugReportItem>
        key={refreshKey}
        fetcher={async (page = 1, pageSize = 10) => {
          try {
            const response = await getBugReports({
              pageNumber: page,
              pageSize,
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
        filter={async (attribute, value) => {
          const params: GetBugReportsParams = {}
          if (attribute === "global") {
            params.searchKeyword = value ? String(value) : undefined
          } else if (attribute === "status" && value) {
            params.status = Array.isArray(value) ? String(value[0]) : String(value)
          } else if (attribute === "category" && value) {
            params.category = Array.isArray(value) ? String(value[0]) : String(value)
          }
          const res = await getBugReports(params)
          return {
            data: res.data || [],
            total: res.total || 0,
          }
        }}
        onClickRow={(row) => setSelectedId(row.id)}
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
                <div className="text-xs text-gray-400 capitalize mt-0.5">
                  {r.category || "other"}
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
            name: bugT.columnUrl || "Trang gặp sự cố",
            accessorKey: "url",
            render: (r) => (
              <a
                href={r.url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-primary underline max-w-[200px] truncate flex items-center gap-1"
                title={r.url}
              >
                <span className="truncate">{r.url}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
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
            showFilter: true,
            values: [
              { value: "pending", label: bugT.statusPending || "Chờ xử lý" },
              { value: "in_progress", label: bugT.statusInProgress || "Đang xử lý" },
              { value: "resolved", label: bugT.statusResolved || "Đã giải quyết" },
              { value: "closed", label: bugT.statusClosed || "Đã đóng" },
            ],
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
                  setSelectedId(r.id)
                }}
              >
                {bugT.viewDetails || "Xem chi tiết"}
              </Button>
            ),
          },
        ]}
      />

      {selectedId && (
        <BugReportDetailDialog
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onUpdateSuccess={() => {
            setRefreshKey((k) => k + 1)
            setSelectedId(null)
          }}
        />
      )}
    </div>
  )
}
