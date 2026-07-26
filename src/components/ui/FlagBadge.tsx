import React from "react";
import { useLanguage } from "../../stores/languageStore";
import { LANGUAGE_FLAGS } from "../../features/room/constants";
import type { LanguageType } from "../../features/room/types";

export type FlagBadgeLanguage =
  | LanguageType
  | "all"
  | "others"
  | "All"
  | "Others"
  | (string & {});

export interface FlagBadgeProps {
  /** The language or filter type to display ("Chinese" | "English" | "Vietnamese" | "all" | "others") */
  languageType?: FlagBadgeLanguage | string;
  /** Alias for languageType */
  language?: FlagBadgeLanguage | string;
  /** Alias for languageType */
  type?: FlagBadgeLanguage | string;
  /** Alias for languageType */
  value?: FlagBadgeLanguage | string;
  /** Additional root container class names */
  className?: string;
  /** Additional image class names */
  imgClassName?: string;
  /** Whether to show the text label alongside the flag (default: true) */
  showLabel?: boolean;
}

const GLOBE_FLAG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563EB' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'/><path d='M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20'/><path d='M2 12h20'/></svg>";

const OTHERS_FLAG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'/><path d='M12 8v4'/><path d='M12 16h.01'/></svg>";

export const FlagBadge: React.FC<FlagBadgeProps> = ({
  languageType,
  language,
  type,
  value,
  className = "",
  imgClassName = "",
  showLabel = true,
}) => {
  const { t } = useLanguage();

  const target = languageType || language || type || value || "all";
  const normalized = String(target).toLowerCase();

  let flag = "";
  let label = String(target);

  if (normalized === "all") {
    flag = GLOBE_FLAG;
    label = t.common?.all || "All";
  } else if (normalized === "others" || normalized === "other") {
    flag = OTHERS_FLAG;
    label =
      t.room?.categories?.Other ||
      t.common?.others ||
      t.common?.other ||
      "Others";
  } else if (target in LANGUAGE_FLAGS) {
    const key = target as LanguageType;
    flag = LANGUAGE_FLAGS[key];
    label = t.room?.languages?.[key] || key;
  } else {
    const matchedKey = (Object.keys(LANGUAGE_FLAGS) as LanguageType[]).find(
      (k) => k.toLowerCase() === normalized,
    );
    if (matchedKey) {
      flag = LANGUAGE_FLAGS[matchedKey];
      label = t.room?.languages?.[matchedKey] || matchedKey;
    } else {
      flag = OTHERS_FLAG;
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap ${className}`.trim()}
    >
      {flag && (
        <img
          src={flag}
          alt={label}
          className={`w-4 h-3.5 rounded-sm shadow-sm object-cover ${imgClassName}`.trim()}
        />
      )}
      {showLabel && <span>{label}</span>}
    </span>
  );
};

export default FlagBadge;
