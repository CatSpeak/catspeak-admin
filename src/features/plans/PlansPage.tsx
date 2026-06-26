import React from "react"
import { Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Button from "../../components/ui/Button"
import PlanSummaryCards from "./components/PlanSummaryCards"
import PlanFilters from "./components/PlanFilters"
import PlanTable from "./components/PlanTable"
import { usePlans } from "./hooks/usePlans"
import { usePlanMutations } from "./hooks/usePlanMutations"

const PlansPage: React.FC = () => {
  const navigate = useNavigate()
  const { plans, stats, loading, error, filters, setFilters, refetch } =
    usePlans()
  const { deletePlan } = usePlanMutations()

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      const success = await deletePlan(id)
      if (success) {
        refetch()
      }
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Plan Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage, create and configure service plans on the system
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" onClick={() => navigate("/plans/create")}>
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>

      <PlanSummaryCards stats={stats} />

      <PlanFilters filters={filters} setFilters={setFilters} />

      <PlanTable
        plans={plans}
        loading={loading}
        error={error}
        onDelete={handleDelete}
      />
    </div>
  )
}

export default PlansPage
