import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getPostMarkdownViaGitHub } from "@/lib/github-blog-read";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import rehypeBsharpCta from "@/lib/rehype-bsharp-cta";
import { parseShowContactForm } from "@/lib/blog-lead";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

const BLOG_DIRS = {
  live: path.join(process.cwd(), "content", "blog-clean"),
  staging: path.join(process.cwd(), "content", "blog-staging"),
};

const BLOG_ROUTE_PREFIX = {
  live: `${BASE_PATH}/blog`,
  staging: `${BASE_PATH}/blog`,
};

const VALID_PRODUCTS = ["learnbee"];

function resolveSource(source) {
  return source === "staging" ? "staging" : "live";
}

function getBlogDir(source = "live") {
  return BLOG_DIRS[resolveSource(source)];
}

function getRoutePrefix(source = "live") {
  return BLOG_ROUTE_PREFIX[resolveSource(source)];
}

/** Map legacy `/blog/...` paths to `${BASE_PATH}/blog/...` when BASE_PATH is set. */
function legacyBlogPathToExplore(pathValue) {
  const p = String(pathValue || "").trim();
  if (!p) return p;
  const prefixedRoot = BASE_PATH ? `${BASE_PATH}/blog` : "/blog";
  if (p.startsWith(`${prefixedRoot}/`) || p === prefixedRoot) return p;
  if (p === "/blog") return prefixedRoot;
  if (p.startsWith("/blog/")) {
    return `${prefixedRoot}${p.slice("/blog".length)}`;
  }
  return p;
}

/**
 * After remark/rehype, markdown often still has hardcoded `/blog/...` image URLs.
 * Rewrite to `${BASE_PATH}/blog/...` without double-prefixing the target root.
 *
 * Legacy staging assets may still use `/preview/blog/...` (and `${BASE_PATH}/preview/blog/...`). Those paths
 * contain a `/blog/` substring; naive replace would turn `.../preview/blog/...` into
 * `.../preview/explore/blog/...` when BASE_PATH is `/explore`, breaking CTA backgrounds etc.
 */
function rewriteLegacyBlogUrlsInHtml(html) {
  if (!html) return html;
  const prefixedRoot = BASE_PATH ? `${BASE_PATH}/blog` : "/blog";
  const prefixedSlash = `${prefixedRoot}/`;
  const placeholder = "@@BSHARP_TMP_BLOG_PREFIX@@";
  const previewHold = "@@BSHARP_PREVIEW_BLOG_URL_";
  const held = [];

  let s = String(html);
  s = s.replace(/\/(?:[\w.%+-]+\/)*preview\/blog\/[\w./%-]+/gi, (m) => {
    const i = held.length;
    held.push(m);
    return `${previewHold}${i}@@`;
  });

  s = s
    .replaceAll(prefixedSlash, placeholder)
    .replaceAll("/blog/", prefixedSlash)
    .replaceAll(placeholder, prefixedSlash);

  s = s.replace(/@@BSHARP_PREVIEW_BLOG_URL_(\d+)@@/g, (_, d) => held[Number(d)] ?? _);

  return s;
}

