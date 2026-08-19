import { useCallback, useMemo } from "react"
import { History } from "lucide-react"
import Table from "../../../../components/ui/table/Table"
import type { TableHeader } from "../../../../components/ui/table/types"
import Badge, { type BadgeType } from "../../../../components/ui/Badge"
import Avatar from "../../../../components/ui/Avatar"
import { getVoucherUsages } from "../../api/getVoucherUsages"
import type {
  VoucherUsageHistoryItem,
  GetVoucherUsagesParams,
} from "../../types"
import { formatDateTime } from "../../../../lib/utils"

export interface VoucherUsageHistoryIslandProps {
  voucherId: number
}

export default function VoucherUsageHistoryIsland({
  voucherId,
}: VoucherUsageHistoryIslandProps) {
  // Fetcher for Table
  const fetcher = useCallback(
    async (page: number = 1, pageSize: number = 10) => {
      const res = await getVoucherUsages(voucherId, { page, pageSize })
      return {
        data: res.data,
        total: res.pagination?.total ?? res.data.length,
      }
    },
    [voucherId],
  )

  // Filter for Table
  const filter = useCallback(
    async (attribute: string, value: unknown) => {
      const params: GetVoucherUsagesParams = {}

      if (attribute === "global") {
        params.search = value ? String(value) : undefined
      } else if (attribute === "status" && value) {
        params.status = Array.isArray(value) ? String(value[0]) : String(value)
      }

      const res = await getVoucherUsages(voucherId, params)
      return {
        data: res.data,
        total: res.pagination?.total ?? res.data.length,
      }
    },
    [voucherId],
  )

  // Status mapping
  const getUsageStatusBadge = useCallback(
    (status: string): { type: BadgeType; label: string } => {
      switch (status) {
        case "Success":
          return { type: "Green", label: "Thành công" }
        case "Pending":
          return { type: "Yellow", label: "Đang xử lý" }
        case "Cancelled":
          return { type: "Red", label: "Đã hủy" }
        default:
          return { type: "Gray", label: status }
      }
    },
    [],
  )

  // Columns definition
  const headers: TableHeader<VoucherUsageHistoryItem>[] = useMemo(
    () => [
      {
        name: "Thời gian",
        accessorKey: "usedAt",
        render: (row) => (
          <span className="text-xs text-gray-700 whitespace-nowrap">
            {formatDateTime(row.usedAt)}
          </span>
        ),
      },
      {
        name: "Người dùng",
        accessorKey: "userName",
        render: (row) => (
          <div className="flex items-center gap-3">
            <Avatar name={row.userName} url={row.userAvatar} size="sm" />
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-xs truncate">
                {row.userName}
              </p>
              <p className="text-[11px] text-gray-500 italic truncate">
                {row.userEmail}
              </p>
            </div>
          </div>
        ),
      },
      {
        name: "Lớp học",
        accessorKey: "className",
        render: (row) => (
          <div className="flex items-center gap-2.5 max-w-xs">
            {row.classThumbnail ? (
              <img
                src={row.classThumbnail}
                alt={row.className || "Class"}
                className="w-8 h-8 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                {(row.className || "L").charAt(0)}
              </div>
            )}
            <span className="text-xs text-gray-800 font-medium truncate">
              {row.className || "—"}
            </span>
          </div>
        ),
      },
      {
        name: "Số tiền giảm",
        accessorKey: "discountAmount",
        render: (row) => (
          <span className="font-bold text-gray-900 text-xs whitespace-nowrap">
            {row.discountAmount.toLocaleString("vi-VN")} đ
          </span>
        ),
      },
      {
        name: "Trạng thái",
        accessorKey: "status",
        showFilter: true,
        values: [
          { label: "Thành công", value: "Success" },
          { label: "Đang xử lý", value: "Pending" },
          { label: "Đã hủy", value: "Cancelled" },
        ],
        render: (row) => {
          const { type, label } = getUsageStatusBadge(row.status)
          return <Badge type={type}>{label}</Badge>
        },
      },
    ],
    [getUsageStatusBadge],
  )

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
          <History size={18} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-base">Lịch sử sử dụng</h3>
          <p className="text-xs text-gray-500">
            Danh sách học viên đã áp dụng voucher này vào đơn hàng
          </p>
        </div>
      </div>

      <Table<VoucherUsageHistoryItem>
        fetcher={fetcher}
        filter={filter}
        headers={headers}
        showGlobalSearch={true}
        defaultPageSize={10}
      />
    </div>
  )
}
