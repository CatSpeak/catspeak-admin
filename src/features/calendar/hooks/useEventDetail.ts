import { useCallback, useEffect, useRef, useState } from "react";
import { getApiErrorMessage } from "../../../lib/axios";
import { getEventDetail } from "../api/eventApi";
import type { EventDetail } from "../types";

export function useEventDetail(eventId: number | null) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const fetch = useCallback(async (id: number) => {
    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;
    setIsLoading(true);
    setError(null);
    setEvent(null);
    try {
      const data = await getEventDetail(id);
      if (currentRequestId !== requestId.current) return;
      setEvent(data);
    } catch (err: unknown) {
      if (currentRequestId !== requestId.current) return;
      setError(getApiErrorMessage(err, "Failed to load event details."));
    } finally {
      if (currentRequestId === requestId.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (eventId !== null) {
      fetch(eventId);
    } else {
      requestId.current += 1;
      setEvent(null);
      setError(null);
      setIsLoading(false);
    }
  }, [eventId, fetch]);

  return { event, isLoading, error };
}
