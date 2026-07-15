const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");

const BLOG_ROOTS = {
  live: path.join(process.cwd(), "content", "blog-clean"),
  staging: path.join(process.cwd(), "content", "blog-staging"),
};
const REQUIRED_FIELDS = ["title", "date", "author", "description", "categories"];
const IMAGE_LINK_REGEX = /!\[[^\]]*]\(([^)]+)\)/g;

function parseSourceArg() {
  const args = process.argv.slice(2);
  const value = args.find((arg) => arg.startsWith("--source="));
  if (value) {
    const source = value.slice("--source=".length).trim();
    return source === "staging" ? "staging" : "live";
  }
  return "live";
}

function isExternalUrl(value) {
  return /^https?:\/\//i.test(String(value || ""));
}

function validatePost(slug, source, blogRoot) {
  const postDir = path.join(blogRoot, slug);
  const postPath = path.join(postDir, "index.md");
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(postPath)) {
    errors.push(`missing markdown file: ${postPath}`);
    return { slug, errors, warnings };
  }

  const raw = fs.readFileSync(postPath, "utf8");
  const parsed = matter(raw);
  const data = parsed.data || {};

  for (const field of REQUIRED_FIELDS) {
    const value = data[field];
    const missingArray = Array.isArray(value) && value.length === 0;
    if (value == null || value === "" || missingArray) {
      errors.push(`missing required frontmatter field: ${field}`);
    }
  }

  if (!Array.isArray(data.tags) || data.tags.length === 0) {
    warnings.push("missing tags (recommended but optional)");
  }

  const imageRegex = new RegExp(IMAGE_LINK_REGEX.source, "g");
  const imageMatches = [...String(parsed.content || "").matchAll(imageRegex)];
  for (const match of imageMatches) {
    const url = String(match[1] || "").trim();
    if (!url || isExternalUrl(url)) {
      continue;
    }

    const livePrefix = `/blog/${slug}/images/`;
    const previewPrefix = `/preview/blog/${slug}/images/`;
    if (url.startsWith(livePrefix) || url.startsWith(previewPrefix)) {
      const fileName = decodeURIComponent(url.split("/").pop() || "");
      const localImagePath = path.join(postDir, "images", fileName);
      if (!fs.existsSync(localImagePath)) {
        warnings.push(`missing local image file for content link: ${url}`);
      }
    }
  }

  return { slug, errors, warnings, source };
}

function main() {
  const source = parseSourceArg();
  const blogRoot = BLOG_ROOTS[source];

  if (!fs.existsSync(blogRoot)) {
    console.error(`Blog directory not found: ${blogRoot}`);
    process.exit(1);
  }

  const slugs = fs
    .readdirSync(blogRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const results = slugs.map((slug) => validatePost(slug, source, blogRoot));
  const errorResults = results.filter((item) => item.errors.length);
  const warningResults = results.filter((item) => item.warnings.length);

  console.log(`Source: ${source}`);
  console.log(`Posts checked: ${results.length}`);
  console.log(`Posts with errors: ${errorResults.length}`);
  console.log(`Posts with warnings: ${warningResults.length}`);
  console.log("");

  for (const item of errorResults) {
    console.log(`ERROR ${item.slug}`);
    for (const error of item.errors) {
      console.log(`  - ${error}`);
    }
  }

  if (warningResults.length) {
    console.log("");
    for (const item of warningResults) {
      console.log(`WARN ${item.slug}`);
      for (const warning of item.warnings) {
        console.log(`  - ${warning}`);
      }
    }
  }

  if (errorResults.length) {
    process.exit(1);
  }
}

main();
