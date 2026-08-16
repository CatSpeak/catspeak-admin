import Badge from "../../../components/ui/Badge"
import { UsersRound } from "lucide-react"
// import Button from "../../../components/ui/Button";
import { PageHeader } from "../../../components/ui/PageHeader"
import Table from "../../../components/ui/table/Table"
import {
  getAccounts,
  type GetUsersParams,
  type UserSortBy,
} from "../api/getUsers"
import { useNavigate } from "react-router-dom"
import { formatDateTime } from "../../../lib/utils"
import type { Account } from "../types"
import { useLanguage } from "../../../stores/languageStore"

export default function UsersPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={<UsersRound />}
        title={t.users.title}
        desc={t.users.desc}
      />

      <Table<Account>
        fetcher={async (page, pageSize) => {
          const res = await getAccounts(page, pageSize)

          return {
            data: res.data,
            total: res.additionalData?.totalCount ?? res.total_records ?? 0,
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
          const res = await getAccounts({ SortBy: sortBy, SortOrder: order })
          return res.data
        }}
        filter={async (attribute, value, toDate) => {
          const params: GetUsersParams = {}
          if (attribute === "global") {
            params.SearchKeyword = value ? String(value) : undefined
          } else if (attribute === "phoneNumber") {
            params.PhoneNumber = value ? String(value) : undefined
          } else if (attribute === "country" && value) {
            params.Countries = Array.isArray(value)
              ? value.map(String)
              : [String(value)]
          } else if (attribute === "level" && value) {
            params.Levels = Array.isArray(value)
              ? value.map(String)
              : [String(value)]
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
            params.FromDate = from || undefined
            params.ToDate = to || undefined
          }
          const res = await getAccounts(params)
          return {
            data: res.data,
            total: res.additionalData?.totalCount ?? res.total_records ?? 0,
          }
        }}
        onClickRow={(r) => navigate(`/users/${r.accountId}`)}
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
            allowSort: true,
          },
          {
            name: t.users.email,
            accessorKey: "email",
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
            name: t.users.level,
            accessorKey: "level",
          },
          {
            name: t.users.role,
            accessorKey: "roleName",
          },
          {
            name: t.users.isTeacher,
            accessorKey: "isInstructor",
            render: (p) => {
              const isTeacher =
                p.isInstructor ||
                p.roleName === "Teacher" ||
                p.roleName === "Instructor"
              return isTeacher ? (
                <Badge type="Green" showDot>
                  Giảng viên
                </Badge>
              ) : (
                <span className="text-gray-400">—</span>
              )
            },
          },
          {
            name: t.users.lastActive,
            accessorKey: "lastSeen",
            showFilter: false,
            allowSort: false,
            render: (p) => (
              <span className="text-sm text-gray-600">
                {formatDateTime(p.lastSeen)}
              </span>
            ),
          },
        ]}
      />
    </div>
  )
}
