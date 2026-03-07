import { useState, useRef, useEffect } from "react";
import type {
  Post,
  TagItem,
  CreatePostPayload,
  UpdatePostPayload,
  ThumbnailImage,
} from "../types";
import CharCountInput from "./CharCountInput";
import ThumbnailGrid from "./ThumbnailGrid";
import PostEditor from "./PostEditor";
import SettingsSidebar from "./SettingsSidebar";
import { MOCK_TAGS } from "../constants";

type FormMode = "create" | "edit";

interface PostFormViewProps {
  mode: FormMode;
  initialPost?: Post | null;
  onSubmitCreate?: (payload: CreatePostPayload) => Promise<void>;
  onSubmitEdit?: (payload: Omit<UpdatePostPayload, "id">) => Promise<void>;
}

export default function PostFormView({
  mode,
  initialPost,
  onSubmitCreate,
  onSubmitEdit,
}: PostFormViewProps) {
  // Map post data or init empty strings
  const [title, setTitle] = useState(
    initialPost?.Title ||
      initialPost?.title ||
      (mode === "edit" ? "Untitled Post" : ""),
  );

  useEffect(() => {
    if (mode === "edit" && initialPost) {
      const initialTitle = initialPost.Title || initialPost.title;
      if (initialTitle) {
        setTitle(initialTitle);
      }
    }
  }, [mode, initialPost]);

  const [content, setContent] = useState(initialPost?.content || "");
  const [privacy, setPrivacy] = useState<"Public" | "FriendsOnly" | "Private">(
    (initialPost?.privacy as "Public" | "FriendsOnly" | "Private") || "Public",
  );

  const [publishDate, setPublishDate] = useState("");
  const [publishTime, setPublishTime] = useState("");
  const [community, setCommunity] = useState("English");

  const [tags] = useState<TagItem[]>(MOCK_TAGS);
  const [activeTagId, setActiveTagId] = useState<number | null>(null);

  const [thumbnails, setThumbnails] = useState<ThumbnailImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set existing media as readonly thumbnails in edit mode for context
  useEffect(() => {
    if (mode === "edit" && initialPost?.media) {
      setThumbnails(
        initialPost.media.map((m) => ({
          id: m.postMediaId,
          src: `https://api.catspeak.com.vn${m.mediaUrl}`,
          alt: "Existing media",
        })),
      );
    }
  }, [mode, initialPost]);

  const addFiles = (files: FileList | File[]) => {
    const newThumbnails = Array.from(files).map((file) => {
      const src = URL.createObjectURL(file);
      return {
        id: src,
        src,
        alt: file.name,
        file,
      };
    });
    setThumbnails((prev) => [...prev, ...newThumbnails]);
  };

  const deleteThumbnail = (id: string | number) => {
    setThumbnails((prev) => prev.filter((img) => img.id !== id));
  };

  const handleFileClick = () => fileInputRef.current?.click();

  const handlePublish = async () => {
    // 1. Validation
    if (!title.trim()) {
      alert("Post title is required!");
      return;
    }
    if (!content.trim()) {
      alert("Post content is required!");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "create" && onSubmitCreate) {
        await onSubmitCreate({
          Title: title,
          Content: content,
          Privacy: privacy,
          Files: thumbnails
            .map((t) => t.file)
            .filter((f): f is File => f !== undefined),
        });
      } else if (mode === "edit" && onSubmitEdit) {
        // Edit API currently doesn't accept files in the payload
        await onSubmitEdit({
          Title: title,
          Content: content,
          Privacy: privacy,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 items-start">
      {/* Left Column — Editor */}
      <div className="w-full xl:flex-1 space-y-6 p-6 bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-gray-900">Post title</h2>
          <CharCountInput
            value={title}
            onChange={setTitle}
            placeholder="Enter title"
            className="text-sm text-gray-800"
          />
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {/* Thumbnails */}
        {mode === "create" && (
          <ThumbnailGrid
            images={thumbnails}
            onDelete={deleteThumbnail}
            onUpload={handleFileClick}
          />
        )}

        {/* Media Readonly view for Edit mode */}
        {mode === "edit" && thumbnails.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-900 block">
              Existing Media
            </span>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {thumbnails.map((m) => (
                <img
                  key={m.id}
                  src={m.src}
                  alt="Post media"
                  className="h-32 rounded-lg object-cover shrink-0 border border-gray-100"
                />
              ))}
            </div>
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded px-3 mt-1">
              Note: Media updates are not currently supported in Edit mode.
            </p>
          </div>
        )}

        <div className="flex items-center justify-center relative py-4">
          <div className="absolute w-full h-px bg-gray-200" />
          <span className="relative bg-white px-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Post Content
          </span>
        </div>

        <PostEditor value={content} onChange={setContent} />
      </div>

      {/* Right Column — Settings */}
      <div className="flex flex-col gap-4 w-full xl:w-[320px] 2xl:w-[360px] shrink-0">
        <SettingsSidebar
          privacy={privacy}
          onPrivacyChange={setPrivacy}
          publishDate={publishDate}
          publishTime={publishTime}
          onPublishDateChange={setPublishDate}
          onPublishTimeChange={setPublishTime}
          community={community}
          onCommunityChange={setCommunity}
          tags={tags}
          activeTagId={activeTagId}
          onTagToggle={(id) =>
            setActiveTagId((prev) => (prev === id ? null : id))
          }
          onPublish={handlePublish}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
