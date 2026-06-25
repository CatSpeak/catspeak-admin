import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PlanForm from "../components/PlanForm";
import { usePlanMutations } from "../hooks/usePlanMutations";

const PlanCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { createPlan, isSubmitting } = usePlanMutations();

  const handleSubmit = async (formData: FormData) => {
    const result = await createPlan(formData);
    if (result) {
      navigate("/plans");
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Create New Plan</h1>
          <p className="text-gray-500 text-sm mt-1">Create a new service package to offer to users</p>
        </div>
      </div>

      <PlanForm 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
        onCancel={() => navigate("/plans")} 
      />
    </div>
  );
};

export default PlanCreatePage;
