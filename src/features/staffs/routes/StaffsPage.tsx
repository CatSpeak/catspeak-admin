import { useState } from "react"
import { IdCardLanyard, ShieldCheck, UserMinus } from "lucide-react"
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
import { useAuthStore } from "../../../stores/authStore"
import { PermissionMatrixModal } from "../components/PermissionMatrixModal"
import { demoteStaffToUser } from "../api/permissions"
import { ConfirmModal } from "../../../components/ui/ConfirmModal"
import { getApiErrorMessage } from "../../../lib/axios"

export default function StaffsPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const currentUser = useAuthStore((state) => state.user)
  const isPrimaryAdmin = currentUser?.roleId === 1

  const [selectedStaffForPerm, setSelectedStaffForPerm] = useState<Account | null>(null)
  const [isPermModalOpen, setIsPermModalOpen] = useState(false)
  const [selectedStaffForDemote, setSelectedStaffForDemote] = useState<Account | null>(null)
  const [showDemoteConfirm, setShowDemoteConfirm] = useState(false)
  const [demoting, setDemoting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const executeDemote = async (targetStaff: Account) => {
    if (!isPrimaryAdmin) return
    try {
      setDemoting(true)
      setActionError(null)
      setActionSuccess(null)

      await demoteStaffToUser(targetStaff.accountId)
      setActionSuccess(`Đã hạ cấp tài khoản '${targetStaff.username}' từ Staff xuống User thành công.`)
      setRefreshKey((prev) => prev + 1)
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Không thể hạ cấp tài khoản nhân viên."))
    } finally {
      setDemoting(false)
      setSelectedStaffForDemote(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={<IdCardLanyard />}
        title={t.nav.staffs}
        desc={t.staffs.desc}
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

      {/* Staff Table */}
      <Table<Account>
        key={refreshKey}
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
          },
          {
            name: t.users.email,
            accessorKey: "email",
            allowSort: true,
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
          {
            name: "Thao tác",
            accessorKey: "actions",
            render: (p) => {
              if (p.roleId === 1 || p.roleName === "Admin") {
                return (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                    Primary Admin
                  </span>
                )
              }

              return (
                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedStaffForPerm(p)
                      setIsPermModalOpen(true)
                    }}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Phân Quyền</span>
                  </button>

                  {isPrimaryAdmin && p.roleId === 3 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedStaffForDemote(p)
                        setShowDemoteConfirm(true)
                      }}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg text-rose-600 border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                      <span>Hạ Cấp</span>
                    </button>
                  )}
                </div>
              )
            },
          },
        ]}
      />

      {selectedStaffForPerm && (
        <PermissionMatrixModal
          isOpen={isPermModalOpen}
          onClose={() => {
            setIsPermModalOpen(false)
            setSelectedStaffForPerm(null)
          }}
          staffId={selectedStaffForPerm.accountId}
          staffName={selectedStaffForPerm.username}
          onSuccess={() => {
            setActionSuccess(`Đã cập nhật phân quyền cho Staff '${selectedStaffForPerm.username}' thành công.`)
            setRefreshKey((prev) => prev + 1)
          }}
        />
      )}

      <ConfirmModal
        isOpen={showDemoteConfirm}
        onClose={() => {
          setShowDemoteConfirm(false)
          setSelectedStaffForDemote(null)
        }}
        onConfirm={() => {
          setShowDemoteConfirm(false)
          if (selectedStaffForDemote) {
            executeDemote(selectedStaffForDemote)
          }
        }}
        title="Xác nhận hạ cấp người dùng"
        description={
          <span>
            Bạn có chắc chắn muốn hạ cấp tài khoản{" "}
            <strong className="text-gray-900">
              '{selectedStaffForDemote?.username}'
            </strong>{" "}
            từ <strong>Staff</strong> xuống <strong>User</strong>?
            <br />
            Tài khoản này sẽ lập tức mất toàn bộ quyền truy cập vào trang Admin và bị thu hồi các phân quyền Staff hiện có.
          </span>
        }
        confirmText="Hạ cấp xuống User"
        variant="danger"
        isLoading={demoting}
      />
    </div>
  )
}
