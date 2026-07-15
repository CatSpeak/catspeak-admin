import { useState, useEffect, useMemo, useCallback } from "react";
import { getPlans } from "../api/getPlans";
import { getPlanStats } from "../api/getPlanStats";
import type { Plan, PlanStatisticsDto } from "../../../entities/types";

export interface PlanFilters {
  search?: string;
  role?: string;
  packageStatus?: string;
  type?: string;
}

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<PlanStatisticsDto>({
    totalPlans: 0,
    displaying: 0,
    hidden: 0,
    archived: 0,
    draft: 0,
  });

  // const [filters, setFilters] = useState<PlanFilters>({
  //   search: "",
  //   role: "",
  //   packageStatus: undefined,
  //   type: "",
  // });

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [plansData, statsData] = await Promise.all([
        getPlans(),
        getPlanStats(),
      ]);
      setPlans(plansData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch plans"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // const filteredPlans = useMemo(() => {
  //   return plans.filter((plan) => {
  //     if (filters.search && !plan.planName.toLowerCase().includes(filters.search.toLowerCase()) && !plan.subscriptionCode.toLowerCase().includes(filters.search.toLowerCase())) {
  //       return false;
  //     }
  //     if (filters.role && plan.applicableRole !== filters.role) {
  //       return false;
  //     }
  //     if (filters.packageStatus !== undefined && plan.packageStatus !== filters.packageStatus) {
  //       return false;
  //     }
  //     if (filters.type && plan.billingCycle !== filters.type) {
  //       return false;
  //     }
  //     return true;
  //   });
  // }, [plans, filters]);

  return {
    plans,
    rawPlans: plans,
    loading,
    error,
    stats,
    // filters,
    // setFilters,
    refetch: fetchPlans,
  };
}
