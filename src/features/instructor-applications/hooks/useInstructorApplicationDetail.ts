import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../lib/axios";
import { getInstructorApplicationDetail } from "../api/getInstructorApplicationDetail";
import type { InstructorApplicationDetail } from "../types";

export function useInstructorApplicationDetail(profileId?: string) {
  const [application, setApplication] =
    useState<InstructorApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = Number(profileId);
    if (!profileId || Number.isNaN(id) || id <= 0) {
      setApplication(null);
      setError("Invalid application id.");
      setLoading(false);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getInstructorApplicationDetail(id);
        setApplication(data);
      } catch (err: unknown) {
        setApplication(null);
        setError(getApiErrorMessage(err, "Failed to fetch application details."));
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [profileId]);

  return { application, loading, error };
}
