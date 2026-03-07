import { useCallback, useState } from "react";
import type { ThumbnailImage, TagItem, PostStatus } from "../types";
import { MOCK_TAGS } from "../constants";
import { createPost } from "../api/createPost";

export interface CreatePostForm {
  title: string;
  content: string;
  caption: string;
  community: string;
  status: PostStatus;
  privacy: "Public" | "FriendsOnly" | "Private";
  publishDate: string;
  publishTime: string;
}

const INITIAL_FORM: CreatePostForm = {
  title: "",
  content: "",
  caption: "",
  community: "English",
  status: "draft",
  privacy: "Public",
  publishDate: "",
  publishTime: "",
};

/**
 * Manages all local state for the Create Post editor.
 */
export function useCreatePost() {
  const [form, setForm] = useState<CreatePostForm>(INITIAL_FORM);
  const [thumbnails, setThumbnails] = useState<ThumbnailImage[]>([]);
  const [tags, setTags] = useState<TagItem[]>(MOCK_TAGS);
  const [activeTagId, setActiveTagId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback(
    <K extends keyof CreatePostForm>(field: K, value: CreatePostForm[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const deleteThumbnail = useCallback((id: string | number) => {
    setThumbnails((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const addFiles = useCallback((files: FileList | File[]) => {
    const newThumbnails = Array.from(files).map((file) => {
      const src = URL.createObjectURL(file);
      return {
        id: src, // use object URL as temp ID
        src,
        alt: file.name,
        file,
      };
    });
    setThumbnails((prev) => [...prev, ...newThumbnails]);
  }, []);

  const toggleTag = useCallback((id: number) => {
    setActiveTagId((prev) => (prev === id ? null : id));
  }, []);

  // const handleSaveDraft = useCallback(() => {
  //   console.log("Save draft:", { form, thumbnails, activeTagId });
  // }, [form, thumbnails, activeTagId]);

  const handlePublish = useCallback(async () => {
    if (!form.title.trim()) {
      alert("Post title is required!");
      return;
    }
    if (!form.content.trim()) {
      alert("Post content is required!");
      return;
    }
    setIsSubmitting(true);
    try {
      await createPost({
        Title: form.title,
        Content: form.content,
        Privacy: form.privacy,
        Files: thumbnails.map(t => t.file).filter((f): f is File => f !== undefined),
      });
      // Reset form
      setForm(INITIAL_FORM);
      setThumbnails([]);
      alert("Post published successfully!");
    } catch (err) {
      console.error("Failed to publish post:", err);
      alert("Failed to publish post.");
    } finally {
      setIsSubmitting(false);
    }
  }, [form, thumbnails]);

  return {
    form,
    updateField,
    thumbnails,
    deleteThumbnail,
    addFiles,
    tags,
    setTags,
    activeTagId,
    toggleTag,
    // handleSaveDraft,
    handlePublish,
    isSubmitting,
  };
}
