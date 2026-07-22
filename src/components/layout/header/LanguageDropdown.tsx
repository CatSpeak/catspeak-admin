import React, { useState, useRef, useEffect } from "react";
import { useLanguage, type Language } from "../../../stores/languageStore";

interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { code: "vi", name: "Tiếng Việt", flag: "/flags/vn.svg" },
  { code: "zh", name: "中文", flag: "/flags/cn.svg" },
  { code: "en", name: "English", flag: "/flags/en.svg" },
];

export const LanguageDropdown: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang =
    languages.find((item) => item.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="lg:block" ref={dropdownRef}>
      <div className="relative flex items-center justify-center">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={currentLang.name}
          title={currentLang.name}
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-0 bg-transparent p-0 transition-colors hover:ring-4 hover:ring-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cath-red-800/40 cursor-pointer"
          tabIndex={0}
        >
          <img
            alt={currentLang.name}
            className="pointer-events-none block h-full w-full object-cover scale-130"
            draggable={false}
            src={currentLang.flag}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 min-w-[220px] max-w-[min(280px,calc(100vw-2rem))]">
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
              <div
                className="p-2 flex flex-col gap-1"
                role="listbox"
                aria-label="Language"
              >
                {languages.map((item) => {
                  const isSelected = language === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setLanguage(item.code);
                        setIsOpen(false);
                      }}
                      className={`relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors cursor-pointer ${
                        isSelected
                          ? "text-cath-red-800 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 rounded-xl bg-gray-500/5 pointer-events-none" />
                      )}
                      <span className="flex h-7 w-7 shrink-0 overflow-hidden rounded-full border border-gray-100">
                        <img
                          alt={item.name}
                          className="block h-full w-full object-cover"
                          draggable={false}
                          src={item.flag}
                        />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[14px]">
                        {item.name}
                      </span>
                      <div
                        className={`ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[2px] ${
                          isSelected ? "border-cath-red-800" : "border-gray-200"
                        }`}
                      >
                        {isSelected && (
                          <div className="h-2 w-2 rounded-full bg-cath-red-800" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
