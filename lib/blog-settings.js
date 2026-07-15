import fs from "node:fs";
import path from "node:path";
import { unstable_cache, revalidateTag } from "next/cache";
import {
  getGitHubBlogConfig,
  ghHeaders,
  encodePathForUrl,
} from "@/lib/github-blog";

const SETTINGS_SEGMENTS = ["data", "blog-settings.json"];
const CACHE_TAG = "blog-site-settings";

export const DEFAULT_BLOG_SETTINGS = {
  version: 1,
  sidePanel: {
    postListMode: "related",
    customSlugs: [],
  },
  social: {
    twitter: "",
    linkedin: "",
    youtube: "",
    facebook: "",
    instagram: "",
  },
  newsletter: {
    heading: "Subscribe to our newsletter",
    description:
      "Get occasional updates from Learnbee. When someone subscribes, we email your team so you can add them to your newsletter list.",
  },
};

async function fetchBlogSettingsFromGitHub() {
  const cfg = getGitHubBlogConfig();
  if (!cfg) return null;
  const repoPath = [cfg.root, ...SETTINGS_SEGMENTS].filter(Boolean).join("/");
  const url = `https://api.github.com/repos/${cfg.owner}/${cfg.name}/contents/${encodePathForUrl(repoPath)}?ref=${encodeURIComponent(cfg.branch)}`;
  const res = await fetch(url, { headers: ghHeaders(cfg.token) });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  let data;
  try {
    data = await res.json();
  } catch {
    return null;
  }
  if (!data || data.type !== "file" || typeof data.content !== "string") return null;
  const b64 = String(data.content).replace(/\s/g, "");
  try {
    return JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function readBlogSettingsFromDisk() {
  const p = path.join(process.cwd(), ...SETTINGS_SEGMENTS);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

/** Uncached read (admin save merge, tests). */
export async function loadBlogSettingsRaw() {
  const cfg = getGitHubBlogConfig();
  if (cfg) {
    const remote = await fetchBlogSettingsFromGitHub();
    if (remote && typeof remote === "object") return remote;
  }
  return readBlogSettingsFromDisk() || {};
}

export function mergeBlogSettings(raw) {
  const r = raw && typeof raw === "object" ? raw : {};
  const mode = ["related", "recent", "custom"].includes(r?.sidePanel?.postListMode)
    ? r.sidePanel.postListMode
    : DEFAULT_BLOG_SETTINGS.sidePanel.postListMode;
  return {
    version: typeof r.version === "number" ? r.version : DEFAULT_BLOG_SETTINGS.version,
    sidePanel: {
      postListMode: mode,
      customSlugs: Array.isArray(r?.sidePanel?.customSlugs)
        ? r.sidePanel.customSlugs.map((s) => String(s).trim()).filter(Boolean).slice(0, 20)
        : [],
    },
    social: {
      twitter: String(r?.social?.twitter ?? "").trim().slice(0, 500),
      linkedin: String(r?.social?.linkedin ?? "").trim().slice(0, 500),
      youtube: String(r?.social?.youtube ?? "").trim().slice(0, 500),
      facebook: String(r?.social?.facebook ?? "").trim().slice(0, 500),
      instagram: String(r?.social?.instagram ?? "").trim().slice(0, 500),
    },
    newsletter: {
      heading: String(
        r?.newsletter?.heading ?? DEFAULT_BLOG_SETTINGS.newsletter.heading,
      ).slice(0, 200),
      description: String(
        r?.newsletter?.description ?? DEFAULT_BLOG_SETTINGS.newsletter.description,
      ).slice(0, 2000),
    },
  };
}

export const getBlogSettings = unstable_cache(
  async () => mergeBlogSettings(await loadBlogSettingsRaw()),
  ["blog-settings-merged-v1"],
  { revalidate: 120, tags: [CACHE_TAG] },
);

export function invalidateBlogSettingsCache() {
  revalidateTag(CACHE_TAG);
}
