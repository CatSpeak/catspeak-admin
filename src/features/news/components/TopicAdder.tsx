import { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, Plus } from "lucide-react";
import { useLanguage } from "../../../stores/languageStore";
import { getTopics } from "../api/getTopics";
import type { Topic } from "../types";

interface TopicAdderProps {
  selectedTopics: Topic[];
  onSelectTopic: (topic: Topic) => void;
  onOpenCreateModal: () => void;
}

export default function TopicAdder({
  selectedTopics,
  onSelectTopic,
  onOpenCreateModal,
}: TopicAdderProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm("");
    }
  }, [isOpen]);

  // Fetch 5 nearest topics based on search keyword
  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    const fetchTopics = async () => {
      setLoading(true);
      try {
        const res = await getTopics({
          keyword: searchTerm.trim() || undefined,
          pageSize: 5,
        });
        if (active && res?.data) {
          setTopics(res.data);
        }
      } catch {
        if (active) {
          setTopics([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(fetchTopics, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isOpen, searchTerm]);

  const getLanguageLabel = (lang: number | string) => {
    if (lang === 0 || lang === "All" || lang === "all") return t.common.all || "All";
    if (lang === 1 || lang === "English" || lang === "Eng")
      return t.room?.languages?.English || "Tiếng Anh";
    if (lang === 2 || lang === "Chinese")
      return t.room?.languages?.Chinese || "Tiếng Trung";
    if (lang === 3 || lang === "Japanese")
      return t.room?.languages?.Japanese || "Tiếng Nhật";
    return String(lang);
  };

  const handleSelect = (topic: Topic) => {
    onSelectTopic(topic);
    setIsOpen(false);
  };

  const handleCreateNewClick = () => {
    setIsOpen(false);
    onOpenCreateModal();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Group */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-all cursor-pointer shadow-xs select-none"
      >
        <div className="flex items-center justify-center px-3.5 py-2.5 text-gray-500 font-bold text-sm border-r border-gray-100 bg-gray-50/60 rounded-l-xl">
          #
        </div>
        <div className="flex-1 px-3 text-xs font-medium text-gray-400">
          {t.news.addHashtag || "Thêm hashtag"}
        </div>
        <div className="pr-3 text-gray-400">
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Dropdown Menu (Matching design screenshot 2) */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1.5 z-40 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fadeIn">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 border border-gray-200/80 rounded-lg">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.news.searchHashtag || "Tìm kiếm hashtag..."}
                className="w-full bg-transparent text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Topics List */}
          <div className="max-h-52 overflow-y-auto py-1">
            {loading ? (
              <div className="p-4 flex flex-col items-center justify-center gap-2 text-gray-400 text-xs">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span>{t.common.loading || "Đang tìm..."}</span>
              </div>
            ) : topics.length > 0 ? (
              topics.map((topic) => {
                const isSelected = selectedTopics.some(
                  (st) => st.topicId === topic.topicId,
                );
                return (
                  <div
                    key={topic.topicId}
                    onClick={() => handleSelect(topic)}
                    className={`flex items-center justify-between px-3.5 py-2 hover:bg-gray-50 transition-colors cursor-pointer ${
                      isSelected ? "bg-red-50/40 opacity-75" : ""
                    }`}
                  >
                    <span className="text-xs font-semibold text-gray-800 truncate">
                      #{topic.title}
                    </span>
                    <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
                      {getLanguageLabel(topic.languageCommunity)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-4 text-center text-xs text-gray-400">
                {t.common.noData || "Không tìm thấy hashtag nào"}
              </div>
            )}
          </div>

          {/* Bottom Action: Create new hashtag */}
          <div className="border-t border-gray-100 p-1 bg-gray-50/40">
            <button
              type="button"
              onClick={handleCreateNewClick}
              className="w-full flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-primary hover:bg-red-50/60 rounded-lg transition-colors cursor-pointer text-left"
            >
              <Plus size={14} className="stroke-[2.5]" />
              <span>{t.news.createNewHashtag || "Tạo hashtag mới"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
