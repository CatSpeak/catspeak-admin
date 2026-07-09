import React from "react";
import { FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import PageTitle from "../../components/ui/PageTitle";
import PlanSummaryCards from "./components/PlanSummaryCards";
import PlanFilters from "./components/PlanFilters";
import PlanTable from "./components/PlanTable";
import { usePlans } from "./hooks/usePlans";
import { usePlanMutations } from "./hooks/usePlanMutations";
import { PageHeader } from "../../components/ui/PageHeader";

const PlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { plans, stats, loading, error, filters, setFilters, refetch } =
    usePlans();
  const { deletePlan } = usePlanMutations();

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      const success = await deletePlan(id);
      if (success) {
        refetch();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={<FileText />}
        title="Plans"
        desc="Manage, create and configure service plans on the system"
        rightButtons={[
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/plans/create")}
          >
            <Plus className="size-4 mr-1" />
            Create Plan
          </Button>,
        ]}
      />

      <PlanSummaryCards stats={stats} />

      <PlanFilters filters={filters} setFilters={setFilters} />

      <PlanTable
        plans={plans}
        loading={loading}
        error={error}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default PlansPage;
