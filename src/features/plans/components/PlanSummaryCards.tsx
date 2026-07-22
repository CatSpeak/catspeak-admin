import React from "react";
import SummaryCard from "../../../components/ui/SummaryCard";
import { Package, CheckCircle2, EyeOff, Archive, FileEdit } from "lucide-react";
import type { PlanStatisticsDto } from "../../../entities/types";
import { useLanguage } from "../../../stores/languageStore";

interface PlanSummaryCardsProps {
  stats: PlanStatisticsDto;
}

const PlanSummaryCards: React.FC<PlanSummaryCardsProps> = ({ stats }) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <SummaryCard
        icon={<Package size={20} />}
        label={t.plans.totalPlans}
        value={stats.totalPlans}
        color="#EF4444"
      />
      <SummaryCard
        icon={<CheckCircle2 size={20} />}
        label={t.plans.displaying}
        value={stats.displaying}
        color="#22C55E"
      />
      <SummaryCard
        icon={<EyeOff size={20} />}
        label={t.plans.hidden}
        value={stats.hidden}
        color="#EAB308"
      />
      <SummaryCard
        icon={<Archive size={20} />}
        label={t.plans.archived}
        value={stats.archived}
        color="#6B7280"
      />
      <SummaryCard
        icon={<FileEdit size={20} />}
        label={t.plans.draft}
        value={stats.draft}
        color="#F97316"
      />
    </div>
  );
};

export default PlanSummaryCards;
