/**
 * Format a date string to a localized short date.
 * Returns "—" for null/undefined values.
 */
export function formatDate(value?: string | null): string {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Format a date string with day/month/year (e.g. "25 Apr 2026").
 * Returns "—" for null/undefined values.
 */
export function formatDateLong(value?: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("vi-VN", {
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

  const date = new Date(value);

  if (isNaN(date.getTime())) return "—";

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

export function formatAmount(amount: number) {
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  } catch {
    return `${amount} VND`;
  }
}

export function formatMonthYear(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${month}/${year}`;
}
