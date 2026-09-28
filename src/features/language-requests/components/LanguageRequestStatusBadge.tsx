import Badge, { type BadgeType } from "../../../components/ui/Badge";
import type { LanguageRequestStatus } from "../types";
import { useLanguage } from "../../../stores/languageStore";

const STATUS_TYPE: Record<LanguageRequestStatus, BadgeType> = {
  Pending: "Yellow",
  Approved: "Green",
  Rejected: "Red",
  Cancelled: "Gray",
};

interface LanguageRequestStatusBadgeProps {
  status: LanguageRequestStatus;
}

export default function LanguageRequestStatusBadge({
  status,
}: LanguageRequestStatusBadgeProps) {
  const { t } = useLanguage();

  const labels: Record<LanguageRequestStatus, string> = {
    Pending: t.common.pending,
    Approved: t.common.approved,
    Rejected: t.common.rejected,
    Cancelled: t.common.cancelled,
  };

  return (
    <Badge
      title={labels[status] ?? status}
      type={STATUS_TYPE[status] ?? "Gray"}
    />
  );
}
