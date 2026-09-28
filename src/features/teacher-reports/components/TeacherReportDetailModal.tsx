import React, { useEffect, useState } from "react";
import {
  X,
  AlertTriangle,
  ShieldAlert,
  Video,
  Clock,
  User,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Ban,
  FileCheck,
} from "lucide-react";
import Badge, { type BadgeType } from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { formatDateTime } from "../../../lib/utils";
import {
  dismissTeacherReport,
  getTeacherReportDetail,
  revokeTeacherProfile,
  warnTeacherReport,
} from "../api/teacherReportsApi";
import type { TeacherReportDetail } from "../types";

interface TeacherReportDetailModalProps {
  reportId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  InappropriateVideo: "Video không phù hợp / phản cảm",
  MisleadingProfile: "Hồ sơ / Bằng cấp sai lệch",
  OffensiveBehavior: "Hành vi xúc phạm / thiếu chuẩn mực",
  Other: "Lý do khác",
};

const STATUS_BADGES: Record<string, { label: string; type: BadgeType }> = {
  Pending: { label: "Chờ xử lý", type: "Yellow" },
  Warned: { label: "Đã cảnh cáo", type: "Orange" },
  Resolved: { label: "Đã giải quyết", type: "Green" },
  Dismissed: { label: "Đã bác bỏ", type: "Gray" },
};

