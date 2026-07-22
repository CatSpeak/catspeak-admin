import vi from "./vi";
import en from "./en";
import zh from "./zh";

export type Language = "vi" | "zh" | "en";

export const translations = {
  vi,
  en,
  zh,
};

export const languageNames: Record<Language, string> = {
  vi: "Tiếng Việt",
  zh: "中文",
  en: "English",
};
