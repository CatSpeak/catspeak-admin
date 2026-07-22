import { useLanguage } from "../../../stores/languageStore";

const periods = ["today", "last7days", "last30days", "thisMonth"] as const;

interface AnalyticsPeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

export default function AnalyticsPeriodSelector({
  selectedPeriod,
  onPeriodChange,
}: AnalyticsPeriodSelectorProps) {
  const { t } = useLanguage();

  const periodLabels: Record<string, string> = {
    today: t.analytics.today,
    last7days: t.analytics.last7days,
    last30days: t.analytics.last30days,
    thisMonth: t.analytics.thisMonth,
  };

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100 overflow-x-auto">
      {periods.map((p) => (
        <button
          key={p}
          onClick={() => onPeriodChange(p)}
          className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 whitespace-nowrap ${
            selectedPeriod === p
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700 hover:bg-black/5"
          }`}
        >
          {periodLabels[p]}
        </button>
      ))}
    </div>
  );
}
