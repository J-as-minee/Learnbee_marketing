/**
 * Unpublish (blog-clean → blog-staging) via GitHub Contents API when local FS is read-only.
 */

import {
  getGitHubBlogConfig,
  ghHeaders,
  encodePathForUrl,
  listFilesRecursive,
} from "@/lib/github-blog";
import { addUnpublishedFromLiveFlag } from "@/lib/blog-unpublished-meta";

async function getFileJson(cfg, repoPath) {
  const url = `https://api.github.com/repos/${cfg.owner}/${cfg.name}/contents/${encodePathForUrl(repoPath)}?ref=${encodeURIComponent(cfg.branch)}`;
  const res = await fetch(url, { headers: ghHeaders(cfg.token) });
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub GET ${repoPath}: ${res.status} ${text.slice(0, 300)}`);
  }
  return res.json();
}

async function deletePathsRecursive(cfg, basePath) {
  const files = await listFilesRecursive(cfg, basePath);
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
        message: `chore(blog): unpublish remove live ${file.path}`,
        sha: file.sha,
        branch: cfg.branch,
      }),
    });
    if (!delRes.ok) {
      const text = await delRes.text();
      return {
        ok: false,
        error: `GitHub delete ${file.path} (${delRes.status}): ${text.slice(0, 500)}`,
      };
    }
  }
  return { ok: true };
}

async function putFile(cfg, repoPath, contentBase64, message, existingSha) {
  const putUrl = `https://api.github.com/repos/${cfg.owner}/${cfg.name}/contents/${encodePathForUrl(repoPath)}`;
  const body = {
    message,
    content: contentBase64.replace(/\n/g, ""),
    branch: cfg.branch,
  };
  if (existingSha) body.sha = existingSha;
  const putRes = await fetch(putUrl, {
    method: "PUT",
    headers: {
      ...ghHeaders(cfg.token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!putRes.ok) {
    const text = await putRes.text();
    return {
      ok: false,
      error: `GitHub PUT ${repoPath} (${putRes.status}): ${text.slice(0, 500)}`,
    };
  }
  return { ok: true };
}

/**
 * Move content/blog-clean/<slug>/** to blog-staging, set unpublished_from_live on index.md, remove live tree.
 */
export async function unpublishBlogPostViaGitHub(slug) {
  try {
    const cfg = getGitHubBlogConfig();
    if (!cfg) {
      return { ok: false, error: "GitHub not configured (GITHUB_TOKEN + GITHUB_REPO)" };
    }

    const stagingBase = [cfg.root, "content", "blog-staging", slug].filter(Boolean).join("/");
    const liveBase = [cfg.root, "content", "blog-clean", slug].filter(Boolean).join("/");

    const stagingExists = (await listFilesRecursive(cfg, stagingBase)).length > 0;
    if (stagingExists) {
      return {
        ok: false,
        error:
          "A draft or folder already exists in blog-staging for this slug. Rename or delete it before unpublishing.",
      };
    }

    const liveFiles = await listFilesRecursive(cfg, liveBase);
    if (liveFiles.length === 0) {
      return { ok: false, error: "Published post not found in repository" };
    }

    liveFiles.sort((a, b) => a.path.length - b.path.length);

    for (const file of liveFiles) {
      const data = await getFileJson(cfg, file.path);
      if (!data || data.type !== "file" || !data.content) {
        return { ok: false, error: `Could not read ${file.path}` };
      }

      let contentB64 = String(data.content).replace(/\n/g, "");
      const stagingPath = file.path.startsWith(liveBase)
        ? file.path.replace(liveBase, stagingBase)
        : file.path.replace(/blog-clean\//, "blog-staging/");

      if (stagingPath.endsWith("index.md")) {
        const md = Buffer.from(contentB64, "base64").toString("utf8");
        const next = addUnpublishedFromLiveFlag(md);
        contentB64 = Buffer.from(next, "utf8").toString("base64");
      }

      const stagingMeta = await getFileJson(cfg, stagingPath);
      const existingSha = stagingMeta?.sha ?? null;

      const put = await putFile(
        cfg,
        stagingPath,
        contentB64,
        `chore(blog): unpublish ${slug} — ${file.path.split("/").pop()}`,
        existingSha,
      );
      if (!put.ok) return put;
    }

    const delLive = await deletePathsRecursive(cfg, liveBase);
    if (!delLive.ok) return delLive;

    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
