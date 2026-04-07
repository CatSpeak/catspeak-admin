// ── Calendar Constants ──

/** Map known hex colors to Tailwind class sets. Falls back to neutral gray. */
const HEX_COLOR_MAP: Record<
  string,
  { bg: string; text: string; dot: string; border: string }
> = {
  "#FF6B6B": { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", border: "border-l-red-500" },
  "#FF0000": { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", border: "border-l-red-500" },
  "#4ECDC4": { bg: "bg-teal-100", text: "text-teal-700", dot: "bg-teal-500", border: "border-l-teal-500" },
  "#4CAF50": { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-l-emerald-500" },
  "#2196F3": { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500", border: "border-l-blue-500" },
  "#3F51B5": { bg: "bg-indigo-100", text: "text-indigo-700", dot: "bg-indigo-500", border: "border-l-indigo-500" },
  "#9C27B0": { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500", border: "border-l-purple-500" },
  "#FF9800": { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500", border: "border-l-orange-500" },
  "#FFC107": { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500", border: "border-l-amber-500" },
  "#E91E63": { bg: "bg-pink-100", text: "text-pink-700", dot: "bg-pink-500", border: "border-l-pink-500" },
};

const FALLBACK_CLASSES = {
  bg: "bg-gray-100",
  text: "text-gray-700",
  dot: "bg-gray-500",
  border: "border-l-gray-500",
};

export function getColorClasses(hex: string | undefined) {
  if (!hex) return FALLBACK_CLASSES;
  return HEX_COLOR_MAP[hex.toUpperCase()] ?? FALLBACK_CLASSES;
}

export function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

export function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** Format an ISO string to a short time like "10:00 AM" */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("default", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/** Format an ISO date to readable date string */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("default", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Produce an ISO date string (YYYY-MM-DDT00:00:00Z) for API queries */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}T00:00:00Z`;
}
