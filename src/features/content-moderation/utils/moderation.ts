import type { BadgeType } from "../../../components/ui/Badge"
import type {
  AiAction,
  ContentKind,
  Decision,
  ModerationLogDetail,
  ModerationLogItem,
  ModerationLogQuery,
  ReviewStatus,
} from "../types"

/**
 * 7 nơi có kiểm duyệt, gom theo context mà hệ thống ghi. "meet-chat" gồm cả "chat"
 * (tên cũ). Bình luận reel tách riêng vì không thuộc 7 nơi ban đầu.
 */
export const PLACE_CONTEXTS = {
  ragChat: ["rag-chat"],
  direct: ["chat-1-1"],
  meet: ["meet-chat", "chat"],
  reelCaption: ["reel-title", "reel-description"],
  post: ["post-title", "post-content", "post-comment", "post-image"],
  reelMedia: ["reel-video", "reel-cover"],
  story: ["story"],
  reelComment: ["reel-comment"],
} as const satisfies Record<string, readonly string[]>

export type PlaceKey = keyof typeof PLACE_CONTEXTS

export const PLACE_KEYS = Object.keys(PLACE_CONTEXTS) as PlaceKey[]

export const placeOfContext = (context: string): PlaceKey | null => {
  for (const key of PLACE_KEYS) {
    if ((PLACE_CONTEXTS[key] as readonly string[]).includes(context)) return key
  }
  return null
}

/** Nhãn đúng cho vòng train sau — cùng bộ nhãn với model. */
export const HUMAN_LABELS: Record<ContentKind, string[]> = {
  text: ["CLEAN", "OFFENSIVE", "HATE"],
  image: ["normal", "nsfw"],
  video: ["normal", "nsfw", "OFFENSIVE", "HATE"],
}

export const CLEAN_LABEL: Record<ContentKind, string> = {
  text: "CLEAN",
  image: "normal",
  video: "normal",
}

/** Nhãn điền sẵn: AI sai thì nhãn sạch, AI đúng thì giữ nhãn AI đã gán. */
export const defaultHumanLabel = (
  decision: Decision,
  kind: ContentKind,
  violatedLabel?: string | null,
): string => {
  if (decision === "allowed") return CLEAN_LABEL[kind]
  if (violatedLabel && HUMAN_LABELS[kind].includes(violatedLabel)) return violatedLabel
  return ""
}

export const statusBadgeType = (status: ReviewStatus): BadgeType => {
  switch (status) {
    case "pending":
      return "Orange"
    case "allowed":
      return "Green"
    case "confirmed":
      return "Blue"
    case "removed":
      return "Red"
    default:
      return "Gray"
  }
}

export const actionBadgeType = (action: AiAction): BadgeType =>
  action === "block" ? "Red" : "Yellow"

export const formatScore = (score: number): string => `${Math.round(score * 100)}%`

export const formatRate = (rate?: number | null): string =>
  rate === null || rate === undefined ? "—" : `${Math.round(rate * 1000) / 10}%`

/** Reel đang bị giữ lại chờ admin: chỉ còn hai lựa chọn là đăng hoặc từ chối. */
export const isHeldReel = (detail?: ModerationLogDetail | null): boolean =>
  detail?.target?.type === "reel" &&
  (detail.target.status === "PendingReview" || detail.target.status === "Moderating")

/** Quyết định nào cần hỏi lại trước khi làm (không hoàn tác được). */
export const needsConfirmation = (decision: Decision, userAction: string): boolean =>
  decision === "removed" || userAction === "lock"

/** Video/ảnh bìa reel có thể đang giữ reel lại nên phải duyệt từng ca. */
export const canBulkConfirm = (item: Pick<ModerationLogItem, "reviewStatus" | "context">): boolean =>
  item.reviewStatus === "pending" &&
  !(PLACE_CONTEXTS.reelMedia as readonly string[]).includes(item.context)

/** Gộp số ca chờ duyệt theo từng nơi. */
export const pendingByPlace = (byContext: Record<string, number> = {}): Record<PlaceKey, number> => {
  const out = Object.fromEntries(PLACE_KEYS.map((k) => [k, 0])) as Record<PlaceKey, number>
  for (const [context, n] of Object.entries(byContext)) {
    const place = placeOfContext(context)
    if (place) out[place] += n
  }
  return out
}

/** Bộ lọc trên trang; đổi sang tham số API bằng toQuery. */
export interface ModerationFilters {
  status: "pending" | "resolved" | "all"
  place: PlaceKey | null
  contentKind?: ContentKind
  action?: AiAction
  accountId?: number
  q: string
  sort: "newest" | "oldest" | "score"
}

export const DEFAULT_FILTERS: ModerationFilters = {
  status: "pending",
  place: null,
  q: "",
  sort: "newest",
}

export const hasExtraFilters = (f: ModerationFilters): boolean =>
  f.place !== null || !!f.contentKind || !!f.action || !!f.accountId || !!f.q.trim() || f.sort !== "newest"

export const toQuery = (f: ModerationFilters, page: number, pageSize: number): ModerationLogQuery => ({
  status: f.status,
  context: f.place ? [...PLACE_CONTEXTS[f.place]] : undefined,
  contentKind: f.contentKind,
  action: f.action,
  accountId: f.accountId,
  q: f.q.trim() || undefined,
  sort: f.sort,
  page,
  pageSize,
})

/** Điền biến vào chuỗi dịch: fmt("Ca #{id}", { id: 5 }) → "Ca #5". */
export const fmt = (template: string, vars: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (m, key: string) => (key in vars ? String(vars[key]) : m))
