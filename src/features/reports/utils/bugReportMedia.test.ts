import { describe, expect, it } from "vitest";
import {
  isVideoUrl,
  parseBugReportMedia,
} from "./bugReportMedia";

// Phase 1 feedback loop (red-capable): drives the exact user symptom —
// "Báo cáo lỗi không hiển thị video hay ảnh user upload".
// One command: npx vitest run src/features/reports/utils/bugReportMedia.test.ts
describe("bugReportMedia feedback loop", () => {
  const IMG_1 = "https://cdn.catspeak.com/bug-reports/a1.png";
  const IMG_2 = "https://cdn.catspeak.com/bug-reports/a2.jpg?token=abc";
  const VID_1 = "https://cdn.catspeak.com/bug-reports/v1.mp4";

  it("parses JSON-string screenshots sonst images still show", () => {
    const raw = JSON.stringify([IMG_1, IMG_2]);
    const { images, videos } = parseBugReportMedia(raw);
    expect(images).toEqual([IMG_1, IMG_2]);
    expect(videos).toEqual([]);
  });

  it("splits mixed image+video attachments so videos are playable", () => {
    const raw = JSON.stringify([IMG_1, VID_1, IMG_2]);
    const { images, videos } = parseBugReportMedia(raw);
    // Exact symptom: video must NOT be rendered as <img>.
    expect(videos).toEqual([VID_1]);
    expect(images).toEqual([IMG_1, IMG_2]);
  });

  it("detects video by extension, query string, and data URI", () => {
    expect(isVideoUrl(VID_1)).toBe(true);
    expect(isVideoUrl(IMG_1)).toBe(false);
    expect(isVideoUrl("https://cdn/x.webm?token=abc")).toBe(true);
    expect(isVideoUrl("data:video/mp4;base64,AAAA")).toBe(true);
    expect(isVideoUrl("data:image/png;base64,AAAA")).toBe(false);
  });

  it("tolerates single URL, already-array payloads, and trims/dedups", () => {
    expect(parseBugReportMedia(VID_1).videos).toEqual([VID_1]);
    expect(
      parseBugReportMedia([IMG_1, ` ${IMG_1} `, "", null] as unknown as string[])
        .images,
    ).toEqual([IMG_1]);
    expect(parseBugReportMedia(null).images).toEqual([]);
    expect(parseBugReportMedia("").videos).toEqual([]);
  });
});
