import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Fuse from "fuse.js";
import { Search, X } from "lucide-react";

interface SearchItem {
  title: string;
  url: string;
}

const searchData: SearchItem[] = [
  { title: "Dashboard", url: "/" },
  { title: "Platform Overview", url: "/?tab=platform-overview" },
  { title: "Payment Claims", url: "/?tab=payments-and-claims" },
  { title: "Analytics", url: "/?tab=analytics" },
  { title: "User", url: "/users" },
  { title: "Staff", url: "/staffs" },
  { title: "Plan", url: "/plans" },
  { title: "News", url: "/news" },
  { title: "Calendar", url: "/calendar" },
  { title: "Room", url: "/rooms" },
  { title: "Reels", url: "/reels" },
  { title: "Challenges", url: "/reels" },
  { title: "Instructor Applications", url: "/instructor-applications" },
  { title: "Letter Reports", url: "/reports" },
  { title: "Payment Reports", url: "/payments" },
];

const fuseOptions = {
  keys: ["title"],
  threshold: 0.4,
};

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [isOpenMobileModal, setIsOpenMobileModal] = useState(false);

  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const fuse = useRef(new Fuse(searchData, fuseOptions));

  // 1. Xử lý Fuzzy Search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const searchResults = fuse.current.search(query);
    const top5 = searchResults.slice(0, 5).map((result) => result.item);
    setResults(top5);
  }, [query]);

  // 2. Phím tắt Ctrl + K / Cmd + K
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();

        // Nếu ở màn hình mobile (check qua window.innerWidth) thì mở modal, ngược lại focus input desktop
        if (window.innerWidth < 768) {
          setIsOpenMobileModal(true);
        } else {
          inputRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 3. Tự động focus vào input trong modal khi modal mobile mở
  useEffect(() => {
    if (isOpenMobileModal) {
      setTimeout(() => mobileInputRef.current?.focus(), 50);
    }
  }, [isOpenMobileModal]);

  // 4. Click out để đóng dropdown trên Desktop
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (url: string) => {
    navigate(url);
    setQuery("");
    setIsOpenDropdown(false);
    setIsOpenMobileModal(false); // Đóng luôn modal mobile nếu đang mở
  };

  // Reusable Results Component để dùng chung cho cả Desktop và Mobile
  const RenderResults = () => (
    <>
      {results.length > 0 && (
        <ul className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-stroke bg-white p-2 shadow-lg dark:border-strokedark dark:bg-boxdark">
          {results.map((item, index) => (
            <li
              key={index}
              onClick={() => handleItemClick(item.url)}
              className="flex items-center justify-between px-4 py-2 text-sm text-black dark:text-white rounded hover:bg-gray-100 dark:hover:bg-meta-4 cursor-pointer transition-colors"
            >
              <span className="font-medium">{item.title}</span>
            </li>
          ))}
        </ul>
      )}
      {query.trim() !== "" && results.length === 0 && (
        <div className="mt-2 rounded-lg border border-stroke bg-white p-4 text-center text-sm text-gray-500 shadow-lg dark:border-strokedark dark:bg-boxdark">
          No results found for "{query}"
        </div>
      )}
    </>
  );

  return (
    <div className="w-full mx-5">
      {/* ================= GIAO DIỆN DESKTOP (md trở lên) ================= */}
      <div ref={searchRef} className="hidden md:block relative w-full max-w-xl">
        <div className="relative flex items-center w-full">
          <span className="absolute left-4 text-gray-400 pointer-events-none z-10">
            <Search size={18} />
          </span>
          <input
            ref={inputRef}
            type="search"
            placeholder="Type to search ..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpenDropdown(true);
            }}
            onFocus={() => setIsOpenDropdown(true)}
            className="w-full bg-transparent pl-11 pr-16 py-2 text-sm font-medium focus:outline-none border border-gray-200 rounded-lg focus:border-primary dark:border-strokedark"
          />
          {/* Badge gợi ý phím tắt nằm gọn bên phải ô input */}
          <span className="absolute right-3 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 border border-gray-300 rounded bg-gray-50 pointer-events-none dark:bg-slate-800 dark:border-slate-700">
            Ctrl K
          </span>
        </div>

        {/* Dropdown kết quả trên Desktop */}
        {isOpenDropdown && (
          <div className="absolute left-0 right-0 z-50">
            <RenderResults />
          </div>
        )}
      </div>

      {/* ================= GIAO DIỆN MOBILE (< md) ================= */}
      <div className="block md:hidden text-right">
        {/* Nút kính lúp kích hoạt kích thước rút gọn */}
        <button
          onClick={() => setIsOpenMobileModal(true)}
          className="p-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white focus:outline-none"
          aria-label="Open Search"
        >
          <Search size={22} />
        </button>

        {/* Dialog / Modal tìm kiếm full-screen di động */}
        {isOpenMobileModal && (
          <div className="fixed inset-0 z-[999] bg-white dark:bg-boxdark p-4 flex flex-col animate-fade-in">
            {/* Thanh Header của Modal */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 flex items-center">
                <Search size={18} className="absolute left-3 text-gray-400" />
                <input
                  ref={mobileInputRef}
                  type="search"
                  placeholder="Type to search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-meta-4 pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none border-none rounded-lg"
                />
              </div>
              {/* Nút đóng đóng Modal */}
              <button
                onClick={() => {
                  setIsOpenMobileModal(false);
                  setQuery("");
                }}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-meta-4 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Vùng hiển thị kết quả search trên Mobile */}
            <div className="flex-1 overflow-y-auto text-left">
              <RenderResults />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
