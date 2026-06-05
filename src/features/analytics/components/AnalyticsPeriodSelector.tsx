const periods = ["today", "last7days", "last30days", "thisMonth"] as const;
const periodLabels: Record<string, string> = {
  today: "Today",
  last7days: "Last 7 Days",
  last30days: "Last 30 Days",
  thisMonth: "This Month",
};

interface AnalyticsPeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

export default function AnalyticsPeriodSelector({
  selectedPeriod,
  onPeriodChange,
}: AnalyticsPeriodSelectorProps) {
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
