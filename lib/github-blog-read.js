/**
 * Read blog markdown from GitHub Contents API when the file is missing on disk (e.g. Vercel).
 */

import {
  getGitHubBlogConfig,
  ghHeaders,
  encodePathForUrl,
} from "@/lib/github-blog";

/**
 * @param {string} slug
 * @param {"live"|"staging"|string} source
 * @returns {Promise<string|null>} raw markdown or null if not found / not configured
 */
export async function getPostMarkdownViaGitHub(slug, source) {
  const cfg = getGitHubBlogConfig();
  if (!cfg) return null;

  // Match lib/blog.js resolveSource: only "staging" uses blog-staging; else blog-clean.
  const subdir = String(source) === "staging" ? "blog-staging" : "blog-clean";
  const repoPath = [cfg.root, "content", subdir, slug, "index.md"]
    .filter(Boolean)
    .join("/");

  const url = `https://api.github.com/repos/${cfg.owner}/${cfg.name}/contents/${encodePathForUrl(repoPath)}?ref=${encodeURIComponent(cfg.branch)}`;
  console.log("[github-blog-read] fetching:", url);
  const res = await fetch(url, {
    headers: ghHeaders(cfg.token),
    cache: "no-store",
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    const text = await res.text();
    console.error(
      `[github-blog-read] GET ${repoPath} failed (${res.status}):`,
      text.slice(0, 500),
    );
    return null;
  }

  let data;
  try {
    data = await res.json();
  } catch (err) {
    console.error("[github-blog-read] JSON parse error:", err);
    return null;
  }

  if (!data || data.type !== "file" || typeof data.content !== "string") {
    return null;
  }

  const b64 = String(data.content).replace(/\s/g, "");
  try {
    return Buffer.from(b64, "base64").toString("utf8");
  } catch (err) {
    console.error("[github-blog-read] base64 decode error:", err);
    return null;
  }
}
