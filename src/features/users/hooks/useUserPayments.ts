import { useEffect, useState } from "react";
import { getUserPayments, type UserPayment } from "../api/getUserPayments";
import { getApiErrorMessage } from "../../../lib/axios";

export function useUserPayments(userId?: string) {
  const [payments, setPayments] = useState<UserPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const id = Number(userId);
    if (!userId || Number.isNaN(id) || id <= 0) {
      setPayments([]);
      setError("Invalid user id.");
      setLoading(false);
      return;
    }

    const fetchPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUserPayments(id);
        if (cancelled) return;
        setPayments(data);
      } catch (err) {
        if (cancelled) return;
        setPayments([]);
        setError(getApiErrorMessage(err, "Failed to fetch user payments."));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPayments();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return {
    payments,
    loading,
    error,
  };
}
