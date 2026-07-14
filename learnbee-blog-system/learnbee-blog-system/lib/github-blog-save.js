/**
 * Save draft markdown via GitHub Contents API (Vercel / read-only FS).
 */

import {
  getGitHubBlogConfig,
  ghHeaders,
  encodePathForUrl,
} from "@/lib/github-blog";

/**
 * @param {string} slug
 * @param {string} markdownContent full index.md body (frontmatter + body)
 * @param {"staging"|"live"} [target] blog-staging vs blog-clean (default staging)
 */
export async function saveBlogPostViaGitHub(slug, markdownContent, target = "staging") {
  const cfg = getGitHubBlogConfig();
  if (!cfg) {
    return { ok: false, error: "GitHub not configured (GITHUB_TOKEN + GITHUB_REPO)" };
  }

  const subdir = target === "live" ? "blog-clean" : "blog-staging";
  const repoPath = [cfg.root, "content", subdir, slug, "index.md"]
    .filter(Boolean)
    .join("/");

  const getUrl = `https://api.github.com/repos/${cfg.owner}/${cfg.name}/contents/${encodePathForUrl(repoPath)}?ref=${encodeURIComponent(cfg.branch)}`;
  const getRes = await fetch(getUrl, { headers: ghHeaders(cfg.token) });

  let existingSha = null;
  if (getRes.status === 200) {
    try {
      const file = await getRes.json();
      if (file?.sha) existingSha = file.sha;
    } catch {
      /* ignore */
    }
  } else if (getRes.status !== 404) {
    const text = await getRes.text();
    return {
      ok: false,
      error: `GitHub GET ${subdir}/${slug} failed (${getRes.status}): ${text.slice(0, 500)}`,
    };
  }

  const content = Buffer.from(String(markdownContent ?? ""), "utf8").toString("base64");

  const putUrl = `https://api.github.com/repos/${cfg.owner}/${cfg.name}/contents/${encodePathForUrl(repoPath)}`;
  const verb = target === "live" ? "update published" : "save draft";
  const body = {
    message: `chore(blog): ${verb} ${slug}`,
    content,
    branch: cfg.branch,
  };
  if (existingSha) {
    body.sha = existingSha;
  }

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
      error: `GitHub save ${subdir} (${putRes.status}): ${text.slice(0, 500)}`,
    };
  }

  return { ok: true };
}

/**
 * Upload a single image under content/blog-staging|blog-clean/<slug>/images/<filename> via GitHub Contents API.
 * @param {"staging"|"live"} [target]
 */
export async function uploadBlogImageViaGitHub(slug, safeName, fileBuffer, target = "staging") {
  const cfg = getGitHubBlogConfig();
  if (!cfg) {
    return { ok: false, error: "GitHub not configured (GITHUB_TOKEN + GITHUB_REPO)" };
  }

  const subdir = target === "live" ? "blog-clean" : "blog-staging";
  const repoPath = [cfg.root, "content", subdir, slug, "images", safeName]
    .filter(Boolean)
    .join("/");

  const getUrl = `https://api.github.com/repos/${cfg.owner}/${cfg.name}/contents/${encodePathForUrl(repoPath)}?ref=${encodeURIComponent(cfg.branch)}`;
  const getRes = await fetch(getUrl, { headers: ghHeaders(cfg.token) });

  let existingSha = null;
  if (getRes.status === 200) {
    try {
      const file = await getRes.json();
      if (file?.sha) existingSha = file.sha;
    } catch {
      /* ignore */
    }
  } else if (getRes.status !== 404) {
    const text = await getRes.text();
    return {
      ok: false,
      error: `GitHub GET image failed (${getRes.status}): ${text.slice(0, 500)}`,
    };
  }

  const content = Buffer.from(fileBuffer).toString("base64");
  const putUrl = `https://api.github.com/repos/${cfg.owner}/${cfg.name}/contents/${encodePathForUrl(repoPath)}`;
  const body = {
    message: `chore(blog): upload image ${slug}/${safeName}`,
    content,
    branch: cfg.branch,
  };
  if (existingSha) {
    body.sha = existingSha;
  }

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
      error: `GitHub upload image failed (${putRes.status}): ${text.slice(0, 500)}`,
    };
  }

  return { ok: true };
}

/**
 * Persist `data/blog-settings.json` via GitHub Contents API (Vercel read-only disk).
 * @param {string} jsonText UTF-8 JSON (pretty-printed is fine)
 */
export async function saveBlogSettingsViaGitHub(jsonText) {
  const cfg = getGitHubBlogConfig();
  if (!cfg) {
    return { ok: false, error: "GitHub not configured (GITHUB_TOKEN + GITHUB_REPO)" };
  }

  const repoPath = [cfg.root, "data", "blog-settings.json"].filter(Boolean).join("/");
  const getUrl = `https://api.github.com/repos/${cfg.owner}/${cfg.name}/contents/${encodePathForUrl(repoPath)}?ref=${encodeURIComponent(cfg.branch)}`;
  const getRes = await fetch(getUrl, { headers: ghHeaders(cfg.token) });

  let existingSha = null;
  if (getRes.status === 200) {
    try {
      const file = await getRes.json();
      if (file?.sha) existingSha = file.sha;
    } catch {
      /* ignore */
    }
  } else if (getRes.status !== 404) {
    const text = await getRes.text();
    return {
      ok: false,
      error: `GitHub GET blog-settings failed (${getRes.status}): ${text.slice(0, 500)}`,
    };
  }

  const content = Buffer.from(String(jsonText ?? ""), "utf8").toString("base64");
  const putUrl = `https://api.github.com/repos/${cfg.owner}/${cfg.name}/contents/${encodePathForUrl(repoPath)}`;
  const body = {
    message: "chore(blog): update blog settings",
    content,
    branch: cfg.branch,
  };
  if (existingSha) {
    body.sha = existingSha;
  }

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
      error: `GitHub save blog-settings (${putRes.status}): ${text.slice(0, 500)}`,
    };
  }

  return { ok: true };
}
