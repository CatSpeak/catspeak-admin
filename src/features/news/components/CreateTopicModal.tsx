import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { useLanguage } from "../../../stores/languageStore";
import { generateSlug } from "../../../lib/slug";
import { getTopics } from "../api/getTopics";
import { createTopic } from "../api/createTopic";
import { getApiErrorMessage } from "../../../lib/axios";
import type { Topic, LanguageCommunityNumber } from "../types";

interface CreateTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (topic: Topic) => void;
}

export default function CreateTopicModal({
  isOpen,
  onClose,
  onCreated,
}: CreateTopicModalProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [languageCommunity, setLanguageCommunity] =
    useState<LanguageCommunityNumber>(0);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setSlug("");
      setLanguageCommunity(0);
      setIsCheckingSlug(false);
      setIsSubmitting(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTitleBlur = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setSlug("");
      return;
    }

    const baseSlug = generateSlug(trimmedTitle);
    if (!baseSlug) {
      setSlug("");
      return;
    }

    setIsCheckingSlug(true);
    setError(null);

    try {
      const res = await getTopics({ keyword: trimmedTitle, pageSize: 50 });
      const existing = res?.data || [];
      const duplicateMatches = existing.filter(
        (item) =>
          item.slug === baseSlug || item.slug.startsWith(`${baseSlug}-`),
      );

      if (duplicateMatches.length > 0) {
        setSlug(`${baseSlug}-${duplicateMatches.length + 1}`);
      } else {
        setSlug(baseSlug);
      }
    } catch {
      setSlug(baseSlug);
    } finally {
      setIsCheckingSlug(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError(t.news.enterHashtagName || "Vui lòng nhập tên hashtag.");
      return;
    }

    const finalSlug = slug || generateSlug(trimmedTitle);
    if (!finalSlug) {
      setError("Slug không hợp lệ.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const created = await createTopic({
        title: trimmedTitle,
        slug: finalSlug,
        languageCommunity,
      });
      onCreated(created);
      onClose();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Không thể tạo hashtag mới."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const languageOptions: { label: string; value: LanguageCommunityNumber }[] = [
    { label: t.common.all || "Tất cả", value: 0 },
    { label: t.room?.languages?.English || "Tiếng Anh", value: 1 },
    { label: t.room?.languages?.Chinese || "Tiếng Trung", value: 2 },
    { label: t.room?.languages?.Japanese || "Tiếng Nhật", value: 3 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            {t.news.createNewHashtag || "Tạo hashtag mới"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl">
              {error}
            </div>
          )}

          {/* Hashtag Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">
              {t.news.hashtagName || "Tên hashtag"}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder={t.news.enterHashtagName || "Nhập tên hashtag"}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all shadow-xs"
              autoFocus
            />
            <p className="text-[11px] text-gray-400">
              {t.news.enterHashtagName || "Nhập tên hashtag"}
            </p>
          </div>

          {/* Slug Input (Auto Generated & Disabled) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">
              Slug
            </label>
            {isCheckingSlug ? (
              <div className="w-full h-10 bg-gray-100 animate-pulse rounded-xl border border-gray-200" />
            ) : (
              <input
                type="text"
                value={slug}
                disabled={true}
                placeholder="slug-se-tu-dong-sinh"
                className="w-full px-3.5 py-2.5 bg-gray-100/80 border border-gray-200 rounded-xl text-sm font-mono text-gray-600 placeholder:text-gray-400 cursor-not-allowed select-none"
              />
            )}
            <p className="text-[11px] text-gray-400 leading-normal">
              {t.news.slugAutoGeneratedHint ||
                "Được tạo tự động từ tên hashtag (không dấu, viết thường, cách nhau bằng dấu -)"}
            </p>
          </div>

          {/* Language Community Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 block">
              {t.news.languageCommunity || "Cộng đồng ngôn ngữ"}
            </label>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map((opt) => {
                const isSelected = languageCommunity === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setLanguageCommunity(opt.value)}
                    className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "border-2 border-primary bg-red-50/50 text-primary font-bold shadow-xs ring-1 ring-primary/20"
                        : "border border-gray-200 bg-white text-gray-700 font-medium hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <Check size={13} className="ml-1 text-primary stroke-[2.5]" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-gray-400">
              {t.news.newHashtagAddedHint ||
                "Hashtag mới sẽ được thêm vào danh sách để chọn cho bài viết."}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-colors cursor-pointer text-center"
            >
              {t.common.cancel || "Hủy"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCheckingSlug || !title.trim()}
              className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-center shadow-xs"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t.common.loading || "Đang tạo..."}</span>
                </span>
              ) : (
                t.news.createHashtag || "Tạo hashtag"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
