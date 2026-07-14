import fs from "node:fs";
import path from "node:path";

/** Roots searched for post images (live first, then staging). */
export const BLOG_IMAGE_ROOTS = {
  live: path.join(process.cwd(), "content", "blog-clean"),
  staging: path.join(process.cwd(), "content", "blog-staging"),
};

const MIME_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

/**
 * Decode a catch-all image path from the URL. Rejects traversal segments.
 */
export function decodeBlogImageSegments(imagePath) {
  const raw = Array.isArray(imagePath) ? imagePath.join("/") : String(imagePath || "");
  return raw
    .split("/")
    .filter(Boolean)
    .map((seg) => {
      try {
        return decodeURIComponent(seg);
      } catch {
        return seg;
      }
    })
    .filter((seg) => seg !== ".." && seg !== ".");
}

function findCaseInsensitiveFile(dir, filename) {
  if (!fs.existsSync(dir)) return null;

  const direct = path.join(dir, filename);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) {
    return direct;
  }

  const target = filename.toLowerCase();
  for (const entry of fs.readdirSync(dir)) {
    if (entry.toLowerCase() === target) {
      const candidate = path.join(dir, entry);
      if (fs.statSync(candidate).isFile()) return candidate;
    }
  }

  return null;
}

/**
 * Resolve a blog image on disk. Returns { filePath, contentType } or null.
 */
export function resolveBlogImageFile(slug, imagePath, { preview = false } = {}) {
  const segments = decodeBlogImageSegments(imagePath);
  if (!segments.length) return null;

  const filename = segments.join("/");
  const searchOrder = preview
    ? [BLOG_IMAGE_ROOTS.staging, BLOG_IMAGE_ROOTS.live]
    : [BLOG_IMAGE_ROOTS.live, BLOG_IMAGE_ROOTS.staging];

  for (const root of searchOrder) {
    const imagesDir = path.join(root, slug, "images");
    const filePath = findCaseInsensitiveFile(imagesDir, filename);
    if (!filePath) continue;

    const ext = path.extname(filePath).toLowerCase();
    return {
      filePath,
      contentType: MIME_TYPES[ext] || "application/octet-stream",
    };
  }

  return null;
}
