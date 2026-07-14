/**
 * Verify blog image route file tracing includes committed post images.
 * Run after `npm run build` — fails loudly if images are missing from the trace.
 */
const fs = require("node:fs");
const path = require("node:path");

const NFT_PATH = path.join(
  process.cwd(),
  ".next/server/app/blog/[slug]/images/[...imagePath]/route.js.nft.json",
);

if (!fs.existsSync(NFT_PATH)) {
  console.error("[blog:verify-image-trace] Missing nft.json — run npm run build first.");
  process.exit(1);
}

const nft = JSON.parse(fs.readFileSync(NFT_PATH, "utf8"));
const traced = new Set(nft.files || []);
const blogRoot = path.join(process.cwd(), "content", "blog-clean");

let expected = 0;
let missing = 0;
const samples = [];

for (const slug of fs.readdirSync(blogRoot, { withFileTypes: true })) {
  if (!slug.isDirectory()) continue;
  const slugName = slug.name;
  const imagesDir = path.join(blogRoot, slugName, "images");
  if (!fs.existsSync(imagesDir)) continue;

  for (const file of fs.readdirSync(imagesDir)) {
    const abs = path.join(imagesDir, file);
    if (!fs.statSync(abs).isFile()) continue;
    expected += 1;

    const rel = path.relative(process.cwd(), abs).replace(/\\/g, "/");
    const found = [...traced].some((entry) => {
      const norm = entry.replace(/\\/g, "/");
      return norm.endsWith(`/${rel}`) || norm.endsWith(`/${file}`);
    });

    if (!found) {
      missing += 1;
      if (samples.length < 5) samples.push(rel);
    }
  }
}

if (missing > 0) {
  console.error(
    `[blog:verify-image-trace] ${missing}/${expected} blog images missing from image-route trace.`,
  );
  console.error("Samples:", samples);
  process.exit(1);
}

if (expected === 0) {
  console.log(
    "[blog:verify-image-trace] OK — no blog images yet (empty content/blog-clean). Trace check skipped until posts exist.",
  );
  process.exit(0);
}

console.log(
  `[blog:verify-image-trace] OK — ${expected} blog images traced for /blog/[slug]/images/*`,
);