function calculateReadingTime(content) {
  const words = String(content || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.ceil(words / 200);
}

function sanitizeShortcodes(content) {
  if (!content) return "";

  return content
    // remove escaped shortcodes
    .replace(/\\\[(?:\/)?[a-zA-Z][^\]]*\](?!\()/g, "")

    // remove normal shortcodes
    .replace(/\[(?:\/)?[a-zA-Z][^\]]*\](?!\()/g, "")

    // remove wordpress comments
    .replace(/<!--[\s\S]*?-->/g, "")

    // normalize whitespace
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Decode common HTML entities (order: &amp; first). */
function decodeHtmlEntities(text) {
  if (!text) return "";
  return String(text)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/g, " ");
}

function escapeHtmlAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isAllowedVideoIframeSrc(src) {
  if (!src || typeof src !== "string") return false;
  const s = src.trim();
  if (/VIDEO_ID|placeholder|your-video|example\.com/i.test(s)) return false;
  try {
    const u = new URL(s);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const h = u.hostname.toLowerCase();
    return (
      h === "www.youtube.com" ||
      h === "youtube.com" ||
      h === "www.youtube-nocookie.com" ||
      h === "m.youtube.com" ||
      h.endsWith(".youtube.com") ||
      h === "youtu.be" ||
      h === "player.vimeo.com" ||
      h === "embed.ted.com"
    );
  } catch {
    return false;
  }
}

/**
 * Turn pasted iframe embeds inside <pre><code> or ``` fences into real video embeds.
 * Otherwise the browser shows escaped HTML as "code" instead of a player.
 */
function buildVideoEmbedFromIframeString(rawInner) {
  const decoded = decodeHtmlEntities(String(rawInner).trim());
  if (!/<iframe/i.test(decoded)) return null;

  const iframeMatch = decoded.match(/<iframe[\s\S]*?<\/iframe>/i);
  if (!iframeMatch) return null;

  const iframeTag = iframeMatch[0];
  const srcMatch = iframeTag.match(/src\s*=\s*["']([^"']+)["']/i);
  const src = srcMatch ? srcMatch[1].trim() : "";
  const titleMatch = iframeTag.match(/title\s*=\s*["']([^"']*)["']/i);
  const title = titleMatch ? titleMatch[1] : "Embedded video";

  if (!src) {
    return '<p class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Video embed is missing a valid <code>src</code> URL.</p>';
  }

  if (/VIDEO_ID|placeholder|your-video/i.test(src)) {
    return '<p class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="note">Replace <code>VIDEO_ID</code> in the YouTube embed URL with a real video ID, or use the editor\'s <strong>video</strong> button to embed.</p>';
  }

  if (!isAllowedVideoIframeSrc(src)) {
    return null;
  }

  const safeSrc = escapeHtmlAttr(src);
  const safeTitle = escapeHtmlAttr(title);

  return `<div class="video-embed my-6 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100" style="aspect-ratio:16/9;max-width:100%"><iframe src="${safeSrc}" title="${safeTitle}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" style="width:100%;height:100%;border:0;display:block"></iframe></div>`;
}

function promoteIframeEmbedsInMarkdown(content) {
  if (!content || typeof content !== "string") return content;

  let out = content;

  // GFM / HTML fenced blocks that only contain an iframe
  out = out.replace(/```(?:html|iframe)?\s*\n([\s\S]*?)```/gi, (match, inner) => {
    const embed = buildVideoEmbedFromIframeString(inner);
    return embed || match;
  });

  // Raw <pre><code>…</code></pre> (from TipTap code block or Word HTML)
  out = out.replace(
    /<pre(?:\s[^>]*)?>\s*<code(?:\s[^>]*)?>([\s\S]*?)<\/code>\s*<\/pre>/gi,
    (match, inner) => {
      const embed = buildVideoEmbedFromIframeString(inner);
      return embed || match;
    }
  );

  return out;
}

function normalizeDateValue(value) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

/**
 * Blog posts often reference /blog/{slug}/images/... but this repo may only
 * ship markdown (images stay on production). When the file is missing under
 * content/blog-clean, fall back to the live host so thumbnails and inline
 * images still load. Set BLOG_IMAGE_FALLBACK_ORIGIN="" to disable.
 */
function getBlogImageFallbackOrigin() {
  const v = process.env.BLOG_IMAGE_FALLBACK_ORIGIN ?? process.env.NEXT_PUBLIC_BLOG_IMAGE_FALLBACK_ORIGIN;
  if (v === "") return "";
  if (v != null && String(v).trim() !== "") return String(v).replace(/\/$/, "");
  return "https://www.bsharpcorp.com";
}

function decodeUrlPathSegments(relPath) {
  return String(relPath || "")
    .split("/")
    .filter(Boolean)
    .map((seg) => {
      try {
        return decodeURIComponent(seg);
      } catch {
        return seg;
      }
    });
}

function remoteBlogImagesUrl(slug, decodedSegments) {
  const origin = getBlogImageFallbackOrigin();
  if (!origin || !decodedSegments.length) return "";
  const encoded = decodedSegments.map((p) => encodeURIComponent(p)).join("/");
  return `${origin}/blog/${slug}/images/${encoded}`;
}

function resolveImageValue(slug, rawImage, source = "live") {
  if (!rawImage) return "";
  if (rawImage.startsWith("http://") || rawImage.startsWith("https://")) {
    return rawImage;
  }
  if (rawImage.startsWith("/")) {
    const clean = legacyBlogPathToExplore(rawImage);
    const match = rawImage.match(/^\/blog\/([^/]+)\/images\/(.+)$/);
    if (match) {
      const pathSlug = match[1];
      const segs = decodeUrlPathSegments(match[2]);
      if (segs.length) {
        const localFilePath = path.join(getBlogDir(source), pathSlug, "images", ...segs);
        if (fs.existsSync(localFilePath)) return clean;
        const remote = remoteBlogImagesUrl(pathSlug, segs);
        if (remote) return remote;
      }
    }
    return clean;
  }

  const encoded = rawImage
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
  const localFilePath = path.join(getBlogDir(source), slug, "images", rawImage);
  if (fs.existsSync(localFilePath)) {
    return legacyBlogPathToExplore(
      `${getRoutePrefix(source)}/${slug}/images/${encoded}`,
    );
  }
  const relSegs = decodeUrlPathSegments(rawImage.replace(/\\/g, "/"));
  if (relSegs.length) {
    const remote = remoteBlogImagesUrl(slug, relSegs);
    if (remote) return remote;
  }
  return "";
}

function resolveThumbnailImage(slug, frontmatter, source = "live") {
  const explicit = resolveImageValue(slug, frontmatter.thumbnail || "", source);
  if (explicit) return explicit;

  // Prefer explicit thumbnail field from migration metadata.
  const primary = resolveImageValue(slug, frontmatter.coverImage || "", source);
  if (primary) return primary;

  // Fallback only if cover image is missing.
  return resolveImageValue(slug, frontmatter.image || "", source);
}

function extractFirstImageFromMarkdown(content) {
  if (!content) return "";
  const match = content.match(/!\[[^\]]*]\(((?:https?:\/\/|\/)[^\s)]+)\)/i);
  return match ? match[1] : "";
}

