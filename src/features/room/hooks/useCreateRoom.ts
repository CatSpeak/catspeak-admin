import { useCallback, useState } from "react";
import { getApiErrorMessage } from "../../../lib/axios";
import { createRoom } from "../api/roomApi";
import type { LanguageType, RequiredLevel, RoomPrivacy, RoomTopic, RoomType } from "../types";

interface FormState {
  name: string;
  roomType: RoomType;
  languageType: LanguageType;
  requiredLevel: RequiredLevel;
  topic: RoomTopic;
  description: string;
  privacy: RoomPrivacy;
  password: string;
  thumbnail: File | null;
}

interface FormErrors {
  name?: string;
  password?: string;
  general?: string;
}

const INITIAL: FormState = {
  name: "",
  roomType: "Group",
  languageType: "Chinese",
  requiredLevel: "HSK1",
  topic: "Other",
  description: "",
  privacy: "Public",
  password: "",
  thumbnail: null,
};

export function useCreateRoom(onCreated: () => void) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "name") setErrors((prev) => ({ ...prev, name: undefined }));
    if (key === "password") setErrors((prev) => ({ ...prev, password: undefined }));
    // Reset password when switching from Private to Public
    if (key === "privacy" && value === "Public") {
      setForm((prev) => ({ ...prev, privacy: "Public" as FormState["privacy"], password: "" }));
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Room name is required";
    }
    if (form.privacy === "Private" && !form.password.trim()) {
      newErrors.password = "Password is required for private rooms";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
      formData.append("Topic", form.topic);
      if (form.description) formData.append("Description", form.description);
      formData.append("Privacy", form.privacy);
      if (form.privacy === "Private") {
        formData.append("Password", form.password);
      }
      if (form.thumbnail) {
        formData.append("Thumbnail", form.thumbnail);
      }

      await createRoom(formData);

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

  return { form, errors, isSubmitting, updateField, handleSubmit, resetForm };
}
