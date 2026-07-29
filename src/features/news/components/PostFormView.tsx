import { useState, useRef, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import { generateSlug } from "../../../lib/slug";
import { getApiErrorMessage } from "../../../lib/axios";
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
import { useLanguage } from "../../../stores/languageStore";

type FormMode = "create" | "edit";

interface PostFormViewProps {
  mode: FormMode;
  initialPost?: Post | null;
  onSubmitCreate?: (payload: CreatePostPayload) => Promise<void>;
  onSubmitEdit?: (
    payload: Omit<UpdatePostPayload, "id"> & { Files?: File[] },
  ) => Promise<void>;
  onSlugError?: (message: string | null) => void;
  slugError?: string | null;
}

export default function PostFormView({
  mode,
  initialPost,
  onSubmitCreate,
  onSubmitEdit,
  onSlugError,
  slugError,
}: PostFormViewProps) {
  const { t } = useLanguage();
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
      if (initialPost.slug) {
        setSlug(initialPost.slug);
        setSlugEdited(false);
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
  const [deletedMediaIds, setDeletedMediaIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Slug state
  const [slug, setSlug] = useState(
    mode === "edit" ? (initialPost?.slug || "") : ""
  );
  const [slugEdited, setSlugEdited] = useState(false);

  // Auto-generate slug from title when title changes
  useEffect(() => {
    if (mode === "create") {
      if (!slugEdited) {
        setSlug(generateSlug(title));
      }
    } else if (mode === "edit" && initialPost) {
      const initialTitle = initialPost.Title || initialPost.title || "";
      if (!slugEdited && title !== initialTitle) {
        setSlug(generateSlug(title));
      }
    }
  }, [title, slugEdited, mode, initialPost]);

  const handleSlugChange = (value: string) => {
    if (value === "") {
      setSlugEdited(false);
    } else {
      setSlugEdited(true);
    }
    setSlug(value);
    setSubmitError(null);
    if (onSlugError) onSlugError(null);
  };

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
      setDeletedMediaIds([]);
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
    if (typeof id === "number") {
      setDeletedMediaIds((prev) => [...prev, id]);
    } else if (
      typeof id === "string" &&
      !id.startsWith("blob:") &&
      !isNaN(Number(id))
    ) {
      setDeletedMediaIds((prev) => [...prev, Number(id)]);
    }

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
      alert(t.news.postTitleRequired);
      return;
    }
    if (!content.trim()) {
      alert(t.news.postContentRequired);
      return;
    }

    setSubmitError(null);
    if (onSlugError) onSlugError(null);
    setIsSubmitting(true);

    try {
      const newFiles = thumbnails
        .map((t) => t.file)
        .filter((f): f is File => f !== undefined);

      if (mode === "create" && onSubmitCreate) {
        const payload = {
          Title: title,
          Content: content,
          Privacy: privacy,
          Slug: slug || undefined,
          LanguageCommunity: community,
          Files: newFiles,
        };
        console.log("[PostFormView] Create payload:", {
          Title: payload.Title,
          Slug: payload.Slug,
          SlugLength: payload.Slug?.length,
        });
        await onSubmitCreate(payload);
      } else if (mode === "edit" && onSubmitEdit) {
        await onSubmitEdit({
          Title: title,
          Content: content,
          Privacy: privacy,
          Slug: slug || undefined,
          LanguageCommunity: community,
          Files: newFiles.length > 0 ? newFiles : undefined,
          DeletedMediaIds:
            deletedMediaIds.length > 0 ? deletedMediaIds : undefined,
        });
      }
    } catch (err) {
      const message = getApiErrorMessage(err, t.news.failedToPublish);
      setSubmitError(message);
      if (onSlugError) onSlugError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeError = submitError || slugError;

  return (
    <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 items-start animate-slideUp">
      {/* Left Column — Editor */}
      <div className="w-full xl:flex-1 space-y-4 p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
        {/* Submit / API Error Banner */}
        {activeError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-sm text-red-700 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <h4 className="font-semibold text-red-800">
                {t.common.error || "Error"}
              </h4>
              <div className="whitespace-pre-line text-red-600 font-medium text-xs sm:text-sm">
                {activeError}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSubmitError(null);
                if (onSlugError) onSlugError(null);
              }}
              className="text-red-400 hover:text-red-600 transition-colors"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Title Editor */}
        <div className="pt-2">
          <CharCountInput
            value={title}
            onChange={setTitle}
            placeholder={t.news.enterTitlePlaceholder}
            maxLength={100}
            className="text-2xl font-extrabold text-gray-900 border-none pb-0"
          />
        </div>

        {/* Slug field */}
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-gray-900">{t.news.postSlug}</h2>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder={t.news.autoGeneratedSlug}
            className="w-full border-b border-gray-200 pb-2 focus:outline-none focus:border-primary bg-transparent placeholder:text-gray-400 text-sm text-gray-800"
          />
          <p className="text-xs text-gray-400">/news/{slug || "..."}</p>
          <p className="text-xs text-gray-400">
            {slugEdited ? t.news.customSlug : t.news.suggestedSlug}
          </p>
          {slugError && (
            <p className="text-xs text-red-500">{slugError}</p>
          )}
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
              {t.news.editModeNote}
            </span>
            <p className="font-medium leading-relaxed">
              {t.news.editModeNoteText}
            </p>
          </div>
        )}

        {/* Editor Body */}
        <div className="border-t border-gray-100 pt-6">
          <div className="flex flex-col gap-1 mb-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {t.news.articleContent}
            </label>
            <span className="text-xs text-gray-400">
              {t.news.articleContentDesc}
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
