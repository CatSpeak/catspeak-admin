import {
  TrendingUp,
  Percent,
  CheckCircle2,
  DollarSign,
  Wallet,
  Coins,
  Receipt,
  RotateCcw,
} from "lucide-react"
import type { VoucherDetail } from "../../types"

export interface VoucherQuickStatsIslandProps {
  voucher: VoucherDetail
}

export default function VoucherQuickStatsIsland({
  voucher,
}: VoucherQuickStatsIslandProps) {
  const isInstructor = voucher.sponsorType === "Instructor"
  const usagePct = voucher.usagePercentage ?? 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
          <TrendingUp size={18} className="text-primary" />
          Thống kê nhanh
        </h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
          Hiệu suất
        </span>
      </div>

      {/* 1. Tổng lượt đã dùng */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex items-center gap-3.5">
        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
          <CheckCircle2 size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 font-medium truncate">Tổng lượt đã dùng</p>
          <div className="text-lg font-bold text-gray-900">
            {voucher.usedCount}{" "}
            <span className="text-xs font-normal text-gray-400">
              {voucher.totalUsageLimit ? `/ ${voucher.totalUsageLimit}` : "lượt"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Tỷ lệ sử dụng */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
              <Percent size={16} />
            </div>
            <span className="text-xs text-gray-500 font-medium">Tỷ lệ sử dụng</span>
          </div>
          <span className="text-sm font-bold text-emerald-600">
            {usagePct.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, usagePct))}%` }}
          />
        </div>
      </div>

      {/* 3. Tổng tiền đã giảm */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex items-center gap-3.5">
        <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 shrink-0">
          <DollarSign size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 font-medium truncate">Tổng tiền đã giảm</p>
          <div className="text-lg font-bold text-gray-900 truncate">
            {(voucher.totalDiscountAmount ?? 0).toLocaleString("vi-VN")} đ
          </div>
        </div>
      </div>

      {/* 4. Đơn hàng thành công */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex items-center gap-3.5">
        <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 shrink-0">
          <Receipt size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 font-medium truncate">Đơn hàng thành công</p>
          <div className="text-lg font-bold text-gray-900">
            {voucher.successfulOrdersCount ?? 0} đơn
          </div>
        </div>
      </div>

      {/* Nhóm Ký quỹ / Cọc (Chỉ dành cho voucher của Giảng viên) */}
      {isInstructor && (
        <div className="pt-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">
            Đối soát Cọc Giáo Viên
          </p>

          <div className="space-y-3">
            {/* 5. Tiền cọc đã đóng */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 shrink-0">
                <Wallet size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium truncate">Tiền cọc đã đóng</p>
                <div className="text-base font-bold text-teal-700 truncate">
                  {(voucher.depositPaid ?? voucher.depositAmount ?? 0).toLocaleString(
                    "vi-VN",
                  )}{" "}
                  đ
                </div>
              </div>
            </div>

            {/* 6. Tiền cọc đã dùng */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                <Coins size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium truncate">
                  Tiền cọc đã khấu trừ
                </p>
                <div className="text-base font-bold text-amber-700 truncate">
                  {(voucher.depositUsed ?? 0).toLocaleString("vi-VN")} đ
                </div>
              </div>
            </div>

            {/* 7. Tiền cọc còn lại */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                <Wallet size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium truncate">
                  Tiền cọc còn lại (Escrow)
                </p>
                <div className="text-base font-bold text-indigo-700 truncate">
                  {(voucher.depositRemaining ?? 0).toLocaleString("vi-VN")} đ
                </div>
              </div>
            </div>

            {/* 8. Ước tính hoàn cọc */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                <RotateCcw size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium truncate">
                  Ước tính hoàn cọc
                </p>
                <div className="text-base font-bold text-purple-700 truncate">
                  {(voucher.estimatedRefund ?? 0).toLocaleString("vi-VN")} đ
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
