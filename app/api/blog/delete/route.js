import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "node:fs";
import path from "node:path";
import { verifyBlogAdminRequest } from "@/lib/admin-auth";
import { deleteBlogPostViaGitHub } from "@/lib/github-blog-delete";

export const runtime = "nodejs";

function verifyAuth(request) {
  return verifyBlogAdminRequest(request);
}

function revalidateDeletedPaths(source, slug) {
  // Revalidate blog listing to remove the deleted post
  revalidatePath("/blog");
  if (source === "live") {
    revalidatePath(`/blog/${slug}`);
  }
}

function isAlreadyMissingError(errorText) {
  return String(errorText || "").toLowerCase().includes("post not found in repository");
}

export async function POST(request) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, source } = await request.json();
  const root = path.join(
    process.cwd(),
    "content",
    source === "live" ? "blog-clean" : "blog-staging",
  );
  const postPath = path.join(root, slug);

  const existsLocal = fs.existsSync(postPath);

  if (existsLocal) {
    try {
      fs.rmSync(postPath, { recursive: true, force: true });
      revalidateDeletedPaths(source, slug);
      return NextResponse.json({ ok: true, via: "filesystem" });
    } catch (err) {
      // Vercel / read-only FS: fall through to GitHub
      const gh = await deleteBlogPostViaGitHub(slug, source);
      if (gh.ok) {
        revalidateDeletedPaths(source, slug);
        return NextResponse.json({ ok: true, via: "github" });
      }
      // Deleting a missing post should be idempotent/successful.
      if (isAlreadyMissingError(gh.error)) {
        revalidateDeletedPaths(source, slug);
        return NextResponse.json({ ok: true, via: "already-missing" });
      }
      return NextResponse.json(
        {
          error:
            gh.error ||
            (err?.code === "EROFS" || err?.code === "EPERM"
              ? "Server filesystem is read-only. Set GITHUB_TOKEN + GITHUB_REPO in Vercel to delete via GitHub, or delete the folder via git locally."
              : String(err?.message || err)),
        },
        { status: 503 },
      );
    }
  }

  const gh = await deleteBlogPostViaGitHub(slug, source);
  if (gh.ok) {
    revalidateDeletedPaths(source, slug);
    return NextResponse.json({ ok: true, via: "github" });
  }
  // Deleting a missing post should be idempotent/successful.
  if (isAlreadyMissingError(gh.error)) {
    revalidateDeletedPaths(source, slug);
    return NextResponse.json({ ok: true, via: "already-missing" });
  }

  return NextResponse.json(
    { error: gh.error || "Post not found" },
    { status: 404 },
  );
}
