import { describe, expect, it } from "vitest"
import {
  DEFAULT_FILTERS,
  PLACE_CONTEXTS,
  PLACE_KEYS,
  canBulkConfirm,
  hasExtraFilters,
  toQuery,
  defaultHumanLabel,
  fmt,
  formatRate,
  formatScore,
  isHeldReel,
  needsConfirmation,
  pendingByPlace,
  placeOfContext,
} from "./moderation"
import type { ModerationLogDetail } from "../types"

describe("nơi kiểm duyệt", () => {
  it("mỗi context thuộc đúng một nơi", () => {
    const all = PLACE_KEYS.flatMap((k) => [...PLACE_CONTEXTS[k]])
    expect(new Set(all).size).toBe(all.length)
  })

  it("chat tên cũ gộp vào chat phòng meet", () => {
    expect(placeOfContext("chat")).toBe("meet")
    expect(placeOfContext("rag-chat")).toBe("ragChat")
    expect(placeOfContext("khong-ton-tai")).toBeNull()
  })
})

describe("nhãn điền sẵn", () => {
  it("cho phép thì nhãn sạch theo loại nội dung", () => {
    expect(defaultHumanLabel("allowed", "text", "HATE")).toBe("CLEAN")
    expect(defaultHumanLabel("allowed", "video", "nsfw")).toBe("normal")
  })

  it("xác nhận thì giữ nhãn AI nếu hợp lệ", () => {
    expect(defaultHumanLabel("confirmed", "text", "OFFENSIVE")).toBe("OFFENSIVE")
    expect(defaultHumanLabel("removed", "video", "HATE")).toBe("HATE")
    expect(defaultHumanLabel("removed", "text", "nsfw")).toBe("")
    expect(defaultHumanLabel("confirmed", "image", null)).toBe("")
  })
})

describe("hiển thị", () => {
  it("điểm và tỷ lệ", () => {
    expect(formatScore(0.974)).toBe("97%")
    expect(formatRate(0.1234)).toBe("12.3%")
    expect(formatRate(null)).toBe("—")
  })

  it("reel đang giữ", () => {
    const base = { target: { type: "reel", id: 1, exists: true, matched: false, status: "PendingReview" } }
    expect(isHeldReel(base as unknown as ModerationLogDetail)).toBe(true)
    expect(isHeldReel({ target: { ...base.target, status: "Public" } } as unknown as ModerationLogDetail)).toBe(false)
    expect(isHeldReel(null)).toBe(false)
  })

  it("hỏi lại trước khi gỡ hoặc khóa", () => {
    expect(needsConfirmation("removed", "none")).toBe(true)
    expect(needsConfirmation("confirmed", "lock")).toBe(true)
    expect(needsConfirmation("confirmed", "warn")).toBe(false)
    expect(needsConfirmation("allowed", "none")).toBe(false)
  })

  it("điền biến vào chuỗi dịch", () => {
    expect(fmt("Ca #{id} lúc {time}", { id: 5, time: "10:00" })).toBe("Ca #5 lúc 10:00")
    expect(fmt("Còn {missing}", {})).toBe("Còn {missing}")
  })
})

describe("xác nhận hàng loạt", () => {
  it("chỉ ca chờ duyệt và không phải media reel", () => {
    expect(canBulkConfirm({ reviewStatus: "pending", context: "chat-1-1" })).toBe(true)
    expect(canBulkConfirm({ reviewStatus: "pending", context: "reel-video" })).toBe(false)
    expect(canBulkConfirm({ reviewStatus: "pending", context: "reel-cover" })).toBe(false)
    expect(canBulkConfirm({ reviewStatus: "allowed", context: "story" })).toBe(false)
  })

  it("bộ lọc sang tham số API", () => {
    expect(toQuery(DEFAULT_FILTERS, 1, 20)).toEqual({
      status: "pending", context: undefined, contentKind: undefined, action: undefined,
      accountId: undefined, q: undefined, sort: "newest", page: 1, pageSize: 20,
    })
    const q = toQuery({ ...DEFAULT_FILTERS, place: "meet", q: "  abc ", accountId: 7 }, 2, 10)
    expect(q.context).toEqual(["meet-chat", "chat"])
    expect(q.q).toBe("abc")
    expect(q.accountId).toBe(7)
    expect(hasExtraFilters(DEFAULT_FILTERS)).toBe(false)
    expect(hasExtraFilters({ ...DEFAULT_FILTERS, sort: "score" })).toBe(true)
  })

  it("gộp số chờ duyệt theo nơi", () => {
    const counts = pendingByPlace({ chat: 2, "meet-chat": 3, "post-title": 1, "post-image": 1, unknown: 9 })
    expect(counts.meet).toBe(5)
    expect(counts.post).toBe(2)
    expect(counts.ragChat).toBe(0)
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(7)
  })
})
