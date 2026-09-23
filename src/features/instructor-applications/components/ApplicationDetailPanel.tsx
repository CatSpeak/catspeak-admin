import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Edit3,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Languages,
  FileText,
  Video,
  ShieldCheck,
  Clock,
  Calendar,
  Trash2,
} from "lucide-react";
import RevisionStatusBadge from "./RevisionStatusBadge";
import ReviewModal, {
  type ReviewAction,
  type ReviewModalResult,
} from "./ReviewModal";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import { ConfirmModal } from "../../../components/ui/ConfirmModal";
import { useToastStore } from "../../../stores/toastStore";
import {
  approveRevision,
  rejectRevision,
  requestEditRevision,
  verifyInstructorIdCard,
  removeInstructorIntroVideo,
} from "../api/reviewInstructorRevision";
import type { InstructorRevisionDetail } from "../types";
import { useLanguage } from "../../../stores/languageStore";
import { formatDateTime } from "../../../lib/utils";

interface ApplicationDetailPanelProps {
  application: InstructorRevisionDetail;
  onReviewed: () => void;
}

type JsonArrayValue = string | Record<string, unknown>;

function safeParseJsonArray(raw: string | null | undefined): JsonArrayValue[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeParseStringArray(raw: string | null | undefined): string[] {
  return safeParseJsonArray(raw).filter((value): value is string => {
    return typeof value === "string" && value.trim().length > 0;
  });
}

function formatLanguageLabel(value: JsonArrayValue): string {
  if (typeof value === "string") return value;

  const language =
    typeof value.language === "string" ? value.language : "Language";
  const level = typeof value.level === "string" ? value.level : "";

  return level ? `${language} (${level})` : language;
}

/** Map ISO country code ("vn"/"VN") to localized region name ("Việt Nam"). */
function formatNationality(
  raw: string | null | undefined,
  lang: string,
): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (trimmed.length > 3 || /[^a-zA-Z]/.test(trimmed)) return trimmed;
  try {
    const names = new Intl.DisplayNames([lang], { type: "region" });
    return names.of(trimmed.toUpperCase()) ?? trimmed;
  } catch {
    return trimmed;
  }
}

