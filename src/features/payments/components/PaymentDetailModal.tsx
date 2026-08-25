import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  CreditCard,
  User,
  Calendar,
  DollarSign,
  ExternalLink,
  Copy,
  Check,
  FileText,
} from "lucide-react";
import type { Payment } from "../api/paymentsApi";
import Button from "../../../components/ui/Button";
import Badge, { type BadgeType } from "../../../components/ui/Badge";
import { formatAmount, formatDateTime } from "../../../lib/utils";
import { useLanguage } from "../../../stores/languageStore";

interface PaymentDetailModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentDetailModal({
  payment,
  isOpen,
  onClose,
}: PaymentDetailModalProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Focus management and ESC listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !payment) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusConfig = (
    status: number,
  ): {
    label: string;
    badgeType: BadgeType;
  } => {
    switch (status) {
      case 1:
        return {
          label: t.reports?.statusSuccess || "Thành công",
          badgeType: "Green",
        };
      case 2:
        return {
          label: t.reports?.statusFailed || "Thất bại",
          badgeType: "Red",
        };
      case 3:
        return {
          label: t.reports?.statusPending || "Chờ thanh toán",
          badgeType: "Yellow",
        };
      case 4:
        return {
          label: t.reports?.statusRefunded || "Đã hoàn tiền",
          badgeType: "Blue",
        };
      case 0:
        return {
          label: t.reports?.statusCancelled || "Đã hủy",
          badgeType: "Gray",
        };
      default:
        return {
          label: `Trạng thái: ${status}`,
          badgeType: "Gray",
        };
    }
  };

  const statusConfig = getStatusConfig(payment.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] transition-all"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary flex items-center justify-center border border-primary-100 shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900">
                  {t.reports?.transactionManagementTitle || "Chi tiết giao dịch"}
                </h3>
                <span className="font-mono font-bold text-sm px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                  #{payment.paymentId}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status & Amount Highlight Banner */}
          <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                {t.reports?.amount || "Số tiền thanh toán"}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight mt-1">
                {formatAmount(payment.amount)}
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <Badge title={statusConfig.label} type={statusConfig.badgeType} />
            </div>
          </div>

          {/* Customer & User Profile */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-50">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-primary" />
                {t.reports?.paymentUser || "Thông tin khách hàng"}
              </h4>
              {payment.userId && (
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/users/${payment.userId}`);
                  }}
                  className="text-xs font-semibold text-primary hover:text-primary-dark hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Xem trang cá nhân</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <span className="text-xs text-gray-400 block">Họ và tên</span>
                <span className="text-sm font-bold text-gray-900">
                  {payment.username || "Chưa cập nhật"}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Email</span>
                <span className="text-sm font-semibold text-gray-700 break-all">
                  {payment.email || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Payment & Order Details */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-50">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              Chi tiết giao dịch & Đơn hàng
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Order Code */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 block">Mã đơn hàng (Order Code)</span>
                  <span className="text-sm font-mono font-bold text-gray-900">
                    {payment.orderCode ?? "—"}
                  </span>
                </div>
                {payment.orderCode && (
                  <button
                    onClick={() =>
                      handleCopy(String(payment.orderCode), "orderCode")
                    }
                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-white rounded-lg transition-colors cursor-pointer"
                    title="Sao chép mã đơn"
                  >
                    {copiedField === "orderCode" ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Payment Method */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-400 block">
                  {t.reports?.paymentMethod || "Phương thức thanh toán"}
                </span>
                <div className="mt-1 text-xs font-semibold text-gray-800">
                  {payment.method === "Free"
                    ? t.reports?.methodFree || "Miễn phí"
                    : payment.method || "N/A"}
                </div>
              </div>

              {/* Payment Type */}
              {payment.paymentType && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-400 block mb-1">
                    {t.reports?.transactionType || "Loại giao dịch"}
                  </span>
                  <div>
                    {payment.paymentType === "Subscription" && (
                      <Badge title={t.reports?.typeSubscription || "Gói thành viên"} type="Orange" />
                    )}
                    {payment.paymentType === "ClassOpeningFee" && (
                      <Badge title={t.reports?.typeClassOpeningFee || "Phí mở lớp"} type="Red" />
                    )}
                    {payment.paymentType === "ClassEnrollment" && (
                      <Badge title={t.reports?.typeClassEnrollment || "Đăng ký lớp"} type="Purple" />
                    )}
                    {payment.paymentType !== "Subscription" &&
                      payment.paymentType !== "ClassOpeningFee" &&
                      payment.paymentType !== "ClassEnrollment" && (
                        <Badge title={payment.paymentType} type="Gray" />
                      )}
                  </div>
                </div>
              )}

              {/* Date */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-400 block">
                  {t.reports?.paymentDate || "Thời gian khởi tạo"}
                </span>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-gray-700">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>{formatDateTime(payment.createDate)}</span>
                </div>
              </div>
            </div>

            {/* Admin Note if available */}
            {payment.adminNote && (
              <div className="mt-3 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold mb-1">
                  <FileText className="w-4 h-4" />
                  <span>Ghi chú hệ thống / Quản trị viên:</span>
                </div>
                <p className="text-xs text-amber-900 whitespace-pre-wrap leading-relaxed">
                  {payment.adminNote}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <Button variant="outline" onClick={onClose}>
            {t.common?.close || "Đóng"}
          </Button>
        </div>
      </div>
    </div>
  );
}
