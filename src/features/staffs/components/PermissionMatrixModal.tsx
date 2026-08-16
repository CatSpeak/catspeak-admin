import React, { useEffect, useState } from "react";
import { X, ShieldCheck, Check, AlertCircle } from "lucide-react";
import {
  getAllAvailablePermissions,
  getStaffPermissions,
  updateStaffPermissions,
  type ResourceDomain,
} from "../api/permissions";
import { useAuthStore } from "../../../stores/authStore";
import { getApiErrorMessage } from "../../../lib/axios";
import { ConfirmModal } from "../../../components/ui/ConfirmModal";

interface PermissionMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffId: number;
  staffName: string;
  onSuccess?: () => void;
}

export const PermissionMatrixModal: React.FC<PermissionMatrixModalProps> = ({
  isOpen,
  onClose,
  staffId,
  staffName,
  onSuccess,
}) => {
  const currentUser = useAuthStore((state) => state.user);
  const isPrimaryAdmin = currentUser?.roleId === 1;

  const [domains, setDomains] = useState<ResourceDomain[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        const [allDomains, staffPerms] = await Promise.all([
          getAllAvailablePermissions(),
          getStaffPermissions(staffId),
        ]);

        if (cancelled) return;
        setDomains(allDomains);
        setSelectedCodes(staffPerms.permissions || []);
      } catch (err) {
        if (cancelled) return;
        setError(getApiErrorMessage(err, "Không thể tải danh sách quyền hạn."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [isOpen, staffId]);

  if (!isOpen) return null;

  const handleToggle = (code: string) => {
    if (!isPrimaryAdmin) return;
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSelectAll = () => {
    if (!isPrimaryAdmin) return;
    if (selectedCodes.length === domains.length) {
      setSelectedCodes([]);
    } else {
      setSelectedCodes(domains.map((d) => d.code));
    }
  };

  const executeSavePermissions = async () => {
    if (!isPrimaryAdmin) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);

      await updateStaffPermissions(staffId, selectedCodes);
      setSuccessMsg("Cập nhật phân quyền nhân viên thành công!");
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(getApiErrorMessage(err, "Cập nhật phân quyền thất bại."));
    } finally {
      setSaving(false);
    }
  };

  const isAllSelected = domains.length > 0 && selectedCodes.length === domains.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-150 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                Phân Quyền Quản Trị Tài Nguyên
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Cấp quyền cho nhân viên: <span className="font-bold text-gray-800">{staffName}</span> (ID: #{staffId})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {!isPrimaryAdmin && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Chỉ Primary Admin mới có quyền thay đổi danh sách phân quyền của Staff.</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-error-50 border border-error-150 text-error-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-success-50 border border-success-150 text-success-700 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-sm text-gray-500 font-semibold">
              <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Đang tải danh sách tài nguyên...</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between pt-1 pb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Danh Sách Resource Domains ({selectedCodes.length}/{domains.length})
                </span>

                {isPrimaryAdmin && (
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    {isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {domains.map((domain) => {
                  const isChecked = selectedCodes.includes(domain.code);
                  return (
                    <div
                      key={domain.code}
                      onClick={() => handleToggle(domain.code)}
                      className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                        isChecked
                          ? "border-primary/40 bg-primary/5 shadow-xs"
                          : "border-gray-150 bg-gray-50/40 hover:bg-gray-50"
                      } ${!isPrimaryAdmin ? "opacity-80 cursor-default" : ""}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">
                            {domain.name}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-gray-200/60 text-gray-600 font-semibold">
                            {domain.code}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                          {domain.description}
                        </p>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? "bg-primary border-primary text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-150 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 rounded-xl hover:bg-gray-200/60 transition-colors cursor-pointer"
          >
            Hủy
          </button>

          {isPrimaryAdmin && (
            <>
              <button
                type="button"
                onClick={() => setShowSaveConfirm(true)}
                disabled={saving || loading}
                className="px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-sm hover:shadow disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {saving && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                <span>Lưu Phân Quyền</span>
              </button>

              <ConfirmModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={() => {
                  setShowSaveConfirm(false);
                  executeSavePermissions();
                }}
                title="Xác nhận cập nhật phân quyền"
                description={
                  <span>
                    Bạn có chắc chắn muốn cập nhật phân quyền cho Staff <strong className="text-gray-900">'{staffName}'</strong>?
                    <br />
                    Các thay đổi sẽ có hiệu lực ngay lập tức.
                  </span>
                }
                confirmText="Cập nhật quyền"
                variant="primary"
                isLoading={saving}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
