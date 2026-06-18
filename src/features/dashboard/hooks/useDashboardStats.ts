import { useEffect, useState, useCallback } from "react";
import { getDashboardStats, type DashboardStats } from "../api/getDashboardStats";
import { getApiErrorMessage } from "../../../lib/axios";

export function useDashboardStats() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setLoading(true);
    }
    setError(null);
    try {
      const stats = await getDashboardStats();
      setData(stats);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load payment dashboard stats."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const stats = await getDashboardStats();
        if (cancelled) return;
        setData(stats);
      } catch (err) {
        if (cancelled) return;
        setData(null);
        setError(getApiErrorMessage(err, "Failed to load payment dashboard stats."));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const refetch = useCallback(() => {
    return fetchStats(false);
  }, [fetchStats]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}
