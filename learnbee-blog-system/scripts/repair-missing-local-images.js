const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");

const BLOG_ROOT = path.join(process.cwd(), "content", "blog-clean");
const SOURCE_POSTS_ROOT = path.join(process.cwd(), "blog_migration", "output", "posts");
const LOCAL_IMAGE_REGEX = /!\[[^\]]*]\((\/blog\/([^/]+)\/images\/([^)]+))\)/g;
const IMG_SRC_REGEX = /<img[^>]+src=["']([^"'>]+)["']/gi;
const URL_REGEX = /https?:\/\/[^\s<>()"']+\.(?:png|jpe?g|webp|gif|svg)(?:\?[^\s<>()"']*)?/gi;

function normalizeBaseName(fileName) {
  const decoded = decodeURIComponent(String(fileName || ""));
  return path
    .basename(decoded)
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/-\d+x\d+$/i, "");
}

function extFromUrl(url) {
  try {
    const ext = path.extname(new URL(url).pathname).toLowerCase();
    return ext || ".png";
  } catch {
    return ".png";
  }
}

function getMissingLocalImages(slug, markdown) {
  const missing = [];
  let match = LOCAL_IMAGE_REGEX.exec(markdown);

  while (match) {
    const targetSlug = decodeURIComponent(match[2] || "");
    const rawName = decodeURIComponent(match[3] || "");

    if (targetSlug !== slug) {
      match = LOCAL_IMAGE_REGEX.exec(markdown);
      continue;
    }

    const localPath = path.join(BLOG_ROOT, slug, "images", rawName);
    if (!fs.existsSync(localPath)) {
      missing.push({
        markdownPath: match[1],
        fileName: rawName,
        localPath,
        normalizedBase: normalizeBaseName(rawName),
      });
    }

    match = LOCAL_IMAGE_REGEX.exec(markdown);
  }

  return missing;
}

async function fetchLiveImageUrls(slug) {
  const url = `https://bsharpcorp.com/blog/${slug}/`;
  const response = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: { "user-agent": "Mozilla/5.0 (compatible; missing-image-repair/1.0)" },
  });
  if (!response.ok) return [];

  const html = await response.text();
  const urls = new Set();
  let match = IMG_SRC_REGEX.exec(html);
  while (match) {
    const raw = String(match[1] || "").trim();
    if (!raw) {
      match = IMG_SRC_REGEX.exec(html);
      continue;
    }
    try {
      const absolute = new URL(raw, url).href;
      urls.add(absolute);
    } catch {
      // ignore malformed urls
    }
    match = IMG_SRC_REGEX.exec(html);
  }
  return [...urls];
}

function findSourcePostDir(slug) {
  if (!fs.existsSync(SOURCE_POSTS_ROOT)) return "";
  const dirs = fs
    .readdirSync(SOURCE_POSTS_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  return dirs.find((dirName) => dirName.endsWith(`-${slug}`)) || "";
}

function getSourceImageUrls(slug) {
  const sourceDir = findSourcePostDir(slug);
  if (!sourceDir) return [];

  const sourceFile = path.join(SOURCE_POSTS_ROOT, sourceDir, "index.md");
  if (!fs.existsSync(sourceFile)) return [];

  const raw = fs.readFileSync(sourceFile, "utf8");
  const urls = raw.match(URL_REGEX) || [];
  return [...new Set(urls)];
}

function pickSourceUrl(missingImage, liveUrls) {
  if (!liveUrls.length) return "";
  const targetBase = missingImage.normalizedBase;
  if (!targetBase) return "";

  const exact = liveUrls.find((url) => normalizeBaseName(url) === targetBase);
  if (exact) return exact;

  // Fallback to "contains" match for renamed/cropped assets.
  const contains =
    liveUrls.find((url) => {
      const base = normalizeBaseName(url);
      return base.includes(targetBase) || targetBase.includes(base);
    }) || "";
  if (contains) return contains;

  // Last resort: if this is a resized variant, try original filename.
  const resizedBase = targetBase.replace(/-\d+x\d+$/i, "");
  if (resizedBase !== targetBase) {
    return (
      liveUrls.find((url) => normalizeBaseName(url) === resizedBase) ||
      liveUrls.find((url) => normalizeBaseName(url).includes(resizedBase)) ||
      ""
    );
  }

  return "";
}

async function downloadImage(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: { "user-agent": "Mozilla/5.0 (compatible; missing-image-repair/1.0)" },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function repairPost(slug) {
  const postFile = path.join(BLOG_ROOT, slug, "index.md");
  if (!fs.existsSync(postFile)) return { repaired: 0, missing: 0 };

  const raw = fs.readFileSync(postFile, "utf8");
  const parsed = matter(raw);
  const missingImages = getMissingLocalImages(slug, parsed.content);
  if (!missingImages.length) return { repaired: 0, missing: 0 };

  const sourceUrls = getSourceImageUrls(slug);
  const liveUrls = await fetchLiveImageUrls(slug);
  const candidateUrls = [...new Set([...sourceUrls, ...liveUrls])];
  let repaired = 0;

  for (const missingImage of missingImages) {
    const sourceUrl = pickSourceUrl(missingImage, candidateUrls);
    if (!sourceUrl) continue;

    try {
      const bytes = await downloadImage(sourceUrl);
      const imageDir = path.dirname(missingImage.localPath);
      fs.mkdirSync(imageDir, { recursive: true });

      let finalPath = missingImage.localPath;
      let fileName = path.basename(finalPath);
      let ext = path.extname(fileName);

      if (!ext) {
        ext = extFromUrl(sourceUrl);
        fileName = `${fileName}${ext}`;
        finalPath = path.join(imageDir, fileName);
      }

      fs.writeFileSync(finalPath, bytes);
      repaired += 1;
    } catch {
      // keep unresolved as warning
    }
  }

  return { repaired, missing: missingImages.length - repaired };
}

async function main() {
  if (!fs.existsSync(BLOG_ROOT)) {
    console.error(`Blog directory not found: ${BLOG_ROOT}`);
    process.exit(1);
  }

  const slugs = fs
    .readdirSync(BLOG_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  let totalRepaired = 0;
  let unresolved = 0;

  for (const slug of slugs) {
    const result = await repairPost(slug);
    if (result.repaired || result.missing) {
      console.log(`${slug}: repaired ${result.repaired}, unresolved ${result.missing}`);
    }
    totalRepaired += result.repaired;
    unresolved += result.missing;
  }

  console.log("");
  console.log(`Total repaired images: ${totalRepaired}`);
  console.log(`Total unresolved images: ${unresolved}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
