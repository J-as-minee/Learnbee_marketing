/**
 * Shared GitHub REST helpers for blog admin (Contents API).
 * Env: GITHUB_TOKEN, GITHUB_REPO=owner/name, optional GITHUB_BRANCH, GITHUB_REPO_ROOT.
 */

export function ghHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "learnbee-blog-admin",
  };
}

export function encodePathForUrl(repoPath) {
  return repoPath
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
}

export function getGitHubBlogConfig() {
  const token = String(process.env.GITHUB_TOKEN ?? "").trim();
  const repo = String(process.env.GITHUB_REPO ?? "").trim();
  const branch = String(process.env.GITHUB_BRANCH ?? "main").trim() || "main";
  const root = String(process.env.GITHUB_REPO_ROOT ?? "").trim().replace(/\/$/, "");
  if (!token || !repo) return null;
  const [owner, ...nameParts] = repo.split("/");
  const name = nameParts.join("/");
  if (!owner || !name) return null;
  return { token, owner, name, branch, root };
}

/**
 * List all file paths + shas under a directory (recursive).
 */
export async function listFilesRecursive(cfg, dirPath) {
  const { token, owner, name } = cfg;
  const url = `https://api.github.com/repos/${owner}/${name}/contents/${encodePathForUrl(dirPath)}?ref=${encodeURIComponent(cfg.branch)}`;
  const res = await fetch(url, { headers: ghHeaders(token) });
  if (res.status === 404) return [];
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub list ${dirPath}: ${res.status} ${text}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    if (data.type === "file") {
      return [{ path: data.path, sha: data.sha }];
    }
    return [];
  }
  const out = [];
  for (const item of data) {
    if (item.type === "file") {
      out.push({ path: item.path, sha: item.sha });
    } else if (item.type === "dir") {
      const sub = await listFilesRecursive(cfg, item.path);
      out.push(...sub);
    }
  }
  return out;
}
