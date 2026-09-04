import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../lib/axios";
import { getInstructorRevisionDetail } from "../api/getInstructorRevisionDetail";
import type { InstructorRevisionDetail } from "../types";

export function useInstructorRevisionDetail(revisionId?: string) {
  const [application, setApplication] =
    useState<InstructorRevisionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const id = Number(revisionId);
    if (!revisionId || Number.isNaN(id) || id <= 0) {
      setApplication(null);
      setError("Invalid revision id.");
      setLoading(false);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getInstructorRevisionDetail(id);
        if (cancelled) return;
        setApplication(data);
      } catch (err: unknown) {
        if (cancelled) return;
        setApplication(null);
        setError(getApiErrorMessage(err, "Failed to fetch revision details."));
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
  }, [revisionId]);

  return { application, loading, error };
}