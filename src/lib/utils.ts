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

/**
 * Format any date input (ISO string, YYYY-MM-DD, DD/MM/YYYY, or Date)
 * to "DD/MM/YYYY" format for UI presentation.
 * Returns "" if input is empty or invalid.
 */
export function formatDateToDisplay(value?: string | Date | null): string {
  if (!value) return "";
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return "";
    const dd = String(value.getDate()).padStart(2, "0");
    const mm = String(value.getMonth() + 1).padStart(2, "0");
    const yyyy = value.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  const trimmed = value.trim();
  if (!trimmed) return "";

  // Already DD/MM/YYYY
  const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, d, m, y] = ddmmyyyyMatch;
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }

  // YYYY-MM-DD or ISO string
  const yyyymmddMatch = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (yyyymmddMatch) {
    const [, y, m, d] = yyyymmddMatch;
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }

  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return "";
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Convert any date string (e.g. "DD/MM/YYYY", "YYYY-MM-DD", ISO)
 * to "YYYY-MM-DD" format for binding to native <input type="date">.
 */
export function parseDateToIsoDate(value?: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  // DD/MM/YYYY or DD-MM-YYYY
  const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, d, m, y] = ddmmyyyyMatch;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // YYYY-MM-DD
  const yyyymmddMatch = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (yyyymmddMatch) {
    const [, y, m, d] = yyyymmddMatch;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return undefined;
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Convert any date format (dd/mm/yyyy, YYYY-MM-DD, ISO string)
 * to an ISO 8601 UTC string representing the start of that day (00:00:00.000Z).
 * Ensures backend ASP.NET / EF Core / PostgreSQL parses it as DateTimeKind.Utc.
 */
export function formatDateToUtcStartOfDay(
  value?: string | null,
): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  // DD/MM/YYYY or DD-MM-YYYY
  const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, d, m, y] = ddmmyyyyMatch;
    const day = d.padStart(2, "0");
    const month = m.padStart(2, "0");
    return `${y}-${month}-${day}T00:00:00.000Z`;
  }

  // YYYY-MM-DD
  const yyyymmddMatch = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (yyyymmddMatch) {
    const [, y, m, d] = yyyymmddMatch;
    const day = d.padStart(2, "0");
    const month = m.padStart(2, "0");
    return `${y}-${month}-${day}T00:00:00.000Z`;
  }

  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) return undefined;
  return new Date(
    Date.UTC(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  ).toISOString();
}

/**
 * Convert any date format (dd/mm/yyyy, YYYY-MM-DD, ISO string)
 * to an ISO 8601 UTC string representing the end of that day (23:59:59.999Z).
 * Ensures backend ASP.NET / EF Core / PostgreSQL parses it as DateTimeKind.Utc
 * and includes all records created throughout that entire day.
 */
export function formatDateToUtcEndOfDay(
  value?: string | null,
): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  // DD/MM/YYYY or DD-MM-YYYY
  const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, d, m, y] = ddmmyyyyMatch;
    const day = d.padStart(2, "0");
    const month = m.padStart(2, "0");
    return `${y}-${month}-${day}T23:59:59.999Z`;
  }

  // YYYY-MM-DD
  const yyyymmddMatch = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (yyyymmddMatch) {
    const [, y, m, d] = yyyymmddMatch;
    const day = d.padStart(2, "0");
    const month = m.padStart(2, "0");
    return `${y}-${month}-${day}T23:59:59.999Z`;
  }

  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) return undefined;
  return new Date(
    Date.UTC(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  ).toISOString();
}


