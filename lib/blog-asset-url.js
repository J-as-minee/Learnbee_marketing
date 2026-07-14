const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * Staging images are referenced as `/preview/blog/{slug}/images/...`. Markdown may
 * carry a stale prefix from another deploy (e.g. `/explore/preview/blog/...`).
 * Rewrites to match the current app's `NEXT_PUBLIC_BASE_PATH`.
 */
export function normalizePreviewBlogImageUrl(url) {
  const u = String(url || "").trim();
  if (!u.startsWith("/") || u.startsWith("//")) return u;
  const m = u.match(/^(.*?)(\/preview\/blog\/.+)$/);
  if (!m) return u;
  const inner = m[2];
  const base = BASE_PATH.replace(/\/$/, "");
  return base ? `${base}${inner}` : inner;
}
