import { useState, useEffect, useCallback } from 'react';
import type { Plan, SubscriptionFeature } from '../../../entities/types';
import { getPlanById } from '../api/getPlanById';
import { getAvailableFeatures } from '../api/getAvailableFeatures';
import { addPlanFeature } from '../api/addPlanFeature';
import { updatePlanFeature } from '../api/updatePlanFeature';
import { deletePlanFeature } from '../api/deletePlanFeature';
import { updatePlan as updatePlanApi } from '../api/updatePlan';

export const usePlanDetails = (id: number | undefined) => {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [availableFeatures, setAvailableFeatures] = useState<SubscriptionFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlanDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [fetchedPlan, fetchedFeatures] = await Promise.all([
        getPlanById(id),
        getAvailableFeatures()
      ]);
      setPlan(fetchedPlan);
      setAvailableFeatures(fetchedFeatures);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch plan details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPlanDetails();
  }, [fetchPlanDetails]);

  const updateGeneralInfo = async (formData: FormData): Promise<boolean> => {
    if (!id) return false;
    try {
      const success = await updatePlanApi(id, formData);
      if (success) {
        await fetchPlanDetails();
      }
      return success;
    } catch (e) {
      return false;
    }
  };

  const addFeature = async (featureData: any): Promise<boolean> => {
    if (!id) return false;
    const success = await addPlanFeature(id, featureData);
    if (success) await fetchPlanDetails();
    return success;
  };

  const updateFeature = async (featureId: number, featureData: any): Promise<boolean> => {
    if (!id) return false;
    const success = await updatePlanFeature(id, featureId, featureData);
    if (success) await fetchPlanDetails();
    return success;
  };

  const removeFeature = async (featureId: number): Promise<boolean> => {
    if (!id) return false;
    const success = await deletePlanFeature(id, featureId);
    if (success) await fetchPlanDetails();
    return success;
  };

  return {
    plan,
    availableFeatures,
    loading,
    error,
    refetch: fetchPlanDetails,
    updateGeneralInfo,
    addFeature,
    updateFeature,
    removeFeature
  };
};
