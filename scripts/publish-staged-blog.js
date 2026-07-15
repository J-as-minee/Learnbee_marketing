const fs = require("node:fs");
const path = require("node:path");

const STAGING_ROOT = path.join(process.cwd(), "content", "blog-staging");
const LIVE_ROOT = path.join(process.cwd(), "content", "blog-clean");

function parseSlugArg() {
  const args = process.argv.slice(2);
  const fromFlag = args.find((arg) => arg.startsWith("--slug="));
  if (fromFlag) return fromFlag.slice("--slug=".length).trim();

  const slugIndex = args.indexOf("--slug");
  if (slugIndex >= 0 && args[slugIndex + 1]) {
    return String(args[slugIndex + 1]).trim();
  }

  return "";
}

function assertValidSlug(slug) {
  if (!slug) {
    throw new Error("Missing slug. Use --slug your-post-slug");
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(`Invalid slug "${slug}". Use lowercase letters, numbers, and hyphens.`);
  }
}

function main() {
  const slug = parseSlugArg();
  assertValidSlug(slug);

  const stagingPath = path.join(STAGING_ROOT, slug);
  const livePath = path.join(LIVE_ROOT, slug);

  if (!fs.existsSync(stagingPath)) {
    throw new Error(`Staging post not found: ${path.relative(process.cwd(), stagingPath)}`);
  }

  if (!fs.existsSync(path.join(stagingPath, "index.md"))) {
    throw new Error(`Staging post missing index.md: ${path.relative(process.cwd(), stagingPath)}`);
  }

  if (fs.existsSync(livePath)) {
    throw new Error(`Live post already exists: ${path.relative(process.cwd(), livePath)}`);
  }

  fs.mkdirSync(LIVE_ROOT, { recursive: true });
  fs.renameSync(stagingPath, livePath);

  const indexPath = path.join(livePath, "index.md");
  if (fs.existsSync(indexPath)) {
    let md = fs.readFileSync(indexPath, "utf8");
    const previewPattern = `/preview/blog/${slug}/images/`;
    const livePattern = `/blog/${slug}/images/`;
    if (md.includes(previewPattern)) {
      md = md.split(previewPattern).join(livePattern);
      fs.writeFileSync(indexPath, md, "utf8");
      console.log(`Rewrote image paths: /preview/... → /blog/...`);
    }
  }

  console.log(`Published: ${slug}`);
  console.log(`From: ${path.relative(process.cwd(), stagingPath).replace(/\\/g, "/")}`);
  console.log(`To:   ${path.relative(process.cwd(), livePath).replace(/\\/g, "/")}`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
