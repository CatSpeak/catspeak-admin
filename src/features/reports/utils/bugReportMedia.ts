/**
 * Shared media helper for bug reports.
 *
 * The `screenshots` column historically stores a JSON-stringified array of
 * attachment URLs (images). Users can now also upload videos, which are stored
 * in the same payload. Every attachment used to be rendered as `<img>`, so
 * videos showed up as broken images (or nothing at all).
 *
 * This module centralises two things that used to be inlined (and duplicated)
 * in `BugReportDetailPage` / `BugReportDetailDialog`:
 *  1. tolerant parsing of the raw payload (JSON array string, single URL,
 *     already-decoded array from a jsonb column, null/empty), and
 *  2. splitting attachments into playable videos vs. viewable images.
 */

export interface BugReportMedia {
  images: string[]
  videos: string[]
  /** All attachments, images first, then videos. */
  all: string[]
}

const VIDEO_EXTENSIONS = [
  ".mp4",
  ".webm",
  ".ogg",
  ".ogv",
  ".mov",
  ".m4v",
  ".avi",
  ".mkv",
]

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0

/**
 * True when the URL points to a video attachment.
 * Handles query strings / hashes (`clip.mp4?token=...`), case-insensitive
 * extensions, and `data:video/...` URIs.
 */
export const isVideoUrl = (url: unknown): boolean => {
  if (!isNonEmptyString(url)) return false
  const trimmed = url.trim()
  if (trimmed.toLowerCase().startsWith("data:video/")) return true
  if (trimmed.toLowerCase().startsWith("data:")) return false
  const withoutQuery = trimmed.split(/[?#]/, 1)[0]?.toLowerCase() ?? ""
  return VIDEO_EXTENSIONS.some((ext) => withoutQuery.endsWith(ext))
}

const dedupe = (urls: string[]): string[] => {
  const seen = new Set<string>()
  const out: string[] = []
  for (const url of urls) {
    const trimmed = url.trim()
    if (trimmed.length === 0 || seen.has(trimmed)) continue
    seen.add(trimmed)
    out.push(trimmed)
  }
  return out
}

const toStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter(isNonEmptyString)
  }
  if (!isNonEmptyString(value)) return []
  const trimmed = value.trim()
  try {
    const parsed: unknown = JSON.parse(trimmed)
    if (Array.isArray(parsed)) return parsed.filter(isNonEmptyString)
    if (isNonEmptyString(parsed)) return [parsed.trim()]
    return []
  } catch {
    // Not JSON: accept a bare URL / data URI, reject anything else.
    if (/^(https?:\/\/|blob:|data:)/i.test(trimmed)) return [trimmed]
    return []
  }
}

/**
 * Parse the raw `screenshots` payload into separated image / video lists.
 * Accepts a JSON array string, a single URL string, an already-decoded array,
 * null, or undefined — never throws.
 */
export const parseBugReportMedia = (raw: unknown): BugReportMedia => {
  const urls = dedupe(toStringList(raw))
  const videos = urls.filter(isVideoUrl)
  const images = urls.filter((url) => !isVideoUrl(url))
  return { images, videos, all: [...images, ...videos] }
}
