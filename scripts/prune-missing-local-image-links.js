const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");

const BLOG_ROOT = path.join(process.cwd(), "content", "blog-clean");
const LOCAL_MARKDOWN_IMAGE_LINE =
  /^!\[[^\]]*]\((\/blog\/([^/]+)\/images\/([^)]+))\)\s*$/gm;

function parseLocalImagePath(url) {
  const match = String(url || "").match(/^\/blog\/([^/]+)\/images\/(.+)$/);
  if (!match) return null;
  return {
    slug: decodeURIComponent(match[1]),
    fileName: decodeURIComponent(match[2]),
  };
}

function fileExistsForUrl(currentSlug, url) {
  const parsed = parseLocalImagePath(url);
  if (!parsed || parsed.slug !== currentSlug) return true;
  const imagePath = path.join(BLOG_ROOT, currentSlug, "images", parsed.fileName);
  return fs.existsSync(imagePath);
}

function main() {
  if (!fs.existsSync(BLOG_ROOT)) {
    console.error(`Blog directory not found: ${BLOG_ROOT}`);
    process.exit(1);
  }

  const slugs = fs
    .readdirSync(BLOG_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  let updatedPosts = 0;
  let removedImageLines = 0;
  let clearedFrontmatterFields = 0;

  for (const slug of slugs) {
    const postPath = path.join(BLOG_ROOT, slug, "index.md");
    if (!fs.existsSync(postPath)) continue;

    const raw = fs.readFileSync(postPath, "utf8");
    const parsed = matter(raw);
    const data = { ...parsed.data };
    let content = parsed.content;
    let changed = false;

    content = content.replace(LOCAL_MARKDOWN_IMAGE_LINE, (full, fullUrl) => {
      if (!fileExistsForUrl(slug, fullUrl)) {
        removedImageLines += 1;
        changed = true;
        return "";
      }
      return full;
    });

    for (const key of ["image", "thumbnail", "coverImage"]) {
      const value = data[key];
      if (typeof value !== "string") continue;
      const parsedLocal = parseLocalImagePath(value);
      if (!parsedLocal || parsedLocal.slug !== slug) continue;

      const exists = fileExistsForUrl(slug, value);
      if (!exists) {
        data[key] = "";
        clearedFrontmatterFields += 1;
        changed = true;
      }
    }

    if (changed) {
      content = content
        .replace(/\n{3,}/g, "\n\n")
        .replace(/^\s*\n/gm, "\n")
        .trimEnd();

      fs.writeFileSync(postPath, matter.stringify(`${content}\n`, data), "utf8");
      updatedPosts += 1;
    }
  }

  console.log(`Posts scanned: ${slugs.length}`);
  console.log(`Posts updated: ${updatedPosts}`);
  console.log(`Markdown image lines removed: ${removedImageLines}`);
  console.log(`Frontmatter image fields cleared: ${clearedFrontmatterFields}`);
}

main();
