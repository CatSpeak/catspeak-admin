import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../../../lib/axios";
import { useToastStore } from "../../../stores/toastStore";
import { editRoom } from "../api/roomApi";
import type { Room, RequiredLevel, RoomPrivacy, RoomTopic } from "../types";

interface EditFormState {
  name: string;
  privacy: RoomPrivacy;
  requiredLevel: RequiredLevel | "";
  topics: RoomTopic[];
  password: string;
  description: string;
}

interface EditFormErrors {
  name?: string;
  password?: string;
}

function parseTopics(room: Room): RoomTopic[] {
  // topic can be a comma-separated string like "Culture,Productivity"
  if (!room.topic) return [];
  return room.topic
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean) as RoomTopic[];
}

function buildInitialState(room: Room): EditFormState {
  return {
    name: room.name,
    privacy: room.privacy,
    requiredLevel: room.requiredLevel || "",
    topics: parseTopics(room),
    password: "",
    description: room.description || "",
  };
}


export function useEditRoom(room: Room | null, onEdited: () => void) {
  const [form, setForm] = useState<EditFormState>({
    name: "",
    privacy: "Public",
    requiredLevel: "",
    topics: [],
    password: "",
    description: "",
  });
  const [errors, setErrors] = useState<EditFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  // Sync form when the target room changes
  useEffect(() => {
    if (room) {
      setForm(buildInitialState(room));
      setErrors({});
    }
  }, [room]);

  const updateField = useCallback(<K extends keyof EditFormState>(key: K, value: EditFormState[K]) => {
    if (key === "name") setErrors((prev) => ({ ...prev, name: undefined }));
    if (key === "password") setErrors((prev) => ({ ...prev, password: undefined }));
    // Reset password when switching from Private to Public
    if (key === "privacy" && value === "Public") {
      setForm((prev) => ({ ...prev, privacy: "Public" as EditFormState["privacy"], password: "" }));
      return;
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  /** Toggle a topic in the multi-select array */
  const toggleTopic = useCallback((topic: RoomTopic) => {
    setForm((prev) => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter((t) => t !== topic)
        : [...prev.topics, topic],
    }));
  }, []);

  // Detect if any field changed from the original room
  const hasChanges = useMemo(() => {
    if (!room) return false;
    const initial = buildInitialState(room);
    return (
      form.name !== initial.name ||
      form.privacy !== initial.privacy ||
      form.requiredLevel !== initial.requiredLevel ||
      form.description !== initial.description ||
      form.password !== initial.password ||
      JSON.stringify(form.topics) !== JSON.stringify(initial.topics)
    );
  }, [form, room]);

  const handleSubmit = useCallback(async () => {
    if (!room) return;

    const newErrors: EditFormErrors = {};
    if (!form.name.trim()) {
      newErrors.name = "Room name is required";
    }
    // Password is required only when switching Public → Private
    const switchingToPrivate = form.privacy === "Private" && room.privacy === "Public";
    if (switchingToPrivate && !form.password.trim()) {
      newErrors.password = "Password is required when switching to private";
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
      formData.append("Privacy", form.privacy);
      if (form.requiredLevel) formData.append("RequiredLevel", form.requiredLevel);
      if (form.description.trim()) formData.append("Description", form.description.trim());
      // Topics — append each entry separately for array binding
      form.topics.forEach((t) => formData.append("Topics", t));
      if (form.password) {
        formData.append("Password", form.password);
      }

      await editRoom(room.roomId, formData);
      addToast("success", "Room updated successfully.");
      onEdited();
    } catch (err: unknown) {
      addToast("error", getApiErrorMessage(err, "Failed to update room."));
    } finally {
      setIsSubmitting(false);
    }
  }, [form, room, onEdited, addToast]);

  const resetForm = useCallback(() => {
    if (room) {
      setForm(buildInitialState(room));
    }
    setErrors({});
  }, [room]);

  return { form, errors, isSubmitting, hasChanges, updateField, toggleTopic, handleSubmit, resetForm };
}
