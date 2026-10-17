// Dữ liệu trang "Kiểm duyệt AI" — khớp với DTO của admin-service (/api/content-moderation).

export type ReviewStatus = "pending" | "allowed" | "confirmed" | "removed"
export type Decision = Exclude<ReviewStatus, "pending">
export type UserAction = "none" | "warn" | "lock"
export type ContentKind = "text" | "image" | "video"
export type AiAction = "review" | "block"

export interface ModerationAccount {
  accountId: number
  username?: string | null
  nickname?: string | null
  avatarUrl?: string | null
  status: number
}

export interface ModerationReveal {
  viewerId: number
  createdAt: string
  reason?: string | null
}

export interface ModerationLogItem {
  id: number
  createdAt: string
  context: string
  contentKind: ContentKind
  action: AiAction
  score: number
  violatedLabel?: string | null
  modelName?: string | null
  accountId?: number | null
  targetType?: string | null
  targetId?: number | null
  mediaKey?: string | null
  isPrivate: boolean
  revealed: boolean
  /** Thứ nên hiển thị: nguyên văn nếu công khai, bản che ★ nếu riêng tư. */
  text?: string | null
  maskedText?: string | null
  /** null với ca riêng tư chưa bấm "Xem nguyên văn". */
  originalText?: string | null
  reviewStatus: ReviewStatus
  humanLabel?: string | null
  userAction?: UserAction | null
  decidedBy?: number | null
  decidedAt?: string | null
  decisionNote?: string | null
  revealCount: number
  reveals?: ModerationReveal[] | null
  account?: ModerationAccount | null
}

export interface ModerationTarget {
  type: string
  id: number
  exists: boolean
  matched: boolean
  title?: string | null
  content?: string | null
  status?: string | null
  parentId?: number | null
  createdAt?: string | null
}

export interface ModerationLogDetail extends ModerationLogItem {
  target?: ModerationTarget | null
  mediaUrl?: string | null
  coverUrl?: string | null
  mediaQuarantined: boolean
}

export interface ModerationLogPage {
  total: number
  page: number
  pageSize: number
  items: ModerationLogItem[]
}

export interface ModerationStats {
  days: number
  pendingTotal: number
  pendingByContext: Record<string, number>
  total: number
  byAction: Record<string, number>
  byStatus: Record<string, number>
  byContext: Record<string, number>
  falsePositiveRate?: number | null
}

export interface ModerationUserHistory {
  accountId: number
  total: number
  blocks: number
  reviews: number
  confirmed: number
  allowed: number
  warns: number
  locks: number
  firstAt?: string | null
  lastAt?: string | null
  recent: ModerationLogItem[]
  account?: ModerationAccount | null
}

export interface ModerationLogQuery {
  status: "pending" | "resolved" | "all" | Decision
  context?: string[]
  contentKind?: ContentKind
  action?: AiAction
  accountId?: number
  q?: string
  sort?: "newest" | "oldest" | "score"
  page: number
  pageSize: number
}

export interface DecisionRequest {
  status: Decision
  userAction: UserAction
  humanLabel?: string
  note?: string
  warningMessage?: string
  override?: boolean
}

export interface DecisionResponse {
  log?: ModerationLogDetail | null
  applied: string[]
  cascadedIds: number[]
  warnings: string[]
}

export interface BulkConfirmResponse {
  updatedIds: number[]
  skipped: number
}
