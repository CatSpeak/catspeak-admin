import type { RevisionStatus } from "../types";
import { useLanguage } from "../../../stores/languageStore";

interface StatusStyle {
  className: string;
}

const STATUS_STYLE: Record<RevisionStatus, StatusStyle> = {
  Pending: {
    className: "bg-amber-100 text-amber-700 border border-amber-200",
  },
  Approved: {
    className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  },
  Rejected: {
    className: "bg-red-100 text-red-700 border border-red-200",
  },
  Cancelled: {
    className: "bg-gray-100 text-gray-600 border border-gray-200",
  },
  RequestEdit: {
    className: "bg-blue-100 text-blue-700 border border-blue-200",
  },
};

interface RevisionStatusBadgeProps {
  status: RevisionStatus;
}

export default function RevisionStatusBadge({ status }: RevisionStatusBadgeProps) {
  const { t } = useLanguage();

  const STATUS_LABELS: Record<RevisionStatus, string> = {
    Pending: t.common.pending,
    Approved: t.common.approved,
    Rejected: t.common.rejected,
    Cancelled: t.common.cancelled,
    RequestEdit: t.instructorApplications.requestEdit,
  };

  const style = STATUS_STYLE[status] ?? STATUS_STYLE.Pending;
  const label = STATUS_LABELS[status] ?? t.common.pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${style.className}`}
    >
      {label}
    </span>
  );
}