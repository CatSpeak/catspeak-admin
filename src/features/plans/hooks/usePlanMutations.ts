import { useState } from "react";
import { updatePlan as updatePlanApi } from "../api/updatePlan";
import { deletePlan as deletePlanApi } from "../api/deletePlan";
import { createPlan as createPlanApi } from "../api/createPlan";
import type { Plan } from "../../../entities/types";

export function usePlanMutations() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleCreate = async (formData: FormData): Promise<Plan | null> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await createPlanApi(formData);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to create plan"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: number, formData: FormData): Promise<Plan | null> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await updatePlanApi(id, formData);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update plan"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    try {
      await deletePlanApi(id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to delete plan"));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    createPlan: handleCreate,
    updatePlan: handleUpdate,
    deletePlan: handleDelete,
  };
}
