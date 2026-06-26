/**
 * Format a date string to a localized short date.
 * Returns "—" for null/undefined values.
 */
export function formatDate(value?: string | null): string {
  return value ? new Date(value).toLocaleDateString() : "—";
}

/**
 * Format a date string with day/month/year (e.g. "25 Apr 2026").
 * Returns "—" for null/undefined values.
 */
export function formatDateLong(value?: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format a date string with time (e.g. "4/25/2026, 10:23:30 AM").
 * Returns "—" for null/undefined values.
 */
export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}
