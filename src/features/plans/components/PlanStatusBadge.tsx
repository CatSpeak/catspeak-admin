import React from "react";
import Badge from "../../../components/ui/Badge";
import { useLanguage } from "../../../stores/languageStore";
import type { PackageStatus } from "../../../entities/types";

interface PlanStatusBadgeProps {
  status?: PackageStatus | string;
  className?: string;
}

export const PlanStatusBadge: React.FC<PlanStatusBadgeProps> = ({
  status,
  className,
}) => {
  const { t } = useLanguage();

  switch (status) {
    case "Public":
      return <Badge title={t.plans.public} type="Green" className={className} />;
    case "Published":
      return <Badge title={t.plans.published} type="Blue" className={className} />;
    case "Draft":
      return <Badge title={t.plans.draft} type="Orange" className={className} />;
    case "Archived":
      return <Badge title={t.plans.archived} type="Gray" className={className} />;
    case "Hidden":
      return <Badge title={t.plans.hidden} type="Gray" className={className} />;
    default:
      return (
        <Badge title={status || t.users.unknown} type="Gray" className={className} />
      );
  }
};

export default PlanStatusBadge;
