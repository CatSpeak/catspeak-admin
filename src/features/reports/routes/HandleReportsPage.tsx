import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReportsSummaryCards from "../components/ReportsSummaryCards";
import ReportsTable from "../components/ReportsTable";
import ReportDialog from "../components/ReportDialog";

export default function HandleReportsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <ReportsSummaryCards />

      {/* Reports Table */}
      <ReportsTable key={refreshTrigger} />

      {id && (
        <ReportDialog
          id={id}
          onClose={() => navigate("/reports")}
          onDeleteSuccess={() => {
            handleRefresh();
            navigate("/reports");
          }}
        />
      )}
    </div>
  );
}
