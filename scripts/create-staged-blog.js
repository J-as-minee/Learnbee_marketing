const fs = require("node:fs");
const path = require("node:path");

const STAGING_ROOT = path.join(process.cwd(), "content", "blog-staging");

function parseArgs() {
  const args = process.argv.slice(2);
  const read = (name) => {
    const withEquals = args.find((arg) => arg.startsWith(`--${name}=`));
    if (withEquals) return withEquals.slice(name.length + 3).trim();
    const idx = args.indexOf(`--${name}`);
    if (idx >= 0 && args[idx + 1]) return String(args[idx + 1]).trim();
    return "";
  };

  return {
    slug: read("slug"),
    title: read("title"),
    author: read("author") || "Editorial Team",
    category: read("category") || "blogs",
    tag: read("tag") || "general",
  };
}

function toTitleCaseFromSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Wrap value in double-quotes so YAML special chars (colons, etc.) are safe */
function yamlQuote(value) {
  return JSON.stringify(String(value || ""));
}

function main() {
  const options = parseArgs();
  const slug = options.slug;
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("Provide a valid --slug (lowercase letters, numbers, hyphens).");
  }

  const title = options.title || toTitleCaseFromSlug(slug);
  const postDir = path.join(STAGING_ROOT, slug);
  const postFile = path.join(postDir, "index.md");
  const imageDir = path.join(postDir, "images");

  if (fs.existsSync(postDir)) {
    throw new Error(`Draft already exists: ${path.relative(process.cwd(), postDir)}`);
  }

  fs.mkdirSync(imageDir, { recursive: true });

  const today = new Date().toISOString().slice(0, 10);
  const content = `---
title: ${yamlQuote(title)}
date: ${today}
author: ${yamlQuote(options.author)}
description: ${yamlQuote("Add a concise summary for SEO.")}
categories:
  - ${yamlQuote(options.category)}
tags:
  - ${yamlQuote(options.tag)}
thumbnail: ""
thumbnail_alt: ""
image: ""
coverImage: ""
show_contact_form: true
---

# ${title}

Write your draft content here.
`;

  fs.writeFileSync(postFile, content, "utf8");

  console.log(`Created draft: ${path.relative(process.cwd(), postDir).replace(/\\/g, "/")}`);
  console.log("Preview URL pattern:");
  console.log(`/preview/blog/${slug}?preview=<BLOG_PREVIEW_TOKEN>`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
