import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStaffDetail } from "../hooks/useStaffDetail";
import { useLanguage } from "../../../stores/languageStore";
import { useAuthStore } from "../../../stores/authStore";
import { formatDateTime } from "../../../lib/utils";
import { PermissionMatrixModal } from "../components/PermissionMatrixModal";
import { demoteStaffToUser } from "../api/permissions";
import { ShieldCheck, UserMinus } from "lucide-react";
import { getApiErrorMessage } from "../../../lib/axios";

import { ConfirmModal } from "../../../components/ui/ConfirmModal";

export default function StaffDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { staff, loading, error, refetch } = useStaffDetail(id);
  const { t } = useLanguage();
  const currentUser = useAuthStore((state) => state.user);
  const isPrimaryAdmin = currentUser?.roleId === 1;

  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [demoting, setDemoting] = useState(false);
  const [showDemoteConfirm, setShowDemoteConfirm] = useState(false);

  const executeDemote = async () => {
    if (!staff || !isPrimaryAdmin) return;
    try {
      setDemoting(true);
      setActionError(null);
      setActionSuccess(null);

      await demoteStaffToUser(staff.accountId);
      setActionSuccess(`Đã hạ cấp tài khoản '${staff.username}' xuống User thành công.`);
      if (refetch) await refetch();
      setTimeout(() => navigate("/staffs"), 1500);
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Không thể hạ cấp tài khoản nhân viên."));
    } finally {
      setDemoting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex h-64 items-center justify-center rounded-xl"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <span style={{ color: "var(--color-text-secondary)" }}>
          {t.common.loading}
        </span>
      </div>
    );
  }

  if (!staff) {
    return (
      <div
        className="flex h-64 items-center justify-center rounded-xl"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <span style={{ color: "var(--color-text-secondary)" }}>
          {error ?? t.staffs.staffNotFound}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Breadcrumb & Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <nav
          className="text-sm"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <span
            className="cursor-pointer hover:underline"
            onClick={() => navigate("/staffs")}
            style={{ color: "var(--color-text-secondary)" }}
          >
            {t.staffs.title}
          </span>
          <span className="mx-2">{">"}</span>
          <span style={{ color: "var(--color-text)" }}>{t.common.details}</span>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPermModalOpen(true)}
            className="px-4 py-2 text-sm font-semibold rounded-lg text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Phân Quyền</span>
          </button>

          {isPrimaryAdmin && staff.roleId === 3 && (
            <>
              <button
                onClick={() => setShowDemoteConfirm(true)}
                disabled={demoting}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-rose-600 border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <UserMinus className="w-4 h-4" />
                <span>{demoting ? "Đang hạ cấp..." : "Hạ Cấp Xuống User"}</span>
              </button>

              <ConfirmModal
                isOpen={showDemoteConfirm}
                onClose={() => setShowDemoteConfirm(false)}
                onConfirm={() => {
                  setShowDemoteConfirm(false);
                  executeDemote();
                }}
                title="Xác nhận hạ cấp người dùng"
                description={
                  <span>
                    Bạn có chắc chắn muốn hạ cấp tài khoản <strong className="text-gray-900">'{staff.username}'</strong> từ <strong>Staff</strong> xuống <strong>User</strong>?
                    <br />
                    Tài khoản này sẽ lập tức mất toàn bộ quyền truy cập vào trang Admin và bị thu hồi các phân quyền Staff hiện có.
                  </span>
                }
                confirmText="Hạ cấp xuống User"
                variant="danger"
                isLoading={demoting}
              />
            </>
          )}

          <button
            onClick={() => navigate("/staffs")}
            className="px-6 py-2 text-sm font-semibold rounded-lg text-white transition-colors hover:opacity-90 cursor-pointer"
            style={{ background: "var(--color-primary)" }}
          >
            {t.common.back}
          </button>
        </div>
      </div>

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

      {/* Information Section */}
      <div
        className="p-6 rounded-xl"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <h2
          className="text-lg font-bold mb-4"
          style={{ color: "var(--color-primary)" }}
        >
          {t.common.information}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          <InfoRow
            label={`${t.users.id}:`}
            value={staff.accountId.toString()}
          />
          <InfoRow label={`${t.users.username}:`} value={staff.username} />
          <InfoRow label={`${t.users.email}:`} value={staff.email} />
          <InfoRow
            label={`${t.users.phone}:`}
            value={staff.phoneNumber || "..."}
          />
          <InfoRow
            label={`${t.common.createdDate}:`}
            value={formatDateTime(staff.createDate)}
          />
          <InfoRow
            label={`${t.users.learningLanguage}:`}
            value={staff.languageLearning || "..."}
          />
          <InfoRow
            label={`${t.users.nativeLanguage}:`}
            value={staff.naturalLanguage || "..."}
          />
          <InfoRow
            label={`${t.users.level}:`}
            value={staff.proficiency || "..."}
          />
        </div>
      </div>

      {/* Payment Section */}
      <div
        className="p-6 rounded-xl"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <h2
          className="text-lg font-bold mb-4"
          style={{ color: "var(--color-primary)" }}
        >
          {t.common.payment}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction History Table */}
          <div
            className="overflow-hidden rounded-lg"
            style={{
              border: "1px solid var(--color-border)",
            }}
          >
            <table className="min-w-full">
              <thead
                style={{
                  background: "var(--color-primary)",
                  color: "white",
                }}
              >
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-bold">
                    {t.common.time} ↓
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold">
                    {t.common.type}
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold">
                    {t.reports.amount}
                  </th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: "var(--color-border)" }}
              >
                {staff.transactions && staff.transactions.length > 0 ? (
                  staff.transactions.map((transaction, idx) => (
                    <tr
                      key={transaction.id}
                      style={{
                        background: idx % 2 === 0 ? "#FFF9F9" : "white",
                      }}
                    >
                      <td className="px-4 py-2.5 text-sm">
                        {new Date(transaction.time).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2.5 text-sm">
                        {transaction.type}
                      </td>
                      <td className="px-4 py-2.5 text-sm">
                        {transaction.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-8 text-center text-sm"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {t.common.noTransactions}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Packages Table */}
          <div
            className="overflow-hidden rounded-lg"
            style={{
              border: "1px solid var(--color-border)",
            }}
          >
            <table className="min-w-full">
              <thead
                style={{
                  background: "var(--color-primary)",
                  color: "white",
                }}
              >
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-bold">
                    {t.common.type}
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold">
                    {t.plans.unitPrice}
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold">
                    {t.plans.quantity}
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold">
                    {t.common.total}
                  </th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: "var(--color-border)" }}
              >
                {staff.packages && staff.packages.length > 0 ? (
                  <>
                    {staff.packages.map((pkg, idx) => (
                      <tr
                        key={idx}
                        style={{
                          background: idx % 2 === 0 ? "#FFF9F9" : "white",
                        }}
                      >
                        <td className="px-4 py-2.5 text-sm">{pkg.type}</td>
                        <td className="px-4 py-2.5 text-sm">
                          {pkg.unitPrice.toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 text-sm">x{pkg.quantity}</td>
                        <td className="px-4 py-2.5 text-sm">
                          {pkg.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr
                      style={{
                        background: "var(--color-surface)",
                        fontWeight: "600",
                      }}
                    >
                      <td
                        colSpan={3}
                        className="px-4 py-2.5 text-sm text-right"
                      >
                        {t.common.total}
                      </td>
                      <td className="px-4 py-2.5 text-sm">
                        {staff.packages
                          .reduce((sum, pkg) => sum + pkg.total, 0)
                          .toLocaleString()}
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-sm"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {t.plans.noPackages}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Permission Matrix Modal */}
      <PermissionMatrixModal
        isOpen={isPermModalOpen}
        onClose={() => setIsPermModalOpen(false)}
        staffId={staff.accountId}
        staffName={staff.username}
        onSuccess={() => {
          if (refetch) refetch();
        }}
      />
    </div>
  );
}

// Helper component for info rows
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-sm font-semibold"
        style={{ color: "var(--color-text)" }}
      >
        {label}
      </span>
      <span
        className="text-sm"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {value}
      </span>
    </div>
  );
}