function CredentialList({ urls }: { urls: string[] }) {
  const { t } = useLanguage();
  if (urls.length === 0) return <span className="text-gray-400">—</span>;
  return (
    <ul className="space-y-1">
      {urls.map((url, i) => (
        <li key={url}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            {t.instructorApplications.credentialItem.replace(
              "{index}",
              String(i + 1),
            )}
          </a>
        </li>
      ))}
    </ul>
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

function SectionCard({
  title,
  headerRight,
  children,
}: {
  title: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
          {title}
        </h3>
        {headerRight}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ImagePreview({ src, label }: { src: string; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <button
          onClick={() => setOpen(true)}
          className="block w-full rounded-lg overflow-hidden border border-gray-200 hover:border-primary transition-colors group cursor-pointer"
        >
          <img
            src={src}
            alt={label}
            className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </button>
      </div>
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setOpen(false)}
          >
            <img
              src={src}
              alt={label}
              className="max-h-[90vh] max-w-full rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body,
        )}
    </>
  );
}

const REVIEWABLE_STATUSES = ["Pending"] as const;

export default function ApplicationDetailPanel({
  application,
  onReviewed,
}: ApplicationDetailPanelProps) {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);
  const [modalAction, setModalAction] = useState<ReviewAction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verification & Post-moderation state
  const [isVerifyingIdCard, setIsVerifyingIdCard] = useState(false);
  const [showRemoveVideoModal, setShowRemoveVideoModal] = useState(false);
  const [isRemovingVideo, setIsRemovingVideo] = useState(false);
  const [removeVideoReason, setRemoveVideoReason] = useState("");

  const languages = safeParseJsonArray(application.languagesTeach);
  const credentials = safeParseStringArray(application.credentialUrls);
  const canReview = (REVIEWABLE_STATUSES as readonly string[]).includes(
    application.status,
  );

  const revisionId = application.revisionId;
  const live = application.liveSnapshot ?? null;
  const targetProfileId = application.profileId || live?.profileId || 0;

  const displayFullName =
    application.fullName || live?.fullName || application.username || "";
  const displayEmail = application.email || live?.email || "";
  const displayAddress = application.address || live?.address || "";
  const displayPhoneNumber =
    application.phoneNumber || live?.phoneNumber || "";
  const displayNationality =
    application.nationality || live?.nationality || "";
  const displayDob =
    application.dateOfBirth || live?.dateOfBirth || "";
  const displayIdCardFrontUrl =
    application.idCardFrontUrl || live?.idCardFrontUrl || null;
  const displayIdCardBackUrl =
    application.idCardBackUrl || live?.idCardBackUrl || null;
  const isIdCardVerified =
    application.isIdCardVerified ?? live?.isIdCardVerified ?? false;

  const handleConfirm = async (result: ReviewModalResult) => {
    setIsSubmitting(true);
    try {
      if (result.action === "approve") {
        await approveRevision(revisionId ?? application.profileId);
        addToast("success", t.instructorApplications.approveSuccess);
      } else if (result.action === "reject") {
        await rejectRevision(
          revisionId ?? application.profileId,
          result.reason!,
          result.banDuration!,
        );
        addToast("success", t.instructorApplications.rejectSuccess);
      } else if (result.action === "requestEdit") {
        await requestEditRevision(revisionId ?? application.profileId, result.editNote!);
        addToast("info", t.instructorApplications.requestEditSuccess);
      }
      setModalAction(null);
      onReviewed();
    } catch {
      addToast("error", t.instructorApplications.actionFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyIdCard = async () => {
    if (!targetProfileId) return;
    setIsVerifyingIdCard(true);
    try {
      await verifyInstructorIdCard(targetProfileId);
      addToast("success", "Xác minh CCCD thành công!");
      onReviewed();
    } catch {
      addToast("error", "Không thể xác minh CCCD.");
    } finally {
      setIsVerifyingIdCard(false);
    }
  };

  const handleRemoveVideo = async () => {
    if (!targetProfileId) return;
    setIsRemovingVideo(true);
    try {
      await removeInstructorIntroVideo(targetProfileId, removeVideoReason || undefined);
      addToast("success", "Đã gỡ video giới thiệu vi phạm!");
      setShowRemoveVideoModal(false);
      setRemoveVideoReason("");
      onReviewed();
    } catch {
      addToast("error", "Không thể gỡ video.");
    } finally {
      setIsRemovingVideo(false);
    }
  };

  return (
    <>
      {/* Breadcrumb + Back */}
      <div className="flex items-center justify-between mb-6">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <button
            onClick={() => navigate("/instructor-applications")}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            {t.instructorApplications.title}
          </button>
          <span>/</span>
          <span className="text-gray-800 font-medium">
            {displayFullName || "—"}
          </span>
        </nav>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate("/instructor-applications")}
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
              {displayFullName || "—"}
            </h2>
            <RevisionStatusBadge status={application.status} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            @{application.username} ·{" "}
            {t.instructorApplications.accountNumber.replace(
              "{id}",
              String(application.accountId),
            )}
          </p>
        </div>

        {/* Action buttons */}
        {canReview && (
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button
              size="sm"
              className="!bg-emerald-600 hover:!bg-emerald-700 text-white"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              onClick={() => setModalAction("approve")}
            >
              {t.instructorApplications.approve}
            </Button>
            <Button
              size="sm"
              className="!bg-blue-600 hover:!bg-blue-700 text-white"
              leftIcon={<Edit3 className="w-4 h-4" />}
              onClick={() => setModalAction("requestEdit")}
            >
              {t.instructorApplications.requestEdit}
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<XCircle className="w-4 h-4" />}
              onClick={() => setModalAction("reject")}
            >
              {t.instructorApplications.reject}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Personal Info */}
          <SectionCard title={t.common.personalInformation}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow
                icon={<User className="w-4 h-4" />}
                label={t.instructorApplications.fullName}
                value={displayFullName || "—"}
              />
              <InfoRow
                icon={<Calendar className="w-4 h-4" />}
                label="Ngày sinh"
                value={displayDob ? (displayDob.includes("T") ? displayDob.split("T")[0] : displayDob) : "—"}
              />
              <InfoRow
                icon={<User className="w-4 h-4" />}
                label={t.users.username}
                value={application.username ? `@${application.username}` : "—"}
              />
              <InfoRow
                icon={<Mail className="w-4 h-4" />}
                label={t.instructorApplications.accountEmail}
                value={
                  <a
                    href={`mailto:${application.accountEmail}`}
                    className="text-primary underline"
                  >
                    {application.accountEmail}
                  </a>
                }
              />
              <InfoRow
                icon={<Mail className="w-4 h-4" />}
                label={t.instructorApplications.profileEmail}
                value={displayEmail || "—"}
              />
              <InfoRow
                icon={<Phone className="w-4 h-4" />}
                label={t.users.phone}
                value={displayPhoneNumber || "—"}
              />
              <InfoRow
                icon={<Globe className="w-4 h-4" />}
                label={t.instructorApplications.nationality}
                value={formatNationality(displayNationality, language) || "—"}
              />
              <InfoRow
                icon={<Languages className="w-4 h-4" />}
                label={t.instructorApplications.nativeLanguage}
                value={application.nativeLanguage || "—"}
              />
              <InfoRow
                icon={<MapPin className="w-4 h-4" />}
                label={t.instructorApplications.address}
                value={displayAddress || "—"}
              />
            </div>
          </SectionCard>

          {/* ID Cards with verification */}
          <SectionCard
            title={t.instructorApplications.identityVerification}
            headerRight={
              <div className="flex items-center gap-2">
                {isIdCardVerified ? (
                  <Badge title="Đã xác minh" type="Green" />
                ) : (
                  <Badge title="Chờ xác minh" type="Orange" />
                )}
                {targetProfileId > 0 && !isIdCardVerified && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="!text-emerald-700 !border-emerald-600 hover:!bg-emerald-50 cursor-pointer"
                    leftIcon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
                    onClick={handleVerifyIdCard}
                    isLoading={isVerifyingIdCard}
                  >
                    Xác minh CCCD
                  </Button>
                )}
              </div>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayIdCardFrontUrl ? (
                <ImagePreview
                  src={displayIdCardFrontUrl}
                  label={t.instructorApplications.idCardFront}
                />
              ) : (
                <p className="text-sm text-gray-500">
                  {t.instructorApplications.noFrontId}
                </p>
              )}
              {displayIdCardBackUrl ? (
                <ImagePreview
                  src={displayIdCardBackUrl}
                  label={t.instructorApplications.idCardBack}
                />
              ) : (
                <p className="text-sm text-gray-500">
                  {t.instructorApplications.noBackId}
                </p>
              )}
            </div>
          </SectionCard>

          {/* Teaching Profile */}
          <SectionCard title={t.instructorApplications.teachingProfile}>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {t.instructorApplications.languagesTeach}
              </p>
              {languages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang, index) => {
                    const text = formatLanguageLabel(lang);
                    return (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm rounded-lg bg-primary/10 text-primary font-medium border border-primary/20"
                      >
                        {text}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </div>
          </SectionCard>

          {/* Credentials */}
          <SectionCard title={t.instructorApplications.credentials}>
            {credentials.length > 0 ? (
              <CredentialList urls={credentials} />
            ) : (
              <p className="text-sm text-gray-500">
                {t.instructorApplications.noCredentials}
              </p>
            )}
          </SectionCard>

          {/* Intro Video & Introduction */}
          <SectionCard title={t.instructorApplications.introVideo}>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  {t.instructorApplications.introduction}
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
                  {application.introduction ||
                    t.instructorApplications.noIntroduction}
                </p>
              </div>

              {application.introVideoUrl ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Video tự giới thiệu
                  </p>
                  <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <a
                      href={application.introVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                    >
                      <Video className="w-4 h-4 shrink-0" />
                      {t.instructorApplications.watchIntroVideo}
                    </a>
                    {targetProfileId > 0 && (
                      <Button
                        size="sm"
                        variant="danger"
                        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        onClick={() => setShowRemoveVideoModal(true)}
                        className="cursor-pointer"
                      >
                        Gỡ video vi phạm
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Chưa có video giới thiệu.</p>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Linked Account */}
          <SectionCard title={t.instructorApplications.linkedAccount}>
            <div className="space-y-3 text-sm">
              {application.isTeacherAccount ? (
                <>
                  <InfoRow
                    icon={<User className="w-4 h-4 text-emerald-500" />}
                    label={t.instructorApplications.teacherAccount}
                    value={
                      <span className="text-emerald-700 font-medium">
                        @{application.username} ·{" "}
                        {t.instructorApplications.accountNumber.replace(
                          "{id}",
                          String(application.accountId),
                        )}
                      </span>
                    }
                  />
                  {application.sourceAccountId != null && (
                    <InfoRow
                      icon={<User className="w-4 h-4 text-gray-400" />}
                      label={t.instructorApplications.sourceAccount}
                      value={
                        <span>
                          {application.sourceUsername ? (
                            <span className="font-medium">
                              @{application.sourceUsername}
                            </span>
                          ) : (
                            t.instructorApplications.accountNumber.replace(
                              "{id}",
                              String(application.sourceAccountId),
                            )
                          )}
                          {application.sourceAccountEmail && (
                            <>
                              {" "}
                              ·{" "}
                              <a
                                href={`mailto:${application.sourceAccountEmail}`}
                                className="text-primary underline"
                              >
                                {application.sourceAccountEmail}
                              </a>
                            </>
                          )}
                        </span>
                      }
                    />
                  )}
                </>
              ) : (
                <p className="text-gray-500">
                  {t.instructorApplications.accountNumber.replace(
                    "{id}",
                    String(application.accountId),
                  )}
                  {application.accountEmail && (
                    <>
                      {" "}
                      ·{" "}
                      <a
                        href={`mailto:${application.accountEmail}`}
                        className="text-primary underline"
                      >
                        {application.accountEmail}
                      </a>
                    </>
                  )}
                </p>
              )}
            </div>
          </SectionCard>

          {/* Review Meta */}
          <SectionCard title={t.instructorApplications.reviewHistory}>
            <div className="space-y-3 text-sm">
              <InfoRow
                icon={<Clock className="w-4 h-4" />}
                label={t.instructorApplications.submitted}
                value={formatDateTime(application.submittedAt)}
              />
              {application.reviewedAt && (
                <InfoRow
                  icon={<Clock className="w-4 h-4" />}
                  label={t.instructorApplications.lastReviewed}
                  value={formatDateTime(application.reviewedAt)}
                />
              )}
              {application.reviewedByAdminUsername && (
                <InfoRow
                  icon={<ShieldCheck className="w-4 h-4" />}
                  label={t.instructorApplications.reviewedBy}
                  value={`@${application.reviewedByAdminUsername}`}
                />
              )}
              {application.rejectionReason && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {t.instructorApplications.rejectionReason}
                  </p>
                  <p className="mt-1 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
                    {application.rejectionReason}
                  </p>
                </div>
              )}
              {application.editRequestNote && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {t.instructorApplications.editRequestNote}
                  </p>
                  <p className="mt-1 text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
                    {application.editRequestNote}
                  </p>
                </div>
              )}
              {application.banUntil && (
                <InfoRow
                  icon={<XCircle className="w-4 h-4 text-red-400" />}
                  label={t.instructorApplications.bannedUntil}
                  value={
                    <span className="text-red-600 font-medium">
                      {formatDateTime(application.banUntil)}
                    </span>
                  }
                />
              )}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Review Modal */}
      {modalAction && (
        <ReviewModal
          action={modalAction}
          applicantName={displayFullName}
          isLoading={isSubmitting}
          showBanPicker={true}
          onConfirm={handleConfirm}
          onClose={() => !isSubmitting && setModalAction(null)}
        />
      )}

      {/* Remove Intro Video Confirm Modal */}
      <ConfirmModal
        isOpen={showRemoveVideoModal}
        onClose={() => !isRemovingVideo && setShowRemoveVideoModal(false)}
        onConfirm={handleRemoveVideo}
        title="Gỡ video giới thiệu"
        description="Bạn có chắc chắn muốn gỡ video giới thiệu của giảng viên này? Video sẽ bị xóa khỏi hồ sơ và hệ thống sẽ gửi thông báo cảnh cáo cho giảng viên."
        confirmText="Gỡ video"
        cancelText={t.common.cancel}
        variant="danger"
        isLoading={isRemovingVideo}
        icon={<Trash2 className="w-6 h-6 text-red-600" />}
      />
    </>
  );
}
