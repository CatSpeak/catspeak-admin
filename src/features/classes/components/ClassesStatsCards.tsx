import React from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";
import type { ClassStats } from "../types";
import SummaryCard from "../../../components/ui/SummaryCard";
import { useLanguage } from "../../../stores/languageStore";

interface ClassesStatsCardsProps {
  stats?: ClassStats | null;
  loading?: boolean;
}

export const ClassesStatsCards: React.FC<ClassesStatsCardsProps> = ({
  stats,
  loading = false,
}) => {
  const { t } = useLanguage();

  const cardColors = {
    total: {
      text: "text-purple-600",
      iconBg: "bg-purple-50",
    },
    open: {
      text: "text-green-600",
      iconBg: "bg-green-50",
    },
    teaching: {
      text: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    finished: {
      text: "text-gray-600",
      iconBg: "bg-gray-100",
    },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        icon={<BookOpen size={20} />}
        label={t.classes.stats.total}
        value={stats ? stats.total.toLocaleString() : "?"}
        loading={loading}
        iconClassName={cardColors.total.text}
        iconContainerClassName={cardColors.total.iconBg}
      />
      <SummaryCard
        icon={<Users size={20} />}
        label={t.classes.statuses.OPEN_FOR_ENROLLMENT}
        value={stats ? stats.openForEnrollment.toLocaleString() : "?"}
        loading={loading}
        iconClassName={cardColors.open.text}
        iconContainerClassName={cardColors.open.iconBg}
      />
      <SummaryCard
        icon={<CheckCircle2 size={20} />}
        label={t.classes.statuses.TEACHING}
        value={stats ? stats.teaching.toLocaleString() : "?"}
        loading={loading}
        iconClassName={cardColors.teaching.text}
        iconContainerClassName={cardColors.teaching.iconBg}
      />
      <SummaryCard
        icon={<Clock size={20} />}
        label={t.classes.statuses.FINISHED}
        value={stats ? stats.finished.toLocaleString() : "?"}
        loading={loading}
        iconClassName={cardColors.finished.text}
        iconContainerClassName={cardColors.finished.iconBg}
      />
    </div>
  );
};

export default ClassesStatsCards;