function normalizeComparableText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function stripLeadingDuplicateTitle(content, title) {
  if (!content || !title) return content || "";

  const target = normalizeComparableText(title);
  if (!target) return content;

  const lines = content.split(/\r?\n/);
  const kept = [];
  let i = 0;
  let removedAny = false;

  // Only clean duplicates from the leading block.
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      if (!removedAny) {
        kept.push(line);
      }
      i += 1;
      continue;
    }

    const withoutHeading = trimmed.replace(/^#{1,6}\s+/, "");
    const comparable = normalizeComparableText(withoutHeading);
    if (comparable === target) {
      removedAny = true;
      i += 1;
      continue;
    }
    break;
  }

  const result = [...kept, ...lines.slice(i)].join("\n");
  return result.replace(/^\n+/, "");
}

function getPostDirectory(slug, source = "live") {
  return path.join(getBlogDir(source), slug);
}

function getPostFilePath(slug, source = "live") {
  return path.join(getPostDirectory(slug, source), "index.md");
}

function validatePost(post, filename) {
  if (!post.product) {
    throw new Error(
      `Blog post "${filename}" is missing required field "product". ` +
      `Must be one of: ${VALID_PRODUCTS.join(", ")}`
    );
  }
  if (!VALID_PRODUCTS.includes(post.product)) {
    throw new Error(
      `Blog post "${filename}" has invalid product value "${post.product}". ` +
      `Must be one of: ${VALID_PRODUCTS.join(", ")}`
    );
  }
}

