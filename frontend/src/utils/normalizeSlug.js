// Normalize showcase slugs so navigation remains stable.
// Example: " Thineth Villa " -> "thineth-villa"
export function normalizeSlug(input) {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/_+/g, "-")
    .replace(/-+/g, "-");
}

