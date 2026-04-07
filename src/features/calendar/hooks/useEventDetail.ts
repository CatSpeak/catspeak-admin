import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../lib/axios";
import { getEventDetail } from "../api/eventApi";
import type { EventDetail } from "../types";

export function useEventDetail(eventId: number | null) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    setEvent(null);
    try {
      const data = await getEventDetail(id);
      setEvent(data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to load event details."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (eventId !== null) {
      fetch(eventId);
    } else {
      setEvent(null);
      setError(null);
    }
  }, [eventId, fetch]);

  return { event, isLoading, error };
}
