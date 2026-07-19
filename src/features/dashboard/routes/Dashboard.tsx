import { useSearchParams } from "react-router-dom";
import PlatformOverview from "./PlatformOverview";
import PaymentsAndClaims from "./PaymentsAndClaims";
import AnalyticsPage from "../../analytics/routes/AnalyticsPage";
import { PageHeader } from "../../../components/ui/PageHeader";
import { LayoutDashboard } from "lucide-react";

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") || "platform-overview";

  const handleTabChange = (tabName: string) => {
    setSearchParams({ tab: tabName });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page Title + Tab Switcher ── */}
      <PageHeader
        icon={<LayoutDashboard />}
        title="Dashboard"
        desc="Platform-wide system metrics and insights"
        rightButtons={[
          <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => handleTabChange("platform-overview")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "platform-overview"
                  ? "bg-white text-gray-900 shadow-xs font-bold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Platform Overview
            </button>
            <button
              onClick={() => handleTabChange("payments-and-claims")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "payments-and-claims"
                  ? "bg-white text-gray-900 shadow-xs font-bold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Payments & Claims
            </button>
            <button
              onClick={() => handleTabChange("analytics")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-white text-gray-900 shadow-xs font-bold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Analytics
            </button>
          </div>,
        ]}
      />

      {/* Render Component tương ứng dựa trên URL state */}
      <div className="animate-fade-in">
        {activeTab === "platform-overview" ? (
          <PlatformOverview />
        ) : activeTab === "payments-and-claims" ? (
          <PaymentsAndClaims />
        ) : (
          <AnalyticsPage />
        )}
      </div>
    </div>
  );
}
