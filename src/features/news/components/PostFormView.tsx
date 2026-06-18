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
  onSubmitEdit?: (
    payload: Omit<UpdatePostPayload, "id"> & { Files?: File[] },
  ) => Promise<void>;
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
      if (initialPost.languageCommunity) {
        setCommunity(initialPost.languageCommunity as "All" | "English" | "Chinese");
      }
    }
  }, [mode, initialPost]);

  const [content, setContent] = useState(initialPost?.content || "");
  const [privacy, setPrivacy] = useState<"Public" | "FriendsOnly" | "Private">(
    (initialPost?.privacy as "Public" | "FriendsOnly" | "Private") || "Public",
  );

  const [publishDate, setPublishDate] = useState("");
  const [publishTime, setPublishTime] = useState("");
  const [community, setCommunity] = useState<"All" | "English" | "Chinese">(
    (initialPost?.languageCommunity as "All" | "English" | "Chinese") || "All"
  );

  const [tags] = useState<TagItem[]>(MOCK_TAGS);
  const [activeTagId, setActiveTagId] = useState<number | null>(null);

  const [thumbnails, setThumbnails] = useState<ThumbnailImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<Set<string>>(new Set());

  const revokeObjectUrl = (url: string) => {
    if (objectUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      objectUrlsRef.current.delete(url);
    }
  };

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.clear();
    };
  }, []);

  useEffect(() => {
    if (mode === "edit" && initialPost?.media) {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
      setThumbnails(
        initialPost.media.map((m) => ({
          id: m.postMediaId,
          src: m.mediaUrl,
          alt: "Existing media",
        })),
      );
    }
  }, [mode, initialPost]);

  const addFiles = (files: FileList | File[]) => {
    const newThumbnails = Array.from(files).map((file) => {
      const src = URL.createObjectURL(file);
      objectUrlsRef.current.add(src);
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
    setThumbnails((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) {
        revokeObjectUrl(target.src);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleFileClick = () => fileInputRef.current?.click();

  const handlePublish = async () => {
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
      const newFiles = thumbnails
        .map((t) => t.file)
        .filter((f): f is File => f !== undefined);

      if (mode === "create" && onSubmitCreate) {
        await onSubmitCreate({
          Title: title,
          Content: content,
          Privacy: privacy,
          LanguageCommunity: community,
          Files: newFiles,
        });
      } else if (mode === "edit" && onSubmitEdit) {
        await onSubmitEdit({
          Title: title,
          Content: content,
          Privacy: privacy,
          LanguageCommunity: community,
          Files: newFiles.length > 0 ? newFiles : undefined,
        } as Omit<UpdatePostPayload, "id"> & { Files?: File[] });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 items-start animate-slideUp">
      {/* Left Column — Editor */}
      <div className="w-full xl:flex-1 space-y-4 p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
        {/* Title Editor */}
        <div className="pt-2">
          <CharCountInput
            value={title}
            onChange={setTitle}
            placeholder="Enter a post title..."
            maxLength={100}
            className="text-2xl font-extrabold text-gray-900 border-none pb-0"
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

        {/* Thumbnails Manager */}
        <div className="border-t border-gray-50 pt-6">
          <ThumbnailGrid
            images={thumbnails}
            onDelete={deleteThumbnail}
            onUpload={handleFileClick}
          />
        </div>

        {/* Edit mode Tip Note */}
        {mode === "edit" && (
          <div className="p-3.5 bg-amber-50/40 border border-amber-100/60 rounded-xl flex items-start gap-2.5 text-xs text-amber-700">
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 shrink-0 font-bold text-[9px] uppercase tracking-wider">
              Note
            </span>
            <p className="font-medium leading-relaxed">
              Adding new media will upload it on save. Removing existing media visually updates your draft but will only take effect on the server once changes are submitted.
            </p>
          </div>
        )}

        {/* Editor Body */}
        <div className="border-t border-gray-100 pt-6">
          <div className="flex flex-col gap-1 mb-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Article Content
            </label>
            <span className="text-xs text-gray-400">
              Format your text and embed rich elements using the editor
            </span>
          </div>
          <div className="overflow-hidden">
            <PostEditor value={content} onChange={setContent} />
          </div>
        </div>
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
