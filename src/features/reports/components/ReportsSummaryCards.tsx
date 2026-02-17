import ReportSummaryCard from "./ReportSummaryCard";

export default function ReportsSummaryCards() {
  return (
    <div>
      {/* Header Text */}
      <h2
        className="text-base font-semibold mb-4"
        style={{ color: "var(--color-primary)" }}
      >
        Here is the information you need to handle today
      </h2>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportSummaryCard
          title="Letter Reports"
          mainValue="50 / 34 / 37"
          subtitle="All reports (In Send, Awaiting) 34 reported and 13 violation case"
          bgColor="#F8C4C4"
          textColor="#910b09"
        />
        <ReportSummaryCard
          title="Reported User"
          mainValue="34 / 37"
          subtitle="(waiting) 34 reported and 37 requiring cases"
          bgColor="#FFD8B3"
          textColor="#D97706"
        />
        <ReportSummaryCard
          title="Meeting Incident Reports"
          mainValue="66"
          subtitle="66 reports in total"
          bgColor="#D4E4F7"
          textColor="#2563EB"
        />
        <ReportSummaryCard
          title="Total User Warning"
          mainValue="15"
          subtitle=""
          bgColor="#F8C4C4"
          textColor="#910b09"
          showPercentage={15}
        />
      </div>
    </div>
  );
}
