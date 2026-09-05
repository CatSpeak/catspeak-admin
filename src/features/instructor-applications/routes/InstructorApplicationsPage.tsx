import { IdCardLanyard } from "lucide-react"
import { PageHeader } from "../../../components/ui/PageHeader"
import Table from "../../../components/ui/table/Table"
import type { InstructorRevisionListItem, RevisionStatus } from "../types"
import {
  getInstructorRevisions,
  type GetInstructorRevisionsParams,
} from "../api/getInstructorRevisions"
import { useNavigate } from "react-router-dom"
import { formatDateTime } from "../../../lib/utils"
import Badge from "../../../components/ui/Badge"
import { useLanguage } from "../../../stores/languageStore"

export default function InstructorApplicationsPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<IdCardLanyard />}
        title={t.instructorApplications.title}
        desc={t.instructorApplications.desc}
      />

      <Table<InstructorRevisionListItem>
        fetcher={async (page, pageSize) => {
          const data = await getInstructorRevisions({ page, pageSize })
          return {
            data: data.items,
            total: data.totalCount,
          }
        }}
        filter={async (attribute, value) => {
          const params: GetInstructorRevisionsParams = {}
          if (attribute === "global") {
            params.SearchKeyword = value ? String(value) : undefined
          } else if (attribute === "status" && value) {
            params.status = (
              Array.isArray(value) ? value[0] : value
            ) as RevisionStatus
          }
          const data = await getInstructorRevisions(params)
          return {
            data: data.items,
            total: data.totalCount,
          }
        }}
        onClickRow={(rev) =>
          navigate(`/instructor-applications/${rev.revisionId}`)
        }
        headers={[
          {
            name: t.users.id,
            accessorKey: "revisionId",
          },
          {
            name: t.users.username,
            accessorKey: "fullName",
            render: (rev) => (
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {rev.fullName}
                </div>
                <div className="text-xs text-gray-500">{rev.username}</div>
              </div>
            ),
          },
          {
            name: t.users.email,
            accessorKey: "accountEmail",
            render: (rev) => (
              <span className="text-primary underline">{rev.accountEmail}</span>
            ),
          },
          {
            name: t.users.phone,
            accessorKey: "phoneNumber",
            render: (rev) => <>{rev.phoneNumber || "—"}</>,
          },
          {
            name: t.instructorApplications.requestType,
            accessorKey: "requestType",
            render: (rev) =>
              rev.requestType === 1 ? (
                <Badge
                  title={t.instructorApplications.initialType}
                  type="Blue"
                />
              ) : (
                <Badge
                  title={t.instructorApplications.updateType}
                  type="Orange"
                />
              ),
          },
          {
            name: t.common.createdDate,
            accessorKey: "createdAt",
            render: (rev) => (
              <span className="whitespace-nowrap text-gray-600">
                {formatDateTime(rev.createdAt)}
              </span>
            ),
          },
          {
            name: t.common.status,
            accessorKey: "status",
            values: [
              { value: "Pending", label: t.common.pending },
              { value: "Approved", label: t.common.approved },
              { value: "Rejected", label: t.common.rejected },
              { value: "Cancelled", label: t.common.cancelled },
              {
                value: "RequestEdit",
                label: t.instructorApplications.requestEdit,
              },
            ],
            showFilter: true,
            render: (rev) => {
              switch (rev.status) {
                case "Pending":
                  return <Badge title={t.common.pending} type="Blue" />
                case "Approved":
                  return <Badge title={t.common.approved} type="Green" />
                case "Rejected":
                  return <Badge title={t.common.rejected} type="Red" />
                case "Cancelled":
                  return <Badge title={t.common.cancelled} type="Gray" />
                case "RequestEdit":
                  return (
                    <Badge
                      title={t.instructorApplications.requestEdit}
                      type="Orange"
                    />
                  )
                default:
                  return <Badge title={rev.status || "?"} type="Gray" />
              }
            },
          },
        ]}
      />
    </div>
  )
}