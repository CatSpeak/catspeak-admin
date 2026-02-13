import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../lib/axios";
import { getUserDetail } from "../api/getUserDetail";
import type { UserDetail } from "../types";

export function useUserDetail(userId?: string) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = Number(userId);
    if (!userId || Number.isNaN(id) || id <= 0) {
      setUser(null);
      setError("Invalid user id.");
      setLoading(false);
      return;
    }

    const fetchUserDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getUserDetail(id);
        setUser(response);
      } catch (fetchError: unknown) {
        setUser(null);
        setError(getApiErrorMessage(fetchError, "Failed to fetch user."));
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetail();
  }, [userId]);

  return {
    user,
    loading,
    error,
  };
}
