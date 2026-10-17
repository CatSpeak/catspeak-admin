import { describe, it, expect } from "vitest";
import { isTopicMatchingCommunity } from "./constants";

describe("isTopicMatchingCommunity", () => {
  describe("when topic belongs to All community", () => {
    it("matches any post community when topic language is 0", () => {
      expect(isTopicMatchingCommunity(0, "All")).toBe(true);
      expect(isTopicMatchingCommunity(0, "English")).toBe(true);
      expect(isTopicMatchingCommunity(0, "Chinese")).toBe(true);
      expect(isTopicMatchingCommunity(0, "Japanese")).toBe(true);
    });

    it("matches any post community when topic language is 'All' or 'all'", () => {
      expect(isTopicMatchingCommunity("All", "English")).toBe(true);
      expect(isTopicMatchingCommunity("all", "Chinese")).toBe(true);
    });

    it("matches any post community when topic language is null or undefined", () => {
      expect(isTopicMatchingCommunity(null, "English")).toBe(true);
      expect(isTopicMatchingCommunity(undefined, "Japanese")).toBe(true);
    });
  });

  describe("when topic belongs to a specific community", () => {
    it("handles English topics correctly", () => {
      // English topic does not match post with community All
      expect(isTopicMatchingCommunity(1, "All")).toBe(false);
      // Matches English post
      expect(isTopicMatchingCommunity(1, "English")).toBe(true);
      expect(isTopicMatchingCommunity("English", "English")).toBe(true);
      expect(isTopicMatchingCommunity("Eng", "English")).toBe(true);
      // Does not match other languages
      expect(isTopicMatchingCommunity(1, "Chinese")).toBe(false);
      expect(isTopicMatchingCommunity(1, "Japanese")).toBe(false);
    });

    it("handles Chinese topics correctly", () => {
      expect(isTopicMatchingCommunity(2, "All")).toBe(false);
      expect(isTopicMatchingCommunity(2, "English")).toBe(false);
      expect(isTopicMatchingCommunity(2, "Chinese")).toBe(true);
      expect(isTopicMatchingCommunity("Chinese", "Chinese")).toBe(true);
      expect(isTopicMatchingCommunity(2, "Japanese")).toBe(false);
    });

    it("handles Japanese topics correctly", () => {
      expect(isTopicMatchingCommunity(3, "All")).toBe(false);
      expect(isTopicMatchingCommunity(3, "English")).toBe(false);
      expect(isTopicMatchingCommunity(3, "Chinese")).toBe(false);
      expect(isTopicMatchingCommunity(3, "Japanese")).toBe(true);
      expect(isTopicMatchingCommunity("Japanese", "Japanese")).toBe(true);
    });
  });
});
