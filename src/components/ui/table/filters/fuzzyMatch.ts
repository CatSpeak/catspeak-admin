/** Lowercases and strips diacritics so "café" ~ "cafe", "É" ~ "e", etc. */
export function normalizeText(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/** Classic edit-distance, short-circuited once it exceeds `threshold`. */
export function levenshteinWithin(
  a: string,
  b: string,
  threshold: number,
): boolean {
  if (Math.abs(a.length - b.length) > threshold) return false;
  if (a === b) return true;

  let prevRow = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const currRow = [i];
    let rowMin = currRow[0];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const val = Math.min(
        prevRow[j] + 1, // deletion
        currRow[j - 1] + 1, // insertion
        prevRow[j - 1] + cost, // substitution
      );
      currRow.push(val);
      if (val < rowMin) rowMin = val;
    }
    if (rowMin > threshold) return false; // whole row exceeded threshold
    prevRow = currRow;
  }
  return prevRow[b.length] <= threshold;
}

/**
 * Approximate ("fuzzy") match: exact substring matches always pass; on a
 * miss, falls back to a small edit-distance check per word so minor typos
 * ("jhon" → "john", "adres" → "address") still match.
 *
 * Numbers are excluded from the fuzzy fallback: edit-distance tolerance
 * doesn't make sense for identifiers/counts (searching "123" should not
 * also surface id 124), so numeric values only ever match by substring.
 */
export function approximateIncludes(
  haystack: unknown,
  needle: string,
): boolean {
  const h = normalizeText(haystack);
  const n = normalizeText(needle);
  if (!n) return true;
  if (!h) return false;
  if (h.includes(n)) return true;

  const isNumeric =
    typeof haystack === "number" ||
    (haystack !== "" && !isNaN(Number(haystack)));
  if (isNumeric) return false;

  const threshold = n.length <= 4 ? 1 : n.length <= 8 ? 2 : 3;
  return h
    .split(/\s+/)
    .filter(Boolean)
    .some((word) => levenshteinWithin(word, n, threshold));
}
