import slugify from "slugify";
import { transliterate } from "transliteration";

/**
 * Generate SEO-friendly slug for multi-language input.
 *
 * Strategy:
 * - Transliterate ALL text to Latin where possible
 * - Then run slugify for clean output
 *
 * This avoids branching logic and ensures consistency.
 */
export const generateSlug = (title: string): string => {
  if (!title) return "";

  const normalized = title.trim();

  // Step 1: transliterate (CJK, Cyrillic, Arabic -> Latin where possible)
  const latinText = transliterate(normalized);

  // Step 2: slugify final result
  return slugify(latinText, {
    lower: true,
    strict: true,
  });
};