export default function TeacherReportDetailModal({
  reportId,
  isOpen,
  onClose,
  onSuccess,
}: TeacherReportDetailModalProps) {
  const [report, setReport] = useState<TeacherReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<
    "warn" | "revoke" | "dismiss" | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [warningNote, setWarningNote] = useState("");
  const [removeVideoImmediately, setRemoveVideoImmediately] = useState(true);
  const [revokeReason, setRevokeReason] = useState("");
  const [lockUserAccount, setLockUserAccount] = useState(false);
  const [dismissReason, setDismissReason] = useState("");

  const fetchDetail = async (id: number) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getTeacherReportDetail(id);
      setReport(data);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || "Không thể tải chi tiết báo cáo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && reportId) {
      fetchDetail(reportId);
      setActiveAction(null);
      setWarningNote("");
      setRemoveVideoImmediately(true);
      setRevokeReason("");
      setLockUserAccount(false);
      setDismissReason("");
    } else {
      setReport(null);
    }
  }, [isOpen, reportId]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (actionLoading) return;
    onClose();
  };

  const handleWarnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report || !warningNote.trim()) return;
    setActionLoading(true);
    setErrorMessage(null);
    try {
      const updated = await warnTeacherReport(report.reportId, {
        warningNote: warningNote.trim(),
        removeVideoImmediately,
      });
      setReport(updated);
      setActiveAction(null);
      onSuccess?.();
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || "Gửi cảnh cáo thất bại."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report || !revokeReason.trim()) return;
    setActionLoading(true);
    setErrorMessage(null);
    try {
      const updated = await revokeTeacherProfile(report.reportId, {
        reason: revokeReason.trim(),
        lockUserAccount,
      });
      setReport(updated);
      setActiveAction(null);
      onSuccess?.();
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || "Thu hồi hồ sơ thất bại."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismissSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report || !dismissReason.trim()) return;
    setActionLoading(true);
    setErrorMessage(null);
    try {
      const updated = await dismissTeacherReport(report.reportId, {
        reason: dismissReason.trim(),
      });
      setReport(updated);
      setActiveAction(null);
      onSuccess?.();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || "Bác bỏ thất bại.");
    } finally {
      setActionLoading(false);
    }
  };

  const statusConfig = report
    ? STATUS_BADGES[report.status] || { label: report.status, type: "Gray" as BadgeType }
    : { label: "", type: "Gray" as BadgeType };

  const canModerate = report?.status === "Pending" || report?.status === "Warned";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Chi tiết báo cáo #{report?.reportId || reportId}
                {report && (
                  <Badge type={statusConfig.type} showDot>
                    {statusConfig.label}
                  </Badge>
                )}
              </h2>
              <p className="text-xs text-gray-500">
                Gửi lúc: {report ? formatDateTime(report.createdAt) : "—"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={actionLoading}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-gray-50/50">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-gray-500">Đang tải dữ liệu báo cáo...</p>
            </div>
          ) : report ? (
            <>
              {/* Alert / Error Banner */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* History / Status Banners */}
              {report.status === "Warned" && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                    <Clock className="w-4 h-4" />
                    <span>
                      Đã cảnh cáo lúc {formatDateTime(report.warnedAt || "")} bởi{" "}
                      {report.resolvedByAdminUsername || "Admin"}
                    </span>
                  </div>
                  <p className="text-xs text-amber-700 pl-6">
                    <span className="font-semibold">Nội dung cảnh cáo:</span>{" "}
                    {report.adminNote || "—"}
                  </p>
                </div>
              )}

              {report.status === "Resolved" && (
                <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-900 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-green-800">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      Đã giải quyết (Thu hồi hồ sơ & Vô hiệu hóa) lúc{" "}
                      {formatDateTime(report.resolvedAt || "")} bởi{" "}
                      {report.resolvedByAdminUsername || "Admin"}
                    </span>
                  </div>
                  <p className="text-xs text-green-700 pl-6">
                    <span className="font-semibold">Lý do xử lý:</span>{" "}
                    {report.adminNote || "—"}
                  </p>
                </div>
              )}

              {report.status === "Dismissed" && (
                <div className="p-4 rounded-xl bg-gray-100 border border-gray-200 text-gray-800 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      Đã bác bỏ báo cáo lúc{" "}
                      {formatDateTime(report.resolvedAt || "")} bởi{" "}
                      {report.resolvedByAdminUsername || "Admin"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 pl-6">
                    <span className="font-semibold">Ghi chú bác bỏ:</span>{" "}
                    {report.adminNote || "—"}
                  </p>
                </div>
              )}

              {/* 2-Column Comparison Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column 1: Student Report */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Phản ánh từ Học viên
                    </h3>
                    <span className="text-xs text-gray-400">
                      ID: #{report.reporterId}
                    </span>
                  </div>

                  {/* Reporter info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        report.reporterAvatarUrl ||
                        "https://ui-avatars.com/api/?name=" +
                          encodeURIComponent(
                            report.reporterFullName ||
                              report.reporterUsername ||
                              "Student"
                          )
                      }
                      alt="Reporter"
                      className="w-11 h-11 rounded-full object-cover border border-gray-100"
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {report.reporterFullName || report.reporterUsername || "Học viên"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {report.reporterEmail || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">
                      Nhóm vi phạm:
                    </label>
                    <div>
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                        {CATEGORY_LABELS[report.category] || report.category}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">
                      Nội dung phản ánh:
                    </label>
                    <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                      {report.description}
                    </div>
                  </div>
                </div>

                {/* Column 2: Teacher Profile Info & Video */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Video className="w-4 h-4 text-emerald-600" />
                      Hồ sơ Giảng viên bị báo cáo
                    </h3>
                    <span className="text-xs text-gray-400">
                      Account ID: #{report.teacherAccountId}
                    </span>
                  </div>

                  {/* Teacher info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        report.teacherAvatarUrl ||
                        "https://ui-avatars.com/api/?name=" +
                          encodeURIComponent(
                            report.teacherFullName ||
                              report.teacherUsername ||
                              "Teacher"
                          )
                      }
                      alt="Teacher"
                      className="w-11 h-11 rounded-full object-cover border border-gray-100"
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {report.teacherFullName || report.teacherUsername || "Giảng viên"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {report.teacherEmail || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Profile Details */}
                  {report.profileIntroduction && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600">
                        Giới thiệu bản thân:
                      </label>
                      <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-100 line-clamp-3">
                        {report.profileIntroduction}
                      </p>
                    </div>
                  )}

                  {/* Intro Video Player */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-600">
                        Video giới thiệu:
                      </label>
                      {report.introVideoUrl && (
                        <a
                          href={report.introVideoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          Mở link gốc <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {report.introVideoUrl ? (
                      <div className="rounded-xl overflow-hidden border border-gray-200 bg-black">
                        <video
                          src={report.introVideoUrl}
                          controls
                          className="w-full max-h-52 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="py-6 px-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400">
                        Không có video giới thiệu hoặc video đã được gỡ bỏ.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Form Drawers */}
              {activeAction === "warn" && (
                <form
                  onSubmit={handleWarnSubmit}
                  className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-3 animate-fade-in"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Bước 1: Gửi cảnh cáo Giảng viên
                    </h4>
                    <button
                      type="button"
                      onClick={() => setActiveAction(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-amber-800">
                      Nội dung cảnh cáo gửi tới email giảng viên: *
                    </label>
                    <textarea
                      rows={3}
                      value={warningNote}
                      onChange={(e) => setWarningNote(e.target.value)}
                      required
                      placeholder="Nhập nội dung nhắc nhở, yêu cầu chỉnh sửa thông tin hoặc video..."
                      className="w-full mt-1 p-2.5 text-xs bg-white rounded-xl border border-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="removeVideo"
                      checked={removeVideoImmediately}
                      onChange={(e) => setRemoveVideoImmediately(e.target.checked)}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <label
                      htmlFor="removeVideo"
                      className="text-xs text-amber-900 cursor-pointer font-medium"
                    >
                      Gỡ video giới thiệu ngay lập tức (xóa URL và file storage)
                    </label>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveAction(null)}
                      disabled={actionLoading}
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      type="submit"
                      isLoading={actionLoading}
                      disabled={!warningNote.trim()}
                      className="!bg-amber-600 hover:!bg-amber-700"
                    >
                      Xác nhận gửi cảnh cáo
                    </Button>
                  </div>
                </form>
              )}

              {activeAction === "revoke" && (
                <form
                  onSubmit={handleRevokeSubmit}
                  className="bg-red-50/70 border border-red-200 p-4 rounded-2xl space-y-3 animate-fade-in"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-red-900 flex items-center gap-1.5">
                      <Ban className="w-4 h-4 text-red-600" />
                      Bước 2: Thu hồi hồ sơ & Kỷ luật Giảng viên
                    </h4>
                    <button
                      type="button"
                      onClick={() => setActiveAction(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-red-700">
                    Hành động này sẽ: Từ chối hồ sơ giảng viên, cấm nộp lại 100 năm, khóa
                    tài khoản giáo viên (Status = 0), hủy phiên đăng nhập tức thì, hủy các yêu
                    cầu ngôn ngữ đang chờ và gửi email kỷ luật.
                  </p>
                  <div>
                    <label className="text-xs font-bold text-red-800">
                      Lý do thu hồi / kỷ luật: *
                    </label>
                    <textarea
                      rows={3}
                      value={revokeReason}
                      onChange={(e) => setRevokeReason(e.target.value)}
                      required
                      placeholder="Nêu rõ lý do kỷ luật gửi cho giảng viên và lưu hồ sơ..."
                      className="w-full mt-1 p-2.5 text-xs bg-white rounded-xl border border-red-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="lockUser"
                      checked={lockUserAccount}
                      onChange={(e) => setLockUserAccount(e.target.checked)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <label
                      htmlFor="lockUser"
                      className="text-xs text-red-900 cursor-pointer font-medium"
                    >
                      Khóa luôn cả tài khoản người dùng gốc (chỉ áp dụng nếu vi phạm lừa đảo/nghiêm trọng)
                    </label>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveAction(null)}
                      disabled={actionLoading}
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      type="submit"
                      isLoading={actionLoading}
                      disabled={!revokeReason.trim()}
                    >
                      Xác nhận Thu hồi hồ sơ
                    </Button>
                  </div>
                </form>
              )}

              {activeAction === "dismiss" && (
                <form
                  onSubmit={handleDismissSubmit}
                  className="bg-gray-100 border border-gray-200 p-4 rounded-2xl space-y-3 animate-fade-in"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-gray-600" />
                      Bác bỏ đơn báo cáo
                    </h4>
                    <button
                      type="button"
                      onClick={() => setActiveAction(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">
                    Bác bỏ đơn nếu nội dung phản ánh không đúng thực tế. Hồ sơ và tài
                    khoản giảng viên sẽ được giữ nguyên trạng thái bình thường.
                  </p>
                  <div>
                    <label className="text-xs font-bold text-gray-700">
                      Lý do bác bỏ: *
                    </label>
                    <textarea
                      rows={2}
                      value={dismissReason}
                      onChange={(e) => setDismissReason(e.target.value)}
                      required
                      placeholder="Ghi chú lý do bác bỏ đơn..."
                      className="w-full mt-1 p-2.5 text-xs bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveAction(null)}
                      disabled={actionLoading}
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      type="submit"
                      isLoading={actionLoading}
                      disabled={!dismissReason.trim()}
                    >
                      Xác nhận Bác bỏ
                    </Button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-sm text-gray-500">
              Không tìm thấy thông tin báo cáo.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0 bg-white">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Đóng
          </Button>

          {canModerate && !activeAction && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveAction("dismiss")}
              >
                Bác bỏ
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="!bg-amber-600 hover:!bg-amber-700 text-white"
                onClick={() => setActiveAction("warn")}
              >
                Gửi cảnh cáo
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setActiveAction("revoke")}
              >
                Gỡ bỏ hồ sơ
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
