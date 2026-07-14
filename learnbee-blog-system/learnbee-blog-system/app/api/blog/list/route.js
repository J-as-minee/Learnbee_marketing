import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { verifyBlogAdminRequest } from "@/lib/admin-auth";
import { getGitHubBlogConfig, listFilesRecursive } from "@/lib/github-blog";
import { getPostMarkdownViaGitHub } from "@/lib/github-blog-read";
import { isUnpublishedFromLiveMeta } from "@/lib/blog-unpublished-meta";

export const runtime = "nodejs";

const STAGING_ROOT = path.join(process.cwd(), "content", "blog-staging");
const LIVE_ROOT = path.join(process.cwd(), "content", "blog-clean");

function verifyAuth(request) {
  return verifyBlogAdminRequest(request);
}

function getPostsFromDir(dir, source) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => fs.existsSync(path.join(dir, name, "index.md")))
    .map((slug) => {
      const raw = fs.readFileSync(path.join(dir, slug, "index.md"), "utf8");
      let data = {};
      try {
        ({ data } = matter(raw));
      } catch {
        /* skip bad frontmatter */
      }
      return {
        slug,
        title: data.title || slug,
        date: data.date ? String(data.date) : "",
        author: data.author || "",
        description: data.description || "",
        categories: data.categories || [],
        tags: data.tags || [],
        source,
        unpublishedFromLive: isUnpublishedFromLiveMeta(data),
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * @param {"staging"|"live"} source
 */
async function getPostsFromGitHub(source) {
  const cfg = getGitHubBlogConfig();
  if (!cfg) return [];

  const subdir = source === "staging" ? "blog-staging" : "blog-clean";
  const basePath = [cfg.root, "content", subdir].filter(Boolean).join("/");

  let files;
  try {
    files = await listFilesRecursive(cfg, basePath);
  } catch {
    return [];
  }

  const normBase = basePath.replace(/\\/g, "/");
  const prefix = normBase.endsWith("/") ? normBase : `${normBase}/`;
  const slugs = new Set();
  for (const { path: p } of files) {
    const norm = p.replace(/\\/g, "/");
    if (!norm.endsWith("/index.md")) continue;
    if (!norm.startsWith(prefix)) continue;
    const rel = norm.slice(prefix.length);
    if (!rel.endsWith("/index.md")) continue;
    const slug = rel.slice(0, -"/index.md".length);
    if (slug && !slug.includes("/")) slugs.add(slug);
  }

  const items = [];
  for (const slug of slugs) {
    const raw = await getPostMarkdownViaGitHub(slug, source);
    if (!raw) continue;
    let data = {};
    try {
      ({ data } = matter(raw));
    } catch {
      continue;
    }
    items.push({
      slug,
      title: data.title || slug,
      date: data.date ? String(data.date) : "",
      author: data.author || "",
      description: data.description || "",
      categories: data.categories || [],
      tags: data.tags || [],
      source,
      unpublishedFromLive: isUnpublishedFromLiveMeta(data),
    });
  }

  return items.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function GET(request) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let staging = getPostsFromDir(STAGING_ROOT, "staging");
  if (staging.length === 0) {
    staging = await getPostsFromGitHub("staging");
  }

  let published = getPostsFromDir(LIVE_ROOT, "live");
  if (published.length === 0) {
    published = await getPostsFromGitHub("live");
  }

  const drafts = staging.filter((p) => !p.unpublishedFromLive);
  const unpublished = staging.filter((p) => p.unpublishedFromLive);

  return NextResponse.json({ drafts, unpublished, published });
}
