/**
 * One-time, idempotent backfill: add `product: converse` to every existing
 * blog post under content/blog-clean/<slug>/index.md.
 *
 * Every existing post is Converse-era, so the value is blanket `converse`.
 * Genuinely product-neutral posts can be reclassified later.
 * Refs docs/blog-product-tagging-decision.md (Step 1).
 *
 * Approach: gray-matter PARSES each file to detect whether `product` already
 * exists (idempotency). Writing is done by a precise TEXTUAL insertion into the
 * frontmatter block — NOT gray-matter.stringify — so that every other field,
 * its YAML style (folded scalars, quoting, list style), the markdown body, and
 * the file's line endings are preserved byte-for-byte. The only change to a
 * modified file is a single added `product: converse` line.
 *
 * Insertion point: immediately before the top-level `tags:` line if present,
 * otherwise as the last frontmatter field (just before the closing `---`).
 *
 * Re-running is a no-op on already-tagged posts.
 */

import fs from "node:fs";
import path from "node:path";

const BLOG_DIR = path.join(process.cwd(), "content", "blog-clean");
const PRODUCT_FIELD = "product";
const PRODUCT_VALUE = "learnbee";
const PRODUCT_LINE = `${PRODUCT_FIELD}: ${PRODUCT_VALUE}`;

let matter;
try {
  matter = (await import("gray-matter")).default;
} catch {
  console.error(
    "ERROR: gray-matter is not installed. It is expected as a dependency (see lib/blog.js)."
  );
  process.exit(1);
}

/**
 * Insert the product line into a frontmatter block without disturbing anything
 * else. Returns the new file contents, or null if no frontmatter block was
 * found (caller treats that as an error).
 */
function insertProductLine(raw) {
  // Capture: opening fence + its EOL | inner YAML | EOL before closing fence |
  // closing fence | EOL (or EOF) after it. The body is whatever follows.
  const fm = raw.match(/^---(\r?\n)([\s\S]*?)(\r?\n)---(\r?\n|$)/);
  if (!fm) return null;

  const [matched, openEol, inner, preCloseEol, postCloseEol] = fm;
  const body = raw.slice(matched.length);

  // Split inner YAML on the frontmatter's own EOL so we don't normalize anything.
  const lines = inner.split(openEol);

  // Insert before the first top-level `tags:` line, else append as last field.
  let insertAt = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (/^tags:/.test(lines[i])) {
      insertAt = i;
      break;
    }
  }
  lines.splice(insertAt, 0, PRODUCT_LINE);

  const newInner = lines.join(openEol);
  return `---${openEol}${newInner}${preCloseEol}---${postCloseEol}${body}`;
}

function listPostFiles() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.error(`ERROR: blog directory not found: ${BLOG_DIR}`);
    process.exit(1);
  }
  return fs
    .readdirSync(BLOG_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
    .map((slug) => ({ slug, file: path.join(BLOG_DIR, slug, "index.md") }));
}

function main() {
  const posts = listPostFiles();
  const result = { scanned: 0, modified: [], skipped: [], errors: [] };

  for (const { slug, file } of posts) {
    result.scanned += 1;

    if (!fs.existsSync(file)) {
      result.errors.push({ slug, error: "missing index.md" });
      continue;
    }

    const raw = fs.readFileSync(file, "utf8");

    // Idempotency / detection via gray-matter parse.
    let data;
    try {
      ({ data } = matter(raw));
    } catch (e) {
      result.errors.push({ slug, error: `frontmatter parse failed: ${e.message}` });
      continue;
    }

    if (data && Object.prototype.hasOwnProperty.call(data, PRODUCT_FIELD)) {
      result.skipped.push({ slug, value: data[PRODUCT_FIELD] });
      continue;
    }

    const next = insertProductLine(raw);
    if (next == null) {
      result.errors.push({ slug, error: "no frontmatter block found at file start" });
      continue;
    }

    // Safety: writing must add exactly the product line and change nothing else.
    if (next.length !== raw.length + PRODUCT_LINE.length + detectEolLen(raw)) {
      // Length must grow by the product line plus one EOL separator. If not,
      // something unexpected happened — skip and report rather than corrupt.
      result.errors.push({
        slug,
        error: "unexpected length delta after insertion (aborted write)",
      });
      continue;
    }

    fs.writeFileSync(file, next, "utf8");
    result.modified.push({ slug });
  }

  report(result);
  if (result.errors.length > 0) process.exitCode = 1;
}

function detectEolLen(raw) {
  const fm = raw.match(/^---(\r?\n)/);
  return fm ? fm[1].length : 1;
}

function report(r) {
  console.log("\nBackfill: product: converse → content/blog-clean/*/index.md\n");
  console.log(`  Scanned:  ${r.scanned}`);
  console.log(`  Modified: ${r.modified.length}`);
  console.log(`  Skipped:  ${r.skipped.length} (already had product)`);
  console.log(`  Errors:   ${r.errors.length}`);

  if (r.modified.length) {
    console.log("\n  Modified posts:");
    for (const m of r.modified) console.log(`    + ${m.slug}`);
  }
  if (r.skipped.length) {
    console.log("\n  Skipped (already tagged):");
    for (const s of r.skipped) console.log(`    = ${s.slug} (product: ${JSON.stringify(s.value)})`);
  }
  if (r.errors.length) {
    console.log("\n  Errors:");
    for (const e of r.errors) console.log(`    ! ${e.slug}: ${e.error}`);
  }
  console.log("");
}

main();
