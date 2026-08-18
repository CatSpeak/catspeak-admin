import { describe, expect, it } from "vitest";
import {
  toLocalScheduleEntry,
  toLocalSession,
  utcDateFromTick,
} from "./time";

const TZ = "Asia/Ho_Chi_Minh";

// .NET ticks for 2026-08-18T00:00:00.000Z
const TICKS_2026_08_18 = (Date.UTC(2026, 7, 18) + 62135596800000) * 10000;

describe("toLocalSession", () => {
  it("converts a same-day UTC session into viewer-local date and times", () => {
    const result = toLocalSession("2026-08-18", "19:00", "21:00", TZ);
    expect(result).toEqual({
      date: "2026-08-19",
      startTime: "02:00",
      endTime: "04:00",
    });
  });

  it("keeps the local date when UTC+0 and viewer timezone are the same", () => {
    const result = toLocalSession("2026-08-18", "19:00", "21:00", "UTC");
    expect(result).toEqual({
      date: "2026-08-18",
      startTime: "19:00",
      endTime: "21:00",
    });
  });

  it("handles overnight sessions (end time <= start time in UTC)", () => {
    const result = toLocalSession("2026-08-18", "22:00", "01:00", TZ);
    expect(result).toEqual({
      date: "2026-08-19",
      startTime: "05:00",
      endTime: "08:00",
    });
  });
});

describe("toLocalScheduleEntry", () => {
  it("anchors a recurring entry to the class start date before converting", () => {
    // 2026-08-18 is a Tuesday. First Monday on/after it is 2026-08-24.
    const result = toLocalScheduleEntry(
      "Monday",
      "19:00",
      "21:00",
      TICKS_2026_08_18,
      TZ,
    );
    expect(result).toEqual({
      dayKey: "TUE",
      startTime: "02:00",
      endTime: "04:00",
    });
  });

  it("converts an entry occurring on the same date as the anchor week", () => {
    // 2026-08-18 is a Tuesday → entry lands on the anchor day itself.
    const result = toLocalScheduleEntry(
      "Tuesday",
      "08:30",
      "10:00",
      TICKS_2026_08_18,
      TZ,
    );
    expect(result).toEqual({
      dayKey: "TUE",
      startTime: "15:30",
      endTime: "17:00",
    });
  });
});

describe("utcDateFromTick", () => {
  it("converts .NET ticks to the matching UTC instant", () => {
    const d = utcDateFromTick(TICKS_2026_08_18);
    expect(d.getUTCFullYear()).toBe(2026);
    expect(d.getUTCMonth()).toBe(7);
    expect(d.getUTCDate()).toBe(18);
  });
});