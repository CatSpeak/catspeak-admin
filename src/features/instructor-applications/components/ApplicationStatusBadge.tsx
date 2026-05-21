import type { ApplicationStatus } from "../types";

interface StatusConfig {
  label: string;
  className: string;
}

const STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
  Pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700 border border-amber-200",
  },
  Approved: {
    label: "Approved",
    className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  },
  Rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 border border-red-200",
  },
  RequestEdit: {
    label: "Request Edit",
    className: "bg-blue-100 text-blue-700 border border-blue-200",
  },
};

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
}

export default function ApplicationStatusBadge({
  status,
}: ApplicationStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.Pending;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${config.className}`}
    >
      {config.label}
    </span>
  );
}
