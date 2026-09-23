import { useCallback, useMemo } from "react"
import { UsersRound, LockOpen } from "lucide-react"
import { PageHeader } from "../../../components/ui/PageHeader"
import Table from "../../../components/ui/table/Table"
import {
  getAccounts,
  type GetUsersParams,
  type UserSortBy,
} from "../api/getUsers"
import { useNavigate } from "react-router-dom"
import {
  formatDateTime,
  formatDateToUtcStartOfDay,
  formatDateToUtcEndOfDay,
} from "../../../lib/utils"
import type { Account } from "../types"
import { useLanguage } from "../../../stores/languageStore"
import type { TableHeader } from "../../../components/ui/table/types"

export default function UsersPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const fetcher = useCallback(async (page: number, pageSize: number) => {
    const res = await getAccounts(page, pageSize)
    return {
      data: res.data,
      total: res.additionalData?.totalCount ?? res.total_records ?? 0,
    }
  }, [])

  const sorter = useCallback(async (attribute: string, sortOrder: string | undefined) => {
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
    return {
      data: res.data,
      total: res.additionalData?.totalCount ?? res.total_records ?? 0,
    }
  }, [])

  const filter = useCallback(async (attribute: string, value: unknown, toDate?: string) => {
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
      params.FromDate = formatDateToUtcStartOfDay(from)
      params.ToDate = formatDateToUtcEndOfDay(to)
    }
    const res = await getAccounts(params)
    return {
      data: res.data,
      total: res.additionalData?.totalCount ?? res.total_records ?? 0,
    }
  }, [])

  const headers: TableHeader<Account>[] = useMemo(
    () => [
      {
        name: t.users.id,
        accessorKey: "accountId",
      },
      {
        name: t.users.username,
        accessorKey: "username",
        cellClassName: "font-bold",
        allowSort: true,
        render: (r) => (
          <span className="inline-flex items-center gap-1.5">
            <span className={r.isTeacherAccount ? "text-emerald-700" : undefined}>
              {r.username}
            </span>
            <span
              className={
                r.isTeacherAccount
                  ? "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold bg-emerald-50 text-emerald-700 border-emerald-200 whitespace-nowrap"
                  : "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold bg-gray-50 text-gray-500 border-gray-200 whitespace-nowrap"
              }
            >
              {r.isTeacherAccount ? t.users.teacherBadge : t.users.studentBadge}
            </span>
            {!r.isTeacherAccount && r.teacherAccountId != null && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap">
                {t.users.hasTeacherAccountBadge}
              </span>
            )}
          </span>
        ),
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
            name: t.users.level,
            accessorKey: "level",
          },
          {
            name: t.users.role,
            accessorKey: "roleName",
          },
          {
            name: t.common.status,
            accessorKey: "status",
            render: (p) => {
              if (p.isLocked) {
                return (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold bg-amber-50 text-amber-700 border-amber-200 whitespace-nowrap">
                    <LockOpen className="w-3 h-3" />
                    {t.users.lockedBadge}
                    {p.remainingMinutes ? ` • ${t.users.remainingMinutes.replace("{minutes}", String(p.remainingMinutes))}` : ""}
                  </span>
                )
              }
              if (p.isPendingActivation) {
                return (
                  <span className="inline-flex px-2.5 py-0.5 rounded-full border text-[10px] font-bold bg-blue-50 text-blue-700 border-blue-200">
                    {t.users.pendingActivationBadge}
                  </span>
                )
              }
              if (p.status === 0 || p.status === 3) {
                return (
                  <span className="inline-flex px-2.5 py-0.5 rounded-full border text-[10px] font-bold bg-error-50 text-error-700 border-error-100">
                    {t.users.banned}
                  </span>
                )
              }
              return (
                <span className="inline-flex px-2.5 py-0.5 rounded-full border text-[10px] font-bold bg-success-50 text-success-700 border-success-100">
                  {t.common.active}
                </span>
              )
            },
          },
          {
            name: t.users.lastActive,
            accessorKey: "lastSeen",
            render: (p) => (
              <span className="text-sm text-gray-600">
                {formatDateTime(p.lastSeen)}
              </span>
            ),
          },
    ],
    [t],
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={<UsersRound />}
        title={t.users.title}
        desc={t.users.desc}
      />

      <Table<Account>
        fetcher={fetcher}
        sorter={sorter as never}
        filter={filter as never}
        onClickRow={(r) => navigate(`/users/${r.accountId}`)}
        headers={headers}
      />
    </div>
  )
}
