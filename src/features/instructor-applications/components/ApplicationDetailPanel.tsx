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
import ReviewModal, { type ReviewAction, type ReviewModalResult } from "./ReviewModal";
import Button from "../../../components/ui/Button";
import { useToastStore } from "../../../stores/toastStore";
import {
  approveApplication,
  rejectApplication,
  requestEditApplication,
} from "../api/reviewInstructorApplication";
import type { InstructorApplicationDetail } from "../types";

interface ApplicationDetailPanelProps {
  application: InstructorApplicationDetail;
  onReviewed: () => void;
}

function safeParseJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
          className="block w-full rounded-lg overflow-hidden border border-gray-200 hover:border-primary transition-colors group"
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
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);
  const [modalAction, setModalAction] = useState<ReviewAction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const languages = safeParseJsonArray(application.languagesTeach);
  const credentials = safeParseJsonArray(application.credentialUrls);
  const canReview = (REVIEWABLE_STATUSES as readonly string[]).includes(
    application.status,
  );

  const handleConfirm = async (result: ReviewModalResult) => {
    setIsSubmitting(true);
    try {
      if (result.action === "approve") {
        await approveApplication(application.profileId);
        addToast("success", "Application approved successfully.");
      } else if (result.action === "reject") {
        await rejectApplication(
          application.profileId,
          result.reason!,
          result.banDuration!,
        );
        addToast("success", "Application rejected.");
      } else if (result.action === "requestEdit") {
        await requestEditApplication(application.profileId, result.editNote!);
        addToast("info", "Edit request sent to applicant.");
      }
      setModalAction(null);
      onReviewed();
    } catch {
      addToast("error", "Action failed. Please try again.");
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
            className="hover:text-primary transition-colors"
          >
            Instructor Applications
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
        >
          Back
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
            @{application.username} · Account #{application.accountId}
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
              Approve
            </Button>
            <Button
              size="sm"
              className="!bg-blue-600 hover:!bg-blue-700 text-white"
              leftIcon={<Edit3 className="w-4 h-4" />}
              onClick={() => setModalAction("requestEdit")}
            >
              Request Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<XCircle className="w-4 h-4" />}
              onClick={() => setModalAction("reject")}
            >
              Reject
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Personal Info */}
          <SectionCard title="Personal Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow
                icon={<Mail className="w-4 h-4" />}
                label="Account Email"
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
                label="Profile Email"
                value={application.email || "—"}
              />
              <InfoRow
                icon={<Phone className="w-4 h-4" />}
                label="Phone"
                value={application.phoneNumber || "—"}
              />
              <InfoRow
                icon={<Globe className="w-4 h-4" />}
                label="Nationality"
                value={application.nationality || "—"}
              />
              <InfoRow
                icon={<MapPin className="w-4 h-4" />}
                label="Address"
                value={application.address || "—"}
              />
              <InfoRow
                icon={<Languages className="w-4 h-4" />}
                label="Native Language"
                value={application.nativeLanguage || "—"}
              />
            </div>
          </SectionCard>

          {/* Teaching Info */}
          <SectionCard title="Teaching Profile">
            <div className="space-y-4">
              <InfoRow
                icon={<BookOpen className="w-4 h-4" />}
                label="Languages to Teach"
                value={
                  languages.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {languages.map((lang) => (
                        <span
                          key={lang}
                          className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  ) : (
                    "—"
                  )
                }
              />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Introduction
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
                  {application.introduction || "No introduction provided."}
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Credentials */}
          <SectionCard title="Credentials">
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
                      Credential {i + 1}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No credentials uploaded.</p>
            )}
          </SectionCard>

          {/* Intro Video */}
          {application.introVideoUrl && (
            <SectionCard title="Introduction Video">
              <a
                href={application.introVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Video className="w-4 h-4 shrink-0" />
                Watch intro video
              </a>
            </SectionCard>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* ID Cards */}
          <SectionCard title="Identity Verification">
            <div className="space-y-3">
              {application.idCardFrontUrl ? (
                <ImagePreview
                  src={application.idCardFrontUrl}
                  label="ID Card – Front"
                />
              ) : (
                <p className="text-sm text-gray-500">No front ID uploaded.</p>
              )}
              {application.idCardBackUrl ? (
                <ImagePreview
                  src={application.idCardBackUrl}
                  label="ID Card – Back"
                />
              ) : (
                <p className="text-sm text-gray-500">No back ID uploaded.</p>
              )}
            </div>
          </SectionCard>

          {/* Review Meta */}
          <SectionCard title="Review History">
            <div className="space-y-3 text-sm">
              <InfoRow
                icon={<Clock className="w-4 h-4" />}
                label="Submitted"
                value={formatDate(application.submittedAt)}
              />
              {application.reviewedAt && (
                <InfoRow
                  icon={<Clock className="w-4 h-4" />}
                  label="Last Reviewed"
                  value={formatDate(application.reviewedAt)}
                />
              )}
              {application.reviewedByAdminUsername && (
                <InfoRow
                  icon={<ShieldCheck className="w-4 h-4" />}
                  label="Reviewed By"
                  value={`@${application.reviewedByAdminUsername}`}
                />
              )}
              {application.rejectionReason && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Rejection Reason
                  </p>
                  <p className="mt-1 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
                    {application.rejectionReason}
                  </p>
                </div>
              )}
              {application.editRequestNote && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Edit Request Note
                  </p>
                  <p className="mt-1 text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
                    {application.editRequestNote}
                  </p>
                </div>
              )}
              {application.banUntil && (
                <InfoRow
                  icon={<XCircle className="w-4 h-4 text-red-400" />}
                  label="Banned Until"
                  value={
                    <span className="text-red-600 font-medium">
                      {formatDate(application.banUntil)}
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
