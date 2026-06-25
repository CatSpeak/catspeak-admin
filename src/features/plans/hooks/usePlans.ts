import { useState, useEffect, useMemo, useCallback } from "react";
import { getPlans } from "../api/getPlans";
import type { Plan } from "../../../entities/types";

export interface PlanFilters {
  search?: string;
  role?: string;
  status?: string;
  type?: string;
}

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [filters, setFilters] = useState<PlanFilters>({
    search: "",
    role: "",
    status: undefined,
    type: "",
  });

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPlans();
      setPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch plans"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      if (filters.search && !plan.planName.toLowerCase().includes(filters.search.toLowerCase()) && !plan.subscriptionCode.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.role && plan.applicableRole !== filters.role) {
        return false;
      }
      if (filters.status !== undefined && plan.packageStatus !== filters.status) {
        return false;
      }
      if (filters.type && plan.billingCycle !== filters.type) {
        return false;
      }
      return true;
    });
  }, [plans, filters]);

  const stats = useMemo(() => {
    return {
      total: plans.length,
      active: plans.filter(p => p.packageStatus === "Published").length,
      hidden: plans.filter(p => p.packageStatus === "Hidden").length,
      archived: plans.filter(p => p.packageStatus === "Archived").length,
      draft: plans.filter(p => p.packageStatus === "Draft").length,
    };
  }, [plans]);

  return {
    plans: filteredPlans,
    rawPlans: plans,
    loading,
    error,
    stats,
    filters,
    setFilters,
    refetch: fetchPlans,
  };
}
