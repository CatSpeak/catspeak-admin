import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../lib/axios";
import { getStaffDetail } from "../api/getStaffDetail";
import type { StaffDetail } from "../types";

export function useStaffDetail(staffId?: string) {
  const [staff, setStaff] = useState<StaffDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const id = Number(staffId);
    if (!staffId || Number.isNaN(id) || id <= 0) {
      setStaff(null);
      setError("Invalid staff id.");
      setLoading(false);
      return;
    }

    const fetchStaffDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getStaffDetail(id);
        if (cancelled) return;
        setStaff(response);
      } catch (fetchError: unknown) {
        if (cancelled) return;
        setStaff(null);
        setError(getApiErrorMessage(fetchError, "Failed to fetch staff."));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchStaffDetail();
    return () => {
      cancelled = true;
    };
  }, [staffId]);

  return {
    staff,
    loading,
    error,
  };
}
