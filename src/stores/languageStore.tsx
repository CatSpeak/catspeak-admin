import React, { createContext, useContext, useMemo, useState } from "react";
import { translations, languageNames, type Language } from "../i18n";

export type { Language };

export const getLangFromStorage = (): Language => {
  if (typeof window === "undefined") return "vi";
  try {
    const saved = localStorage.getItem("lang") as Language | null;
    if (saved && (saved === "vi" || saved === "en" || saved === "zh")) {
      return saved;
    }
  } catch (error) {
    console.error("Error reading lang from localStorage", error);
  }
  return "vi";
};

export const setLangToStorage = (lang: Language): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("lang", lang);
  } catch (error) {
    console.error("Error setting lang to localStorage", error);
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: typeof translations.vi;
  languageName: string;
  getLangFromStorage: () => Language;
  setLangToStorage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(() => getLangFromStorage());

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setLangToStorage(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => {
      const nextLang: Record<Language, Language> = {
        vi: "en",
        en: "zh",
        zh: "vi",
      };
      const next = nextLang[prev] || "vi";
      setLangToStorage(next);
      return next;
    });
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: translations[language] as typeof translations.vi,
      languageName: languageNames[language],
      getLangFromStorage,
      setLangToStorage,
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
