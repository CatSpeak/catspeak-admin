import { IdCardLanyard } from "lucide-react"
// import Button from "../../../components/ui/Button";
import { PageHeader } from "../../../components/ui/PageHeader"
import Table from "../../../components/ui/table/Table"
import { getStaffs, type GetStaffsParams } from "../api/getStaffs"
import type { UserSortBy } from "../../users/api/getUsers"
import { useNavigate } from "react-router-dom"
import type { Account } from "../types"
import {
  formatDateTime,
  formatDateToUtcStartOfDay,
  formatDateToUtcEndOfDay,
} from "../../../lib/utils"
import { useLanguage } from "../../../stores/languageStore"

export default function StaffsPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={<IdCardLanyard />}
        title={t.nav.staffs}
        desc={t.staffs.desc}
      />

      {/* Staff Table */}
      <Table<Account>
        fetcher={async (page, pageSize) => {
          const res = await getStaffs(page, pageSize)
          return {
            data: res.data,
            total: res.additionalData.totalCount,
          }
        }}
        sorter={async (attribute, sortOrder) => {
          let sortBy: UserSortBy | undefined = undefined
          if (attribute === "username") sortBy = "Username"
          else if (attribute === "createDate") sortBy = "CreateDate"

          const order =
            sortOrder === "asc"
              ? "Asc"
              : sortOrder === "desc"
                ? "Desc"
                : undefined
          const res = await getStaffs({ SortBy: sortBy, SortOrder: order })
          return {
            data: res.data,
            total: res.additionalData.totalCount,
          }
        }}
        filter={async (attribute, value, toDate) => {
          const params: GetStaffsParams = {}
          if (attribute === "global") {
            params.SearchKeyword = value ? String(value) : undefined
          } else if (attribute === "phoneNumber") {
            params.PhoneNumber = value ? String(value) : undefined
          } else if (
            attribute === "createDate" ||
            attribute === "dateJoined" ||
            attribute === "fromDate"
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
          const res = await getStaffs(params)
          return {
            data: res.data,
            total: res.additionalData.totalCount,
          }
        }}
        onClickRow={(r) => navigate(`/staffs/${r.accountId}`)}
        headers={[
          {
            name: t.users.id,
            accessorKey: "accountId",
          },
          {
            name: t.users.username,
            accessorKey: "username",
            cellClassName: "font-bold",
            showFilter: true,
          },
          {
            name: t.users.email,
            accessorKey: "email",
            showFilter: true,
            allowSort: true,
            render: (r) => (
              <span className="text-primary underline">{r.email}</span>
            ),
          },
          {
            name: t.users.phone,
            accessorKey: "phoneNumber",
            showFilter: true,
            render: (r) => (
              <span className="whitespace-nowrap">{r.phoneNumber || "—"}</span>
            ),
          },
          {
            name: t.users.dateJoined,
            accessorKey: "createDate",
            isDuration: true,
            showFilter: true,
            render: (p) => (
              <span className="text-sm text-gray-600">
                {formatDateTime(p.createDate)}
              </span>
            ),
          },
          {
            name: t.users.country,
            accessorKey: "country",
          },
          {
            name: t.users.role,
            accessorKey: "roleName",
          },
          {
            name: t.users.lastActive,
            accessorKey: "lastActiveDate",
            render: (p) => (
              <span className="text-sm text-gray-600">
                {p.lastActiveDate || p.lastSeen
                  ? formatDateTime(p.lastActiveDate || p.lastSeen)
                  : "—"}
              </span>
            ),
          },
        ]}
      />
    </div>
  )
}
