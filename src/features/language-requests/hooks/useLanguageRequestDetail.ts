import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../lib/axios";
import { getLanguageRequestDetail } from "../api/getLanguageRequestDetail";
import type { LanguageRequestDetail } from "../types";

export function useLanguageRequestDetail(requestId?: string) {
  const [request, setRequest] = useState<LanguageRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let cancelled = false;
    const id = Number(requestId);
    if (!requestId || Number.isNaN(id) || id <= 0) {
      setRequest(null);
      setError("Invalid request id.");
      setLoading(false);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getLanguageRequestDetail(id);
        if (cancelled) return;
        setRequest(data);
      } catch (err: unknown) {
        if (cancelled) return;
        setRequest(null);
        setError(getApiErrorMessage(err, "Failed to fetch request details."));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetch();
    return () => {
      cancelled = true;
    };
  }, [requestId, reloadKey]);

  return { request, loading, error, refetch };
}
