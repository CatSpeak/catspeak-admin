import { useState, useEffect, useCallback } from "react";
import {
  getTrafficChannelStats,
  getAgeGenderStats,
  getActiveUsersStats,
  getMonthlyTargetProgress,
  type ActiveUsersParams,
  type TrafficSegment,
  type AgeGenderSegment,
  type ActiveUsersItem,
  type MonthlyTargetProgress,
} from "../api/getOverviewStats";
import { getApiErrorMessage } from "../../../lib/axios";

export function useOverviewStats(params?: ActiveUsersParams) {
  const [trafficSegments, setTrafficSegments] = useState<TrafficSegment[] | null>(null);
  const [ageGenderData, setAgeGenderData] = useState<AgeGenderSegment[] | null>(null);
  const [activeUsersData, setActiveUsersData] = useState<ActiveUsersItem[] | null>(null);
  const [monthlyTargetProgress, setMonthlyTargetProgress] = useState<MonthlyTargetProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const period = params?.period;
  const interval = params?.interval;
  const fromDate = params?.fromDate;
  const toDate = params?.toDate;

  const fetchAllStats = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setLoading(true);
    }
    setError(null);
    try {
      const [traffic, ageGender, activeUsers, monthlyTarget] = await Promise.all([
        getTrafficChannelStats(),
        getAgeGenderStats(),
        getActiveUsersStats({ period, interval, fromDate, toDate }),
        getMonthlyTargetProgress().catch((err) => {
          console.error("Failed to fetch monthly target progress:", err);
          return null;
        }),
      ]);
      setTrafficSegments(traffic);
      setAgeGenderData(ageGender);
      setActiveUsersData(activeUsers);
      setMonthlyTargetProgress(monthlyTarget);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load overview stats."));
    } finally {
      setLoading(false);
    }
  }, [period, interval, fromDate, toDate]);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [traffic, ageGender, activeUsers, monthlyTarget] = await Promise.all([
          getTrafficChannelStats(),
          getAgeGenderStats(),
          getActiveUsersStats({ period, interval, fromDate, toDate }),
          getMonthlyTargetProgress().catch((err) => {
            console.error("Failed to fetch monthly target progress:", err);
            return null;
          }),
        ]);
        if (cancelled) return;
        setTrafficSegments(traffic);
        setAgeGenderData(ageGender);
        setActiveUsersData(activeUsers);
        setMonthlyTargetProgress(monthlyTarget);
      } catch (err) {
        if (cancelled) return;
        setTrafficSegments(null);
        setAgeGenderData(null);
        setActiveUsersData(null);
        setMonthlyTargetProgress(null);
        setError(getApiErrorMessage(err, "Failed to load overview stats."));
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
  }, [period, interval, fromDate, toDate]);

  const refetch = useCallback(() => {
    return fetchAllStats(false);
  }, [fetchAllStats]);

  return {
    trafficSegments,
    ageGenderData,
    activeUsersData,
    monthlyTargetProgress,
    loading,
    error,
    refetch,
  };
}
