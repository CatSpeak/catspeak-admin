import { useCallback, useState } from "react";
import { getApiErrorMessage } from "../../../lib/axios";
import { createRoom, createPersistentRoom } from "../api/roomApi";
import type { LanguageType, RequiredLevel, RoomTopic, RoomType } from "../types";

interface FormState {
  name: string;
  roomType: RoomType;
  languageType: LanguageType;
  requiredLevel: RequiredLevel;
  topics: RoomTopic[];
  description: string;
  isPersistent: boolean;
}

interface FormErrors {
  name?: string;
  general?: string;
}

const INITIAL: FormState = {
  name: "",
  roomType: "Group",
  languageType: "Chinese",
  requiredLevel: "HSK1",
  topics: [],
  description: "",
  isPersistent: false,
};

export function useCreateRoom(onCreated: () => void) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "name") setErrors({});
  }, []);

  const toggleTopic = useCallback((topic: RoomTopic) => {
    setForm((prev) => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter((t) => t !== topic)
        : [...prev.topics, topic],
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.name.trim()) {
      setErrors({ name: "Room name is required" });
      return;
    }
    setIsSubmitting(true);
    setErrors({});
    try {
      const formData = new FormData();
      formData.append("Name", form.name);
      formData.append("RoomType", form.roomType);
      formData.append("LanguageType", form.languageType);
      formData.append("RequiredLevel", form.requiredLevel);
      if (form.description) formData.append("Description", form.description);

      if (form.isPersistent) {
        // Persistent rooms use singular Topic
        if (form.topics.length > 0) formData.append("Topic", form.topics[0]);
        await createPersistentRoom(formData);
      } else {
        // Regular rooms use Topics array
        form.topics.forEach((t) => formData.append("Topics", t));
        await createRoom(formData);
      }

      setForm(INITIAL);
      onCreated();
    } catch (err: unknown) {
      setErrors({ general: getApiErrorMessage(err, "Failed to create room.") });
    } finally {
      setIsSubmitting(false);
    }
  }, [form, onCreated]);

  const resetForm = useCallback(() => {
    setForm(INITIAL);
    setErrors({});
  }, []);

  return { form, errors, isSubmitting, updateField, toggleTopic, handleSubmit, resetForm };
}
