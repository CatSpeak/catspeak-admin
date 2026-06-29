import React from "react";
import SummaryCard from "../../../components/ui/SummaryCard";
import { Package, CheckCircle2, EyeOff, Archive, FileEdit } from "lucide-react";

interface PlanSummaryCardsProps {
  stats: {
    total: number;
    active: number;
    hidden: number;
    archived: number;
    draft: number;
  };
}

const PlanSummaryCards: React.FC<PlanSummaryCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <SummaryCard
        icon={<Package size={20} />}
        label="Total Plans"
        value={stats.total}
        color="#EF4444"
      />
      <SummaryCard
        icon={<CheckCircle2 size={20} />}
        label="Displaying"
        value={stats.active}
        color="#22C55E"
      />
      <SummaryCard
        icon={<EyeOff size={20} />}
        label="Hidden"
        value={stats.hidden}
        color="#EAB308"
      />
      <SummaryCard
        icon={<Archive size={20} />}
        label="Archived"
        value={stats.archived}
        color="#6B7280"
      />
      <SummaryCard
        icon={<FileEdit size={20} />}
        label="Draft"
        value={stats.draft}
        color="#F97316"
      />
    </div>
  );
};

export default PlanSummaryCards;
