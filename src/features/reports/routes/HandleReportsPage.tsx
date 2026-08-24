import { useState } from "react"
import ReportsSummaryCards from "../components/ReportsSummaryCards"
import ReportDialog from "../components/ReportDialog"
import Table from "../../../components/ui/table/Table"
import {
  // getLetterReports,
  type LetterReport,
  type LetterReportSortBy,
  type GetLetterReportsParams,
  getReportedLetters,
} from "../api/letterReports"
import { PageHeader } from "../../../components/ui/PageHeader"
import { FileText } from "lucide-react"
import { useLanguage } from "../../../stores/languageStore"
import FlagBadge from "../../../components/ui/FlagBadge"
import {
  formatDateTime,
  formatDateToUtcStartOfDay,
  formatDateToUtcEndOfDay,
} from "../../../lib/utils"

export default function HandleReportsPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const { t } = useLanguage()

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={<FileText />}
        title={t.reports.letterReportsTitle}
        desc={t.reports.letterReportsDesc}
      />

      <ReportsSummaryCards />

      {/* Reports Table */}
      <Table<LetterReport>
        fetcher={async (page = 1, pageSize = 10) => {
          try {
            const response = await getReportedLetters({ Page: page, PageSize: pageSize })
            return {
              data: response.data || [],
              total: response.total_records || 0,
            }
          } catch (error) {
            console.error("Error fetching letter reports:", error)
            return {
              data: [],
              total: 0,
            }
          }
        }}
        sorter={async (attribute, sortOrder) => {
          let sortBy: LetterReportSortBy | undefined = undefined
          if (attribute === "storyContent") sortBy = "Content"
          else if (attribute === "username") sortBy = "AuthorUsername"
          else if (attribute === "createDate") sortBy = "CreateDate"
          else if (attribute === "status") sortBy = "Status"

          const order =
            sortOrder === "asc"
              ? "Asc"
              : sortOrder === "desc"
                ? "Desc"
                : undefined
          const res = await getReportedLetters({
            SortBy: sortBy,
            SortOrder: order,
          })
          return {
            data: res.data || [],
            total: res.total_records || 0,
          }
        }}
        filter={async (attribute, value, toDate) => {
          const params: GetLetterReportsParams = {}
          if (attribute === "global") {
            params.SearchKeyword = value ? String(value) : undefined
          } else if (
            attribute === "createDate" ||
            attribute === "fromDate" ||
            attribute === "CreateDate"
          ) {
            const from =
              typeof value === "string"
                ? value
                : Array.isArray(value)
                  ? value[0]
                  : undefined
            const to = toDate || (Array.isArray(value) ? value[1] : undefined)
            params.FromDate = formatDateToUtcStartOfDay(from)
            params.ToDate = formatDateToUtcEndOfDay(to)
          }
          const res = await getReportedLetters(params)
          return {
            data: res.data || [],
            total: res.total_records || 0,
          }
        }}
        onClickRow={(r) => setSelectedId(r.storyId)}
        headers={[
          {
            name: t.users.id,
            accessorKey: "storyId",
            render: (r) => (
              <span className="font-semibold text-gray-900">#{r.storyId}</span>
            ),
          },
          {
            name: t.news.author,
            accessorKey: "username",
            allowSort: true,
            render: (r) => (
              <span className="font-medium text-gray-700">
                {r.username || "—"}
              </span>
            ),
          },
          {
            name: t.news.preview,
            accessorKey: "storyContent",
            allowSort: true,
            render: (r) => (
              <p
                className="text-sm text-gray-650 max-w-md truncate"
                title={r.storyContent}
              >
                {r.storyContent}
              </p>
            ),
          },
          {
            name: t.header.language,
            accessorKey: "languageCommunity",
            render: (p) => <FlagBadge languageType={p.languageCommunity} />,
          },
          {
            name: t.common.createdDate,
            accessorKey: "createDate",
            allowSort: true,
            isDuration: true,
            showFilter: true,
            render: (p) => (
              <span className="text-sm text-gray-600 whitespace-nowrap">
                {formatDateTime(p.createDate)}
              </span>
            ),
          },
        ]}
      />

      {selectedId && (
        <ReportDialog
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onDeleteSuccess={() => {
            setSelectedId(null)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
