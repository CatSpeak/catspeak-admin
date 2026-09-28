import { Languages } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { PageHeader } from "../../../components/ui/PageHeader"
import Table from "../../../components/ui/table/Table"
import Badge from "../../../components/ui/Badge"
import type {
  LanguageRequestListItem,
  LanguageRequestType,
} from "../types"
import {
  getLanguageRequests,
  type GetLanguageRequestsParams,
} from "../api/getLanguageRequests"
import LanguageRequestStatusBadge from "../components/LanguageRequestStatusBadge"
import { formatDateTime } from "../../../lib/utils"
import { useLanguage } from "../../../stores/languageStore"

export default function LanguageRequestsPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Languages />}
        title={t.languageRequests.title}
        desc={t.languageRequests.desc}
      />

      <Table<LanguageRequestListItem>
        fetcher={async (page, pageSize) => {
          const data = await getLanguageRequests({ page, pageSize })
          return {
            data: data.items,
            total: data.totalCount,
          }
        }}
        filter={async (attribute, value) => {
          const params: GetLanguageRequestsParams = {}
          if (attribute === "global") {
            params.SearchKeyword = value ? String(value) : undefined
          } else if (attribute === "status") {
            const selected = Array.isArray(value) ? value[0] : value
            if (selected !== undefined && selected !== null && selected !== "") {
              params.status = Number(selected)
            }
          } else if (attribute === "requestType") {
            const selected = Array.isArray(value) ? value[0] : value
            if (selected !== undefined && selected !== null && selected !== "") {
              params.requestType = Number(selected) as LanguageRequestType
            }
          }
          const data = await getLanguageRequests(params)
          return {
            data: data.items,
            total: data.totalCount,
          }
        }}
        onClickRow={(request) =>
          navigate(`/language-requests/${request.requestId}`)
        }
        headers={[
          {
            name: t.languageRequests.teacher,
            accessorKey: "fullName",
            render: (request) => (
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {request.fullName}
                </div>
                <div className="text-xs text-gray-500">
                  {request.accountEmail || request.username}
                </div>
              </div>
            ),
          },
          {
            name: t.languageRequests.language,
            accessorKey: "language",
          },
          {
            name: t.languageRequests.requestedLevel,
            accessorKey: "level",
            render: (request) => <>{request.level || "—"}</>,
          },
          {
            name: t.languageRequests.requestType,
            accessorKey: "requestType",
            values: [
              { value: 0, label: t.languageRequests.addType },
              { value: 1, label: t.languageRequests.updateType },
            ],
            showFilter: true,
            render: (request) =>
              request.requestType === 1 ? (
                <Badge title={t.languageRequests.updateType} type="Orange" />
              ) : (
                <Badge title={t.languageRequests.addType} type="Blue" />
              ),
          },
          {
            name: t.common.status,
            accessorKey: "status",
            values: [
              { value: 0, label: t.common.pending },
              { value: 1, label: t.common.approved },
              { value: 2, label: t.common.rejected },
              { value: 3, label: t.common.cancelled },
            ],
            showFilter: true,
            render: (request) => (
              <LanguageRequestStatusBadge status={request.status} />
            ),
          },
          {
            name: t.languageRequests.submittedAt,
            accessorKey: "createdAt",
            render: (request) => (
              <span className="whitespace-nowrap text-gray-600">
                {formatDateTime(request.createdAt)}
              </span>
            ),
          },
        ]}
      />
    </div>
  )
}
