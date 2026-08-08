import React from "react";
import Badge, { type BadgeType } from "../../../components/ui/Badge";
import type { ClassStatus } from "../types";

const STATUS_STYLE: Record<ClassStatus, BadgeType> = {
  UPCOMING: "Gray",
  OPEN_FOR_ENROLLMENT: "Green",
  NOT_STARTED: "Yellow",
  TEACHING: "Blue",
  ARCHIVED: "Red",
  FINISHED: "Purple",
};

interface ClassStatusBadgeProps {
  status: string;
  label: string;
}

export const ClassStatusBadge: React.FC<ClassStatusBadgeProps> = ({
  status,
  label,
}) => {
  return (
    <Badge
      title={label}
      type={STATUS_STYLE[status as ClassStatus] ?? "Gray"}
      showDot
    />
  );
};
