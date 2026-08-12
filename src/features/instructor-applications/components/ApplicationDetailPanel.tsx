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
  BookOpen,
  FileText,
  Video,
  ShieldCheck,
  Clock,
} from "lucide-react";
import ApplicationStatusBadge from "./ApplicationStatusBadge";
import ReviewModal, {
  type ReviewAction,
  type ReviewModalResult,
} from "./ReviewModal";
import Button from "../../../components/ui/Button";
import { useToastStore } from "../../../stores/toastStore";
import {
  approveApplication,
  rejectApplication,
  requestEditApplication,
} from "../api/reviewInstructorApplication";
import type { InstructorApplicationDetail } from "../types";
import { useLanguage } from "../../../stores/languageStore";
import { formatDateTime } from "../../../lib/utils";

interface ApplicationDetailPanelProps {
  application: InstructorApplicationDetail;
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
            className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-200"
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
  const { t } = useLanguage();
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);
  const [modalAction, setModalAction] = useState<ReviewAction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const languages = safeParseJsonArray(application.languagesTeach);
  const credentials = safeParseStringArray(application.credentialUrls);
  const canReview = (REVIEWABLE_STATUSES as readonly string[]).includes(
    application.status,
  );

  const handleConfirm = async (result: ReviewModalResult) => {
    setIsSubmitting(true);
    try {
      if (result.action === "approve") {
        await approveApplication(application.profileId);
        addToast("success", t.instructorApplications.approveSuccess);
      } else if (result.action === "reject") {
        await rejectApplication(
          application.profileId,
          result.reason!,
          result.banDuration!,
        );
        addToast("success", t.instructorApplications.rejectSuccess);
      } else if (result.action === "requestEdit") {
        await requestEditApplication(application.profileId, result.editNote!);
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
            {application.fullName}
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
              {application.fullName}
            </h2>
            <ApplicationStatusBadge status={application.status} />
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
                value={application.email || "—"}
              />
              <InfoRow
                icon={<Phone className="w-4 h-4" />}
                label={t.users.phone}
                value={application.phoneNumber || "—"}
              />
              <InfoRow
                icon={<Globe className="w-4 h-4" />}
                label={t.instructorApplications.nationality}
                value={application.nationality || "—"}
              />
              <InfoRow
                icon={<MapPin className="w-4 h-4" />}
                label={t.instructorApplications.address}
                value={application.address || "—"}
              />
              <InfoRow
                icon={<Languages className="w-4 h-4" />}
                label={t.instructorApplications.nativeLanguage}
                value={application.nativeLanguage || "—"}
              />
            </div>
          </SectionCard>

          {/* Teaching Info */}
          <SectionCard title={t.instructorApplications.teachingProfile}>
            <div className="space-y-4">
              <InfoRow
                icon={<BookOpen className="w-4 h-4" />}
                label={t.instructorApplications.languagesTeach}
                value={
                  languages.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {languages.map((lang, index) => {
                        const text = formatLanguageLabel(lang);
                        return (
                          <span
                            key={index}
                            className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium"
                          >
                            {text}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    "—"
                  )
                }
              />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  {t.instructorApplications.introduction}
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
                  {application.introduction ||
                    t.instructorApplications.noIntroduction}
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Credentials */}
          <SectionCard title={t.instructorApplications.credentials}>
            {credentials.length > 0 ? (
              <ul className="space-y-2">
                {credentials.map((url, i) => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <FileText className="w-4 h-4 shrink-0" />
                      {t.instructorApplications.credentialItem.replace(
                        "{index}",
                        String(i + 1),
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                {t.instructorApplications.noCredentials}
              </p>
            )}
          </SectionCard>

          {/* Intro Video */}
          {application.introVideoUrl && (
            <SectionCard title={t.instructorApplications.introVideo}>
              <a
                href={application.introVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Video className="w-4 h-4 shrink-0" />
                {t.instructorApplications.watchIntroVideo}
              </a>
            </SectionCard>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* ID Cards */}
          <SectionCard title={t.instructorApplications.identityVerification}>
            <div className="space-y-3">
              {application.idCardFrontUrl ? (
                <ImagePreview
                  src={application.idCardFrontUrl}
                  label={t.instructorApplications.idCardFront}
                />
              ) : (
                <p className="text-sm text-gray-500">
                  {t.instructorApplications.noFrontId}
                </p>
              )}
              {application.idCardBackUrl ? (
                <ImagePreview
                  src={application.idCardBackUrl}
                  label={t.instructorApplications.idCardBack}
                />
              ) : (
                <p className="text-sm text-gray-500">
                  {t.instructorApplications.noBackId}
                </p>
              )}
            </div>
          </SectionCard>

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
          applicantName={application.fullName}
          isLoading={isSubmitting}
          onConfirm={handleConfirm}
          onClose={() => !isSubmitting && setModalAction(null)}
        />
      )}
    </>
  );
}
