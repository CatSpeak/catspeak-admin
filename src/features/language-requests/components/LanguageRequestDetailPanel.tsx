import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Languages,
  BookOpen,
  FileText,
  Clock,
  ShieldCheck,
} from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { ConfirmModal } from "../../../components/ui/ConfirmModal";
import LanguageRequestStatusBadge from "./LanguageRequestStatusBadge";
import LanguageRequestRejectModal from "./LanguageRequestRejectModal";
import { useToastStore } from "../../../stores/toastStore";
import {
  approveLanguageRequest,
  rejectLanguageRequest,
} from "../api/reviewLanguageRequest";
import type { LanguageRequestDetail } from "../types";
import { useLanguage } from "../../../stores/languageStore";
import { formatDateTime } from "../../../lib/utils";

interface LanguageRequestDetailPanelProps {
  request: LanguageRequestDetail;
  onReviewed: () => void;
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/80">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0 text-gray-400">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <div className="text-sm text-gray-800 mt-0.5 break-words">{value}</div>
      </div>
    </div>
  );
}

function FileLink({ url, label }: { url: string | null; label: string }) {
  if (!url) return <span className="text-gray-400">—</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-primary hover:underline"
    >
      <FileText className="w-4 h-4 shrink-0" />
      {label}
    </a>
  );
}

export default function LanguageRequestDetailPanel({
  request,
  onReviewed,
}: LanguageRequestDetailPanelProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canReview = request.status === "Pending";
  const isUpdate = request.requestType === 1;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await approveLanguageRequest(request.requestId);
      addToast("success", t.languageRequests.approveSuccess);
      setShowApprove(false);
      onReviewed();
    } catch {
      addToast("error", t.languageRequests.actionFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (reason: string) => {
    setIsSubmitting(true);
    try {
      await rejectLanguageRequest(request.requestId, reason);
      addToast("success", t.languageRequests.rejectSuccess);
      setShowReject(false);
      onReviewed();
    } catch {
      addToast("error", t.languageRequests.actionFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Breadcrumb + Back */}
      <div className="flex items-center justify-between mb-6">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <button
            onClick={() => navigate("/language-requests")}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            {t.languageRequests.title}
          </button>
          <span>/</span>
          <span className="text-gray-800 font-medium">
            {request.fullName || "—"}
          </span>
        </nav>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate("/language-requests")}
          className="cursor-pointer"
        >
          {t.common.back}
        </Button>
      </div>

      {/* Hero strip */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User className="w-7 h-7 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">
              {request.fullName || "—"}
            </h2>
            <LanguageRequestStatusBadge status={request.status} />
            <Badge
              title={
                isUpdate
                  ? t.languageRequests.updateType
                  : t.languageRequests.addType
              }
              type={isUpdate ? "Orange" : "Blue"}
            />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            @{request.username} ·{" "}
            {t.languageRequests.accountNumber.replace(
              "{id}",
              String(request.accountId),
            )}
          </p>
        </div>

        {/* Action buttons — there is deliberately no request-edit action. */}
        {canReview && (
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button
              size="sm"
              className="!bg-emerald-600 hover:!bg-emerald-700 text-white"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              onClick={() => setShowApprove(true)}
            >
              {t.languageRequests.approve}
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<XCircle className="w-4 h-4" />}
              onClick={() => setShowReject(true)}
            >
              {t.languageRequests.reject}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          <SectionCard title={t.languageRequests.teacherInfo}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow
                icon={<User className="w-4 h-4" />}
                label={t.instructorApplications.fullName}
                value={request.fullName || "—"}
              />
              <InfoRow
                icon={<User className="w-4 h-4" />}
                label={t.users.username}
                value={request.username ? `@${request.username}` : "—"}
              />
              <InfoRow
                icon={<Mail className="w-4 h-4" />}
                label={t.languageRequests.accountEmail}
                value={
                  request.accountEmail ? (
                    <a
                      href={`mailto:${request.accountEmail}`}
                      className="text-primary underline"
                    >
                      {request.accountEmail}
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
              <InfoRow
                icon={<Phone className="w-4 h-4" />}
                label={t.users.phone}
                value={request.phoneNumber || "—"}
              />
            </div>
          </SectionCard>

          <SectionCard title={t.languageRequests.requestedInfo}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow
                icon={<Languages className="w-4 h-4" />}
                label={t.languageRequests.language}
                value={request.language || "—"}
              />
              <InfoRow
                icon={<BookOpen className="w-4 h-4" />}
                label={t.languageRequests.level}
                value={request.level || "—"}
              />
              <InfoRow
                icon={<FileText className="w-4 h-4" />}
                label={t.languageRequests.certificate}
                value={
                  <FileLink
                    url={request.credentialUrl}
                    label={t.languageRequests.downloadCertificate}
                  />
                }
              />
            </div>
          </SectionCard>

          <SectionCard title={t.languageRequests.currentInfo}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow
                icon={<BookOpen className="w-4 h-4" />}
                label={t.languageRequests.currentLevel}
                value={request.previousLevel || "—"}
              />
              <InfoRow
                icon={<FileText className="w-4 h-4" />}
                label={t.languageRequests.currentCertificate}
                value={
                  <FileLink
                    url={request.previousCredentialUrl}
                    label={t.languageRequests.downloadCertificate}
                  />
                }
              />
            </div>
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <SectionCard title={t.languageRequests.reviewHistory}>
            <div className="space-y-3 text-sm">
              <InfoRow
                icon={<Clock className="w-4 h-4" />}
                label={t.languageRequests.submittedAt}
                value={formatDateTime(request.createdAt)}
              />
              {request.reviewedAt && (
                <InfoRow
                  icon={<Clock className="w-4 h-4" />}
                  label={t.languageRequests.reviewedAt}
                  value={formatDateTime(request.reviewedAt)}
                />
              )}
              {request.reviewedByAdminUsername && (
                <InfoRow
                  icon={<ShieldCheck className="w-4 h-4" />}
                  label={t.languageRequests.reviewedBy}
                  value={`@${request.reviewedByAdminUsername}`}
                />
              )}
              {request.reviewNote && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {t.languageRequests.reviewNote}
                  </p>
                  <p className="mt-1 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
                    {request.reviewNote}
                  </p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Approve confirmation */}
      <ConfirmModal
        isOpen={showApprove}
        onClose={() => !isSubmitting && setShowApprove(false)}
        onConfirm={handleApprove}
        title={t.languageRequests.approveTitle}
        description={t.languageRequests.approveDesc}
        confirmText={t.languageRequests.approve}
        cancelText={t.common.cancel}
        variant="info"
        isLoading={isSubmitting}
        icon={<CheckCircle2 className="w-6 h-6 text-blue-600" />}
      />

      {/* Reject reason modal */}
      {showReject && (
        <LanguageRequestRejectModal
          teacherName={request.fullName}
          isLoading={isSubmitting}
          onConfirm={handleReject}
          onClose={() => !isSubmitting && setShowReject(false)}
        />
      )}
    </>
  );
}
