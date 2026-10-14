import { describe, expect, it } from "vitest"
import { translations } from "../../i18n"
import { PLACE_KEYS } from "./utils/moderation"

// Ngôn ngữ được ép kiểu theo bản tiếng Việt nên thiếu khóa không báo lỗi lúc build.
const keysOf = (value: unknown, prefix = ""): string[] => {
  if (!value || typeof value !== "object") return [prefix]
  return Object.entries(value as Record<string, unknown>)
    .flatMap(([k, v]) => keysOf(v, prefix ? `${prefix}.${k}` : k))
    .sort()
}

describe("bản dịch trang Kiểm duyệt AI", () => {
  const vi = keysOf(translations.vi.contentModeration)

  it.each(["en", "zh"] as const)("%s có đủ khóa như tiếng Việt", (lang) => {
    expect(keysOf(translations[lang].contentModeration)).toEqual(vi)
    expect(translations[lang].nav.contentModeration).toBeTruthy()
  })

  it("mỗi nơi kiểm duyệt đều có tên", () => {
    for (const key of PLACE_KEYS) {
      expect(translations.vi.contentModeration.places[key]).toBeTruthy()
    }
  })
})
