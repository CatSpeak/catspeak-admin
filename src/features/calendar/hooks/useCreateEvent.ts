import { useCallback, useEffect, useState } from "react";
import type { CalendarEvent, EventColor, EventPrefill } from "../types";

interface EventFormState {
  title: string;
  description: string;
  location: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  isAllDay: boolean;
  color: EventColor;
}

interface FormErrors {
  title?: string;
  startDate?: string;
  endDate?: string;
}

const INITIAL_FORM: EventFormState = {
  title: "",
  description: "",
  location: "",
  startDate: "",
  startTime: "09:00",
  endDate: "",
  endTime: "10:00",
  isAllDay: false,
  color: "blue",
};

export function useCreateEvent(
  onEventCreated: (event: CalendarEvent) => void,
  prefill?: EventPrefill,
) {
  const [form, setForm] = useState<EventFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (prefill) {
      setForm((prev) => ({
        ...prev,
        startDate: prefill.startDate ?? prev.startDate,
        startTime: prefill.startTime ?? prev.startTime,
        endDate: prefill.endDate ?? prev.endDate,
        endTime: prefill.endTime ?? prev.endTime,
      }));
    }
  }, [prefill]);

  const updateField = useCallback(
    <K extends keyof EventFormState>(key: K, value: EventFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const validate = useCallback((): boolean => {
    const next: FormErrors = {};
    if (!form.title.trim()) next.title = "Title is required";
    if (!form.startDate) next.startDate = "Start date is required";
    if (!form.endDate) next.endDate = "End date is required";
    if (form.startDate && form.endDate) {
      const s = new Date(`${form.startDate}T${form.isAllDay ? "00:00" : form.startTime}`);
      const e = new Date(`${form.endDate}T${form.isAllDay ? "23:59" : form.endTime}`);
      if (e < s) next.endDate = "End must be after start";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [form]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      const startISO = new Date(`${form.startDate}T${form.isAllDay ? "00:00" : form.startTime}`).toISOString();
      const endISO = new Date(`${form.endDate}T${form.isAllDay ? "23:59" : form.endTime}`).toISOString();
      onEventCreated({
        id: `evt-${Date.now()}`,
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        startDate: startISO,
        endDate: endISO,
        isAllDay: form.isAllDay,
        color: form.color,
      });
      setForm(INITIAL_FORM);
    } finally {
      setIsSubmitting(false);
    }
  }, [form, validate, onEventCreated]);

  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM);
    setErrors({});
  }, []);

  return { form, errors, isSubmitting, updateField, handleSubmit, resetForm };
}
