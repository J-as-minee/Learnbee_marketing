/**
 * Delete blog post folders via GitHub Contents API (for Vercel / read-only FS).
 * Env: GITHUB_TOKEN (repo Contents: Read and write), GITHUB_REPO=owner/name, optional GITHUB_BRANCH (default main).
 */

import {
  getGitHubBlogConfig,
  ghHeaders,
  encodePathForUrl,
  listFilesRecursive,
} from "@/lib/github-blog";

/**
 * Delete a blog post folder from the repo (all files under .../slug/).
 */
export async function deleteBlogPostViaGitHub(slug, source) {
  const cfg = getGitHubBlogConfig();
  if (!cfg) {
    return { ok: false, error: "GitHub not configured (GITHUB_TOKEN + GITHUB_REPO)" };
  }

  const subdir = source === "live" ? "blog-clean" : "blog-staging";
  const base = [cfg.root, "content", subdir, slug].filter(Boolean).join("/");

  const files = await listFilesRecursive(cfg, base);
  if (files.length === 0) {
    return { ok: false, error: "Post not found in repository" };
  }

  files.sort((a, b) => b.path.length - a.path.length);

  for (const file of files) {
    const delUrl = `https://api.github.com/repos/${cfg.owner}/${cfg.name}/contents/${encodePathForUrl(file.path)}`;
    const delRes = await fetch(delUrl, {
      method: "DELETE",
      headers: {
        ...ghHeaders(cfg.token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `chore(blog): delete post ${slug}`,
        sha: file.sha,
        branch: cfg.branch,
      }),
    });

    if (!delRes.ok) {
      const text = await delRes.text();
      return {
        ok: false,
        error: `GitHub delete failed (${delRes.status}): ${text.slice(0, 500)}`,
      };
    }
  }

  return { ok: true };
}