async function buildPostFromFile(slug, fileContents, source = "live") {
  let data, content;
  try {
    ({ data, content } = matter(fileContents));
  } catch (err) {
    console.error(`[blog] Failed to parse frontmatter for "${slug}":`, err.message);
    return null;
  }
  // Hard-gate: a parse failure above returns null, but a post that parses with a
  // missing/invalid `product` must fail the build loudly — so validate outside the
  // try/catch where the thrown error is not swallowed.
  validatePost(data, slug);
  const title = data.title || slug;
  const cleanContent = stripLeadingDuplicateTitle(
    promoteIframeEmbedsInMarkdown(sanitizeShortcodes(content)),
    title
  );

  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeBsharpCta)
    .use(rehypeStringify)
    .process(cleanContent);
  let contentHtml = processedContent.toString();
  contentHtml = rewriteLegacyBlogUrlsInHtml(contentHtml);
  const description = data.description || "";
  const date = normalizeDateValue(data.date);
  const thumbnailImage = resolveThumbnailImage(slug, data, source);
  const image =
    thumbnailImage ||
    legacyBlogPathToExplore(extractFirstImageFromMarkdown(cleanContent));
  const readingTime = calculateReadingTime(cleanContent);
  const featuredImage = image;
  const showContactForm = parseShowContactForm(data);

  const thumbnailAlt = String(
    data.thumbnail_alt ?? data.thumbnailAlt ?? "",
  ).trim();

  const rawTags = Array.isArray(data.tags) ? data.tags : [];
  const tags = rawTags
    .map((t) => String(t).trim().toLowerCase())
    .filter(Boolean);

  let category = "";
  if (Array.isArray(data.categories) && data.categories.length) {
    category = String(data.categories[0]).trim();
  } else if (data.category != null) {
    category = String(data.category).trim();
  }

  return {
    slug,
    title,
    date,
    description,
    thumbnailImage,
    featuredImage,
    image,
    readingTime,
    contentHtml,
    content,
    showContactForm,
    tags,
    category,
    thumbnailAlt,
    product: data.product,
  };
}

export function getPostSlugsBySource(source = "live") {
  const blogDir = getBlogDir(source);
  if (!fs.existsSync(blogDir)) return [];

  return fs
    .readdirSync(blogDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

export async function getPostBySlugFromSource(slug, source = "live") {
  const isVercel = process.env.VERCEL === "1";
  const isStaging = source === "staging";

  // On Vercel, always fetch staging/draft content from GitHub
  // because the filesystem is read-only and won't have latest drafts
  if (isVercel && isStaging) {
    const fromGitHub = await getPostMarkdownViaGitHub(slug, source);
    if (fromGitHub) {
      return buildPostFromFile(slug, fromGitHub, source);
    }
    return null;
  }

  // For live posts or local development, check filesystem first
  const postFile = getPostFilePath(slug, source);
  if (fs.existsSync(postFile)) {
    const fileContents = fs.readFileSync(postFile, "utf8");
    return buildPostFromFile(slug, fileContents, source);
  }

  // Fallback to GitHub
  const fromGitHub = await getPostMarkdownViaGitHub(slug, source);
  if (fromGitHub) {
    return buildPostFromFile(slug, fromGitHub, source);
  }

  return null;
}

export async function getSortedPostsBySource(source = "live") {
  const posts = await Promise.all(
    getPostSlugsBySource(source).map((slug) => getPostBySlugFromSource(slug, source))
  );
  return posts
    .filter(Boolean)
    .sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      return timeB - timeA;
    });
}

export function getPostSlugs() {
  return getPostSlugsBySource("live");
}

export async function getPostBySlug(slug) {
  return getPostBySlugFromSource(slug, "live");
}

export async function getSortedPosts() {
  return getSortedPostsBySource("live");
}

export async function getAllPosts() {
  return getSortedPostsBySource("live");
}

