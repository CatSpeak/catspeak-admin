import { useCallback, useState } from "react";
import type { ThumbnailImage, TagItem, PostStatus } from "../types";
import { MOCK_THUMBNAILS, MOCK_TAGS } from "../constants";

export interface CreatePostForm {
  title: string;
  content: string;
  caption: string;
  community: string;
  status: PostStatus;
  publishDate: string;
  publishTime: string;
}

const INITIAL_FORM: CreatePostForm = {
  title: "",
  content: "",
  caption: "",
  community: "English",
  status: "draft",
  publishDate: "",
  publishTime: "",
};

/**
 * Manages all local state for the Create Post editor.
 * When the backend is ready, replace the submit handler to call `createPost()`.
 */
export function useCreatePost() {
  const [form, setForm] = useState<CreatePostForm>(INITIAL_FORM);
  const [thumbnails, setThumbnails] = useState<ThumbnailImage[]>(MOCK_THUMBNAILS);
  const [tags, setTags] = useState<TagItem[]>(MOCK_TAGS);
  const [activeTagId, setActiveTagId] = useState<number | null>(null);

  const updateField = useCallback(
    <K extends keyof CreatePostForm>(field: K, value: CreatePostForm[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const deleteThumbnail = useCallback((id: number) => {
    setThumbnails((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const toggleTag = useCallback((id: number) => {
    setActiveTagId((prev) => (prev === id ? null : id));
  }, []);

  /**
   * TODO: Connect to `createPost()` API when backend is ready.
   * Build CreatePostPayload from form + tags + thumbnails here.
   */
  const handleSaveDraft = useCallback(() => {
    console.log("Save draft:", { form, thumbnails, activeTagId });
  }, [form, thumbnails, activeTagId]);

  const handlePublish = useCallback(() => {
    console.log("Publish:", { form, thumbnails, activeTagId });
  }, [form, thumbnails, activeTagId]);

  return {
    form,
    updateField,
    thumbnails,
    deleteThumbnail,
    tags,
    setTags,
    activeTagId,
    toggleTag,
    handleSaveDraft,
    handlePublish,
  };
}
