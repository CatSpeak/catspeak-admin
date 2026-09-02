import { useState } from "react"
import Badge from "../../../components/ui/Badge"
import { UsersRound, UserPlus, LockOpen, ShieldCheck } from "lucide-react"
import { PageHeader } from "../../../components/ui/PageHeader"
import Table from "../../../components/ui/table/Table"
import ActionsMenu from "../../../components/ui/table/components/ActionsMenu"
import { unlockUser } from "../api/unlockUser"
import { activateUser } from "../api/activateUser"
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
import { useAuthStore } from "../../../stores/authStore"
import { promoteUserToStaff } from "../../staffs/api/permissions"
import { ConfirmModal } from "../../../components/ui/ConfirmModal"
import { getApiErrorMessage } from "../../../lib/axios"

export default function UsersPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const currentUser = useAuthStore((state) => state.user)
  const isPrimaryAdmin = currentUser?.roleId === 1

  const [selectedUserForPromote, setSelectedUserForPromote] = useState<Account | null>(null)
  const [showPromoteConfirm, setShowPromoteConfirm] = useState(false)
  const [promoting, setPromoting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [selectedForUnlock, setSelectedForUnlock] = useState<Account | null>(null)
  const [showUnlockConfirm, setShowUnlockConfirm] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  const [selectedForActivate, setSelectedForActivate] = useState<Account | null>(null)
  const [showActivateConfirm, setShowActivateConfirm] = useState(false)
  const [activating, setActivating] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

  const executePromoteToStaff = async (targetUser: Account) => {
    if (!isPrimaryAdmin) return
    try {
      setPromoting(true)
      setActionError(null)
      setActionSuccess(null)

      await promoteUserToStaff(targetUser.accountId)
      setActionSuccess(`Đã thăng cấp người dùng '${targetUser.username}' thành Staff thành công.`)
      setRefreshKey((prev) => prev + 1)
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Không thể thăng cấp người dùng thành Staff."))
    } finally {
      setPromoting(false)
      setSelectedUserForPromote(null)
    }
  }

  const executeUnlock = async () => {
    if (!selectedForUnlock) return
    try {
      setUnlocking(true)
      setActionError(null)
      setActionSuccess(null)
      const res = await unlockUser(selectedForUnlock.accountId)
      setActionSuccess(res.message)
      setRefreshKey((p) => p + 1)
      setShowUnlockConfirm(false)
      setSelectedForUnlock(null)
    } catch (err) {
      setActionError(getApiErrorMessage(err, t.users.unlockFailed))
    } finally {
      setUnlocking(false)
    }
  }

  const executeActivate = async () => {
    if (!selectedForActivate) return
    try {
      setActivating(true)
      setActionError(null)
      setActionSuccess(null)
      const res = await activateUser(selectedForActivate.accountId)
      setActionSuccess(res.message)
      setRefreshKey((p) => p + 1)
      setShowActivateConfirm(false)
      setSelectedForActivate(null)
    } catch (err) {
      setActionError(getApiErrorMessage(err, t.users.activateFailed))
    } finally {
      setActivating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={<UsersRound />}
        title={t.users.title}
        desc={t.users.desc}
      />

      {actionError && (
        <div className="p-4 rounded-xl bg-error-50 border border-error-150 text-error-700 text-xs font-semibold">
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-success-50 border border-success-150 text-success-700 text-xs font-semibold">
          {actionSuccess}
        </div>
      )}

      <Table<Account>
        key={refreshKey}
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
          return {
            data: res.data,
            total: res.additionalData?.totalCount ?? res.total_records ?? 0,
          }
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
            params.FromDate = formatDateToUtcStartOfDay(from)
            params.ToDate = formatDateToUtcEndOfDay(to)
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
            render: (p) => (
              <span className="text-sm text-gray-600">
                {formatDateTime(p.lastSeen)}
              </span>
            ),
          },
          {
            name: t.users.actions,
            accessorKey: "actions",
            render: (p) => {
              const isStaff = p.roleId === 3 || p.roleName === "Staff"
              const isAdmin = p.roleId === 1 || p.roleName === "Admin"

              if (isAdmin) {
                return (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                    Primary Admin
                  </span>
                )
              }

              if (isStaff) {
                return (
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                    Staff
                  </span>
                )
              }

              const actions = [
                {
                  label: t.users.unlock,
                  icon: <LockOpen className="w-4 h-4" />,
                  handler: (row: Account) => {
                    setSelectedForUnlock(row)
                    setShowUnlockConfirm(true)
                  },
                  hidden: (row: Account) => !row.isLocked,
                },
                {
                  label: t.users.activate,
                  icon: <ShieldCheck className="w-4 h-4" />,
                  handler: (row: Account) => {
                    setSelectedForActivate(row)
                    setShowActivateConfirm(true)
                  },
                  hidden: (row: Account) => !row.isPendingActivation,
                },
                {
                  label: t.users.promoteToStaffShort,
                  icon: <UserPlus className="w-4 h-4" />,
                  handler: (row: Account) => {
                    setSelectedUserForPromote(row)
                    setShowPromoteConfirm(true)
                  },
                  hidden: (row: Account) => !isPrimaryAdmin || row.roleId !== 2,
                },
              ]

              const hasAny = actions.some((a) => !a.hidden?.(p))
              if (!hasAny) return <span className="text-gray-400 text-xs">—</span>

              return (
                <ActionsMenu
                  row={p}
                  actions={actions}
                  isOpen={openMenuId === p.accountId}
                  onToggle={() => setOpenMenuId(openMenuId === p.accountId ? null : p.accountId)}
                  onClose={() => setOpenMenuId(null)}
                />
              )
            },
          },
        ]}
      />

      <ConfirmModal
        isOpen={showPromoteConfirm}
        onClose={() => {
          setShowPromoteConfirm(false)
          setSelectedUserForPromote(null)
        }}
        onConfirm={() => {
          setShowPromoteConfirm(false)
          if (selectedUserForPromote) {
            executePromoteToStaff(selectedUserForPromote)
          }
        }}
        title="Xác nhận thăng cấp người dùng"
        description={
          <span>
            Bạn có chắc chắn muốn thăng cấp người dùng{" "}
            <strong className="text-gray-900">
              '{selectedUserForPromote?.username}'
            </strong>{" "}
            thành <strong>Staff</strong>?
            <br />
            Tài khoản này sẽ có quyền truy cập vào hệ thống Admin với các phân quyền cơ bản.
          </span>
        }
        confirmText="Thăng cấp thành Staff"
        variant="primary"
        isLoading={promoting}
      />

      <ConfirmModal
        isOpen={showUnlockConfirm}
        onClose={() => {
          if (!unlocking) {
            setShowUnlockConfirm(false)
            setSelectedForUnlock(null)
          }
        }}
        onConfirm={executeUnlock}
        title={t.users.confirmUnlockTitle}
        description={
          <span>
            {selectedForUnlock ? t.users.confirmUnlockDesc.replace("{username}", selectedForUnlock.username) : ""}
          </span>
        }
        confirmText={t.users.unlock}
        variant="warning"
        isLoading={unlocking}
      />

      <ConfirmModal
        isOpen={showActivateConfirm}
        onClose={() => {
          if (!activating) {
            setShowActivateConfirm(false)
            setSelectedForActivate(null)
          }
        }}
        onConfirm={executeActivate}
        title={t.users.confirmActivateTitle}
        description={
          <span>
            {selectedForActivate ? t.users.confirmActivateDesc.replace("{username}", selectedForActivate.username) : ""}
          </span>
        }
        confirmText={t.users.activate}
        variant="primary"
        isLoading={activating}
      />
    </div>
  )
}
