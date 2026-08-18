import {
  Tag,
  Layers,
  Percent,
  DollarSign,
  User,
  BookOpen,
  GraduationCap,
} from "lucide-react"
import type { VoucherDetail } from "../../types"
import { useLanguage } from "../../../../stores/languageStore"
import { formatDateToDisplay, formatDateTime } from "../../../../lib/utils"
import Badge from "../../../../components/ui/Badge"
import Avatar from "../../../../components/ui/Avatar"
import { getScopeTypeLabel } from "../table/tableConfigs"

export interface VoucherGeneralInfoIslandProps {
  voucher: VoucherDetail
}

const renderValue = (val: unknown, fallback: string = "(Không có)") => {
  if (val === undefined || val === null || val === "") {
    return <span className="text-gray-400 italic text-xs">{fallback}</span>
  }
  return <span className="font-semibold text-gray-900">{String(val)}</span>
}

export default function VoucherGeneralInfoIsland({
  voucher,
}: VoucherGeneralInfoIslandProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      {/* ── 1. Cấu hình cơ bản & Giảm giá ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <div className="p-2 rounded-xl bg-red-50 text-red-600">
            <Percent size={18} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">Cấu hình Giảm giá</h3>
            <p className="text-xs text-gray-500">
              Chi tiết các thông số giảm trừ và điều kiện áp dụng
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
            <span className="text-gray-500 font-medium">Mã voucher:</span>
            <div>
              <span className="font-bold text-red-600 font-mono text-sm tracking-wide">
                {voucher.code}
              </span>
            </div>
          </div>

          <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
            <span className="text-gray-500 font-medium">Tên chương trình:</span>
            <div className="font-semibold text-gray-900">{voucher.title}</div>
          </div>

          <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1 sm:col-span-2">
            <span className="text-gray-500 font-medium">Mô tả chi tiết:</span>
            <div className="text-gray-700 italic">
              {voucher.description || (
                <span className="text-gray-400">(Không có)</span>
              )}
            </div>
          </div>

          <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
            <span className="text-gray-500 font-medium">Loại giảm giá:</span>
            <div>
              <Badge
                type={voucher.discountType === "Percentage" ? "Blue" : "Purple"}
              >
                {voucher.discountType === "Percentage"
                  ? t.vouchers.discountTypes.percentage
                  : t.vouchers.discountTypes.fixedAmount}
              </Badge>
            </div>
          </div>

          <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
            <span className="text-gray-500 font-medium">Mức giảm:</span>
            <div className="font-bold text-gray-900 text-sm">
              {voucher.discountType === "Percentage"
                ? `${voucher.discountValue}%`
                : `${voucher.discountValue.toLocaleString("vi-VN")} đ`}
            </div>
          </div>

          <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
            <span className="text-gray-500 font-medium">Giảm tối đa (Max Discount):</span>
            <div>
              {voucher.maxDiscountAmount != null && voucher.maxDiscountAmount > 0
                ? `${voucher.maxDiscountAmount.toLocaleString("vi-VN")} đ`
                : renderValue(null)}
            </div>
          </div>

          <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
            <span className="text-gray-500 font-medium">Đơn hàng tối thiểu (Min Order):</span>
            <div>
              {voucher.minOrderAmount != null && voucher.minOrderAmount > 0
                ? `${voucher.minOrderAmount.toLocaleString("vi-VN")} đ`
                : renderValue(null)}
            </div>
          </div>

          <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
            <span className="text-gray-500 font-medium">Số học viên tối thiểu:</span>
            <div>
              {voucher.minLearners != null
                ? `${voucher.minLearners} học viên`
                : renderValue(null)}
            </div>
          </div>

          <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
            <span className="text-gray-500 font-medium">Thời hạn hiệu lực:</span>
            <div className="font-semibold text-gray-900">
              {formatDateToDisplay(voucher.validFrom) || "—"} đến{" "}
              {voucher.isNeverExpired
                ? t.vouchers.neverExpired || "Không thời hạn"
                : formatDateToDisplay(voucher.validTo) || "—"}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Giới hạn & Quy tắc sử dụng ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Layers size={18} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">
              Giới hạn & Quy tắc sử dụng
            </h3>
            <p className="text-xs text-gray-500">
              Các ràng buộc về số lượng và tài khoản áp dụng
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
            <span className="text-gray-500 font-medium">Tổng lượt sử dụng:</span>
            <div>
              {voucher.isUnlimitedUsage
                ? "Không giới hạn (Unlimited)"
                : voucher.totalUsageLimit != null
                  ? `${voucher.totalUsageLimit} lượt`
                  : renderValue(null)}
            </div>
          </div>

          <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
            <span className="text-gray-500 font-medium">Giới hạn mỗi tài khoản:</span>
            <div>
              {voucher.perUserLimit != null
                ? `${voucher.perUserLimit} lượt / người dùng`
                : renderValue(null)}
            </div>
          </div>

          <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
            <span className="text-gray-500 font-medium">Giới hạn theo ngày (Daily):</span>
            <div>
              {voucher.dailyLimit != null
                ? `${voucher.dailyLimit} lượt / ngày`
                : renderValue(null)}
            </div>
          </div>

          <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
            <span className="text-gray-500 font-medium">Ngân sách tối đa (Max Budget):</span>
            <div>
              {voucher.maxBudget != null && voucher.maxBudget > 0
                ? `${voucher.maxBudget.toLocaleString("vi-VN")} đ`
                : renderValue(null)}
            </div>
          </div>

          <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
            <span className="text-gray-500 font-medium">Chỉ cho người dùng mới:</span>
            <div>
              <Badge type={voucher.isOnlyNewUser ? "Green" : "Gray"}>
                {voucher.isOnlyNewUser ? "Có (Chỉ New User)" : "Không áp dụng"}
              </Badge>
            </div>
          </div>

          <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
            <span className="text-gray-500 font-medium">Không kết hợp ưu đãi khác:</span>
            <div>
              <Badge type={voucher.isNotCombineOther ? "Orange" : "Gray"}>
                {voucher.isNotCombineOther ? "Có (Độc quyền)" : "Cho phép kết hợp"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Phạm vi áp dụng & Đối tượng ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
            <Tag size={18} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">
              Phạm vi áp dụng & Đối tượng
            </h3>
            <p className="text-xs text-gray-500">
              Nguồn tài trợ, khóa học, lớp học và giảng viên được chỉ định
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
            <span className="text-gray-500 font-medium">Nguồn tài trợ:</span>
            <div>
              <Badge type={voucher.sponsorType === "CatSpeak" ? "Red" : "Blue"}>
                {voucher.sponsorType === "CatSpeak"
                  ? t.vouchers.sponsorTypes.catspeak
                  : t.vouchers.sponsorTypes.instructor}
              </Badge>
            </div>
          </div>

          <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
            <span className="text-gray-500 font-medium">Phạm vi áp dụng:</span>
            <div className="font-semibold text-gray-900">
              {getScopeTypeLabel(voucher.scopeType, t.vouchers.scopeTypes)}
            </div>
          </div>
        </div>

        {/* Giảng viên áp dụng */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <User size={14} className="text-gray-400" />
            Giảng viên áp dụng:
          </span>
          {voucher.instructors && voucher.instructors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {voucher.instructors.map((ins) => (
                <div
                  key={ins.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 bg-gray-50"
                >
                  <Avatar name={ins.name} url={ins.image} size="sm" />
                  <div className="truncate">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {ins.name}
                    </p>
                    {ins.subtitle && (
                      <p className="text-[11px] text-gray-500 truncate">
                        {ins.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">(Không có)</p>
          )}
        </div>

        {/* Khóa học áp dụng */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <BookOpen size={14} className="text-gray-400" />
            Khóa học áp dụng:
          </span>
          {voucher.courses && voucher.courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {voucher.courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 bg-gray-50"
                >
                  {course.image ? (
                    <img
                      src={course.image}
                      alt={course.name}
                      className="w-9 h-9 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                      {course.name.charAt(0)}
                    </div>
                  )}
                  <div className="truncate">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {course.name}
                    </p>
                    {course.subtitle && (
                      <p className="text-[11px] text-gray-500 truncate">
                        {course.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">(Không có)</p>
          )}
        </div>

        {/* Lớp học áp dụng */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <GraduationCap size={14} className="text-gray-400" />
            Lớp học áp dụng:
          </span>
          {voucher.classes && voucher.classes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {voucher.classes.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 bg-gray-50"
                >
                  {cls.image ? (
                    <img
                      src={cls.image}
                      alt={cls.name}
                      className="w-9 h-9 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
                      {cls.name.charAt(0)}
                    </div>
                  )}
                  <div className="truncate">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {cls.name}
                    </p>
                    {cls.subtitle && (
                      <p className="text-[11px] text-gray-500 truncate">
                        {cls.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">(Không có)</p>
          )}
        </div>
      </div>

      {/* ── 4. Tiền cọc, Phê duyệt & Nhật ký (Chỉ hiển thị đối với voucher do Giảng viên tài trợ) ── */}
      {voucher.sponsorType !== "CatSpeak" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <DollarSign size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                Ký quỹ, Phê duyệt & Nhật ký
              </h3>
              <p className="text-xs text-gray-500">
                Thông tin nạp cọc giáo viên, phê duyệt và hủy bỏ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
              <span className="text-gray-500 font-medium">Tiền cọc yêu cầu:</span>
              <div>
                {voucher.depositRequired != null && voucher.depositRequired > 0
                  ? `${voucher.depositRequired.toLocaleString("vi-VN")} đ`
                  : renderValue(null)}
              </div>
            </div>

            <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
              <span className="text-gray-500 font-medium">Tiền cọc đã nạp:</span>
              <div>
                {voucher.depositAmount != null && voucher.depositAmount > 0
                  ? `${voucher.depositAmount.toLocaleString("vi-VN")} đ`
                  : renderValue(null)}
              </div>
            </div>

            <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
              <span className="text-gray-500 font-medium">Nội dung chuyển khoản:</span>
              <div>{renderValue(voucher.depositTransactionContent)}</div>
            </div>

            <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
              <span className="text-gray-500 font-medium">Thời gian xác nhận cọc:</span>
              <div>
                {voucher.depositConfirmedAt
                  ? formatDateTime(voucher.depositConfirmedAt)
                  : renderValue(null)}
              </div>
            </div>

            <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
              <span className="text-gray-500 font-medium">Người xác nhận cọc:</span>
              <div>{renderValue(voucher.depositConfirmedBy)}</div>
            </div>

            <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
              <span className="text-gray-500 font-medium">Thời gian tạo:</span>
              <div>{formatDateTime(voucher.createdAt) || renderValue(null)}</div>
            </div>

            <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
              <span className="text-gray-500 font-medium">Người tạo (User ID):</span>
              <div>{renderValue(voucher.createdBy)}</div>
            </div>

            <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
              <span className="text-gray-500 font-medium">Thời gian từ chối:</span>
              <div>
                {voucher.rejectedAt
                  ? formatDateTime(voucher.rejectedAt)
                  : renderValue(null)}
              </div>
            </div>

            <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
              <span className="text-gray-500 font-medium">Người từ chối:</span>
              <div>{renderValue(voucher.rejectedBy)}</div>
            </div>

            <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1 sm:col-span-2">
              <span className="text-gray-500 font-medium">Lý do từ chối:</span>
              <div>{renderValue(voucher.rejectionReason)}</div>
            </div>

            <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1 sm:col-span-2">
              <span className="text-gray-500 font-medium">Ghi chú từ chối:</span>
              <div>{renderValue(voucher.rejectionNote)}</div>
            </div>

            <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
              <span className="text-gray-500 font-medium">Thời gian dừng sớm:</span>
              <div>
                {voucher.stoppedAt
                  ? formatDateTime(voucher.stoppedAt)
                  : renderValue(null)}
              </div>
            </div>

            <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 space-y-1">
              <span className="text-gray-500 font-medium">Người thực hiện dừng:</span>
              <div>{renderValue(voucher.stoppedBy)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
