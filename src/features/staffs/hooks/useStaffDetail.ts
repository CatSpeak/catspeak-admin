import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../lib/axios";
import { getStaffDetail } from "../api/getStaffDetail";
import type { StaffDetail } from "../types";

export function useStaffDetail(staffId?: string) {
  const [staff, setStaff] = useState<StaffDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
        setStaff(response);
      } catch (fetchError: unknown) {
        setStaff(null);
        setError(getApiErrorMessage(fetchError, "Failed to fetch staff."));
      } finally {
        setLoading(false);
      }
    };

    fetchStaffDetail();
  }, [staffId]);

  return {
    staff,
    loading,
    error,
  };
}
