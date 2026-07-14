import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "node:fs";
import path from "node:path";
import { verifyBlogAdminRequest } from "@/lib/admin-auth";
import { unpublishBlogPostViaGitHub } from "@/lib/github-blog-unpublish";
import { addUnpublishedFromLiveFlag } from "@/lib/blog-unpublished-meta";

export const runtime = "nodejs";

const STAGING_ROOT = path.join(process.cwd(), "content", "blog-staging");
const LIVE_ROOT = path.join(process.cwd(), "content", "blog-clean");

function verifyAuth(request) {
  return verifyBlogAdminRequest(request);
}

function revalidatePublishedPaths(slug) {
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
}

export async function POST(request) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await request.json();
  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const stagingPath = path.join(STAGING_ROOT, slug);
  const livePath = path.join(LIVE_ROOT, slug);
  const stagingIndex = path.join(stagingPath, "index.md");
  const liveIndex = path.join(livePath, "index.md");

  if (fs.existsSync(stagingPath)) {
    return NextResponse.json(
      {
        error:
          "A draft already exists for this slug in blog-staging. Delete or rename the draft before unpublishing the live post.",
      },
      { status: 409 },
    );
  }

  if (!fs.existsSync(livePath)) {
    const gh = await unpublishBlogPostViaGitHub(slug);
    if (gh.ok) {
      revalidatePublishedPaths(slug);
      return NextResponse.json({ ok: true, slug, via: "github" });
    }
    const msg = gh.error || "Published post not found";
    const conflict =
      msg.includes("already exists") || msg.includes("blog-staging for this slug");
    return NextResponse.json({ error: msg }, { status: conflict ? 409 : 404 });
  }

  try {
    fs.mkdirSync(STAGING_ROOT, { recursive: true });
    fs.renameSync(livePath, stagingPath);
    if (fs.existsSync(stagingIndex)) {
      const raw = fs.readFileSync(stagingIndex, "utf8");
      fs.writeFileSync(stagingIndex, addUnpublishedFromLiveFlag(raw), "utf8");
    }
    revalidatePublishedPaths(slug);
    return NextResponse.json({ ok: true, slug, via: "filesystem" });
  } catch (err) {
    const gh = await unpublishBlogPostViaGitHub(slug);
    if (gh.ok) {
      revalidatePublishedPaths(slug);
      return NextResponse.json({ ok: true, slug, via: "github" });
    }
    return NextResponse.json(
      {
        error:
          gh.error ||
          (err?.code === "EROFS" || err?.code === "EPERM"
            ? "Server filesystem is read-only. Set GITHUB_TOKEN + GITHUB_REPO in Vercel, or unpublish from a local dev environment."
            : String(err?.message || err)),
      },
      { status: 500 },
    );
  }
}
