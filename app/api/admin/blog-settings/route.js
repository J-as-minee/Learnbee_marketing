import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { verifyBlogAdminRequest } from "@/lib/admin-auth";
import {
  mergeBlogSettings,
  loadBlogSettingsRaw,
  invalidateBlogSettingsCache,
} from "@/lib/blog-settings";
import { saveBlogSettingsViaGitHub } from "@/lib/github-blog-save";

export const runtime = "nodejs";

const bodySchema = z.object({
  sidePanel: z
    .object({
      postListMode: z.enum(["related", "recent", "custom"]),
      customSlugs: z.array(z.string()).max(20).optional(),
    })
    .optional(),
  social: z
    .object({
      twitter: z.string().max(500).optional(),
      linkedin: z.string().max(500).optional(),
      youtube: z.string().max(500).optional(),
      facebook: z.string().max(500).optional(),
      instagram: z.string().max(500).optional(),
    })
    .optional(),
  newsletter: z
    .object({
      heading: z.string().max(200).optional(),
      description: z.string().max(2000).optional(),
    })
    .optional(),
});

export async function GET(request) {
  if (!verifyBlogAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const raw = await loadBlogSettingsRaw();
  return NextResponse.json(mergeBlogSettings(raw));
}

export async function PUT(request) {
  if (!verifyBlogAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const current = mergeBlogSettings(await loadBlogSettingsRaw());
  const incoming = parsed.data;
  const merged = mergeBlogSettings({
    ...current,
    sidePanel: {
      ...current.sidePanel,
      ...(incoming.sidePanel || {}),
    },
    social: {
      ...current.social,
      ...(incoming.social || {}),
    },
    newsletter: {
      ...current.newsletter,
      ...(incoming.newsletter || {}),
    },
  });

  const text = `${JSON.stringify(merged, null, 2)}\n`;
  const dataDir = path.join(process.cwd(), "data");
  const filePath = path.join(dataDir, "blog-settings.json");

  let wroteLocal = false;
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(filePath, text, "utf8");
    wroteLocal = true;
  } catch (err) {
    console.warn("[blog-settings] local write:", err?.message || err);
  }

  if (!wroteLocal) {
    const ghOnly = await saveBlogSettingsViaGitHub(text);
    if (!ghOnly.ok) {
      return NextResponse.json(
        {
          error:
            ghOnly.error ||
            "Could not save settings (filesystem read-only and GitHub save failed).",
        },
        { status: 500 },
      );
    }
    invalidateBlogSettingsCache();
    return NextResponse.json({ ok: true, via: "github" });
  }

  const gh = await saveBlogSettingsViaGitHub(text);
  if (!gh.ok && process.env.VERCEL) {
    console.warn("[blog-settings] GitHub sync after local write:", gh.error);
  }

  invalidateBlogSettingsCache();
  return NextResponse.json({ ok: true, via: wroteLocal ? "filesystem" : "github" });
}
