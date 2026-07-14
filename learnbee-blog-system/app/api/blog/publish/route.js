import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "node:fs";
import path from "node:path";
import { verifyBlogAdminRequest } from "@/lib/admin-auth";
import { publishBlogPostViaGitHub } from "@/lib/github-blog-publish";
import { stripUnpublishedFromLiveFlag } from "@/lib/blog-unpublished-meta";

export const runtime = "nodejs";

const STAGING_ROOT = path.join(process.cwd(), "content", "blog-staging");
const LIVE_ROOT = path.join(process.cwd(), "content", "blog-clean");

function verifyAuth(request) {
  return verifyBlogAdminRequest(request);
}

function revalidatePublishedPaths(slug) {
  // Revalidate the blog listing and the specific post
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
}

export async function POST(request) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await request.json();
  const stagingPath = path.join(STAGING_ROOT, slug);
  const livePath = path.join(LIVE_ROOT, slug);

  if (!fs.existsSync(stagingPath)) {
    const ghOnly = await publishBlogPostViaGitHub(slug);
    if (ghOnly.ok) {
      revalidatePublishedPaths(slug);
      return NextResponse.json({ ok: true, slug, via: "github" });
    }
    return NextResponse.json(
      { error: ghOnly.error || "Draft not found" },
      { status: 404 },
    );
  }

  try {
    fs.mkdirSync(LIVE_ROOT, { recursive: true });
    if (fs.existsSync(livePath)) {
      fs.rmSync(livePath, { recursive: true, force: true });
    }
    fs.renameSync(stagingPath, livePath);
    const liveIndex = path.join(livePath, "index.md");
    if (fs.existsSync(liveIndex)) {
      const raw = fs.readFileSync(liveIndex, "utf8");
      fs.writeFileSync(liveIndex, stripUnpublishedFromLiveFlag(raw), "utf8");
    }

    revalidatePublishedPaths(slug);
    return NextResponse.json({ ok: true, slug, via: "filesystem" });
  } catch (err) {
    const gh = await publishBlogPostViaGitHub(slug);
    if (gh.ok) {
      revalidatePublishedPaths(slug);
      return NextResponse.json({ ok: true, slug, via: "github" });
    }
    return NextResponse.json(
      {
        error:
          gh.error ||
          (err?.code === "EROFS" || err?.code === "EPERM"
            ? "Server filesystem is read-only. Set GITHUB_TOKEN + GITHUB_REPO in Vercel to publish via GitHub, or publish from a local dev environment."
            : String(err?.message || err)),
      },
      { status: 500 },
    );
  }
}
