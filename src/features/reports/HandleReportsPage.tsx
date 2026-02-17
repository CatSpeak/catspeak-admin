import ReportsSummaryCards from "./components/ReportsSummaryCards";
import ReportsTable from "./components/ReportsTable";

export default function HandleReportsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <ReportsSummaryCards />

      {/* Reports Table */}
      <ReportsTable />
    </div>
  );
}
