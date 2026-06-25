import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PlanForm from "../components/PlanForm";
import { usePlanMutations } from "../hooks/usePlanMutations";
import { usePlans } from "../hooks/usePlans";
import PageLoader from "../../../routes/PageLoader";

const PlanEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // Since we don't have a GET by ID endpoint, we fetch all and find the one.
  const { rawPlans, loading, error } = usePlans();
  const { updatePlan, isSubmitting } = usePlanMutations();

  const plan = useMemo(() => {
    return rawPlans.find((p) => p.planId === Number(id));
  }, [rawPlans, id]);

  const handleSubmit = async (formData: FormData) => {
    if (!plan) return;
    const result = await updatePlan(plan.planId, formData);
    if (result) {
      navigate("/plans");
    }
  };

  if (loading) return <PageLoader />;
  
  if (error || !plan) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load plan details or plan not found.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/plans")}
          className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Plan</h1>
          <p className="text-gray-500 text-sm mt-1">Update details for {plan.planName}</p>
        </div>
      </div>

      <PlanForm 
        initialData={plan}
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
        onCancel={() => navigate("/plans")} 
      />
    </div>
  );
};

export default PlanEditPage;
