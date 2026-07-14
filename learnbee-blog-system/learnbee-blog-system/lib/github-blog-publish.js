/**
 * Publish draft (staging → blog-clean) via GitHub Contents API when local FS is read-only.
 */

import {
  getGitHubBlogConfig,
  ghHeaders,
  encodePathForUrl,
  listFilesRecursive,
} from "@/lib/github-blog";
import { stripUnpublishedFromLiveFlag } from "@/lib/blog-unpublished-meta";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

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
        message: `chore(blog): remove before publish ${file.path}`,
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
 * Copy content/blog-staging/<slug>/** to content/blog-staging → blog-clean in repo, then remove staging tree.
 */
export async function publishBlogPostViaGitHub(slug) {
  try {
    const cfg = getGitHubBlogConfig();
    if (!cfg) {
      return { ok: false, error: "GitHub not configured (GITHUB_TOKEN + GITHUB_REPO)" };
    }

    const stagingBase = [cfg.root, "content", "blog-staging", slug].filter(Boolean).join("/");
    const liveBase = [cfg.root, "content", "blog-clean", slug].filter(Boolean).join("/");

    const stagingFiles = await listFilesRecursive(cfg, stagingBase);
    if (stagingFiles.length === 0) {
      return { ok: false, error: "Draft not found in repository" };
    }

    const liveExists = (await listFilesRecursive(cfg, liveBase)).length > 0;
    if (liveExists) {
      const del = await deletePathsRecursive(cfg, liveBase);
      if (!del.ok) return del;
    }

    stagingFiles.sort((a, b) => a.path.length - b.path.length);

    for (const file of stagingFiles) {
      const data = await getFileJson(cfg, file.path);
      if (!data || data.type !== "file" || !data.content) {
        return { ok: false, error: `Could not read ${file.path}` };
      }

      let contentB64 = String(data.content).replace(/\n/g, "");
      const livePath = file.path.startsWith(stagingBase)
        ? file.path.replace(stagingBase, liveBase)
        : file.path.replace(/blog-staging\//, "blog-clean/");

      if (livePath.endsWith("index.md")) {
        const md = Buffer.from(contentB64, "base64").toString("utf8");
        const livePattern = `/blog/${slug}/images/`;
        let next = md;
        for (const previewPattern of [
          `${BASE_PATH}/preview/blog/${slug}/images/`,
          `/preview/blog/${slug}/images/`,
        ]) {
          if (next.includes(previewPattern)) {
            next = next.split(previewPattern).join(livePattern);
          }
        }
        next = stripUnpublishedFromLiveFlag(next);
        contentB64 = Buffer.from(next, "utf8").toString("base64");
      }

      const liveData = await getFileJson(cfg, livePath);
      const existingSha = liveData?.sha ?? null;

      const put = await putFile(
        cfg,
        livePath,
        contentB64,
        `chore(blog): publish ${slug} — ${file.path.split("/").pop()}`,
        existingSha,
      );
      if (!put.ok) return put;
    }

    const delStaging = await deletePathsRecursive(cfg, stagingBase);
    if (!delStaging.ok) return delStaging;

    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
