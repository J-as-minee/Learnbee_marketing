import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { verifyBlogAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request) {
  if (!verifyBlogAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    return NextResponse.json(
      {
        error:
          "Image storage is not configured. Add BLOB_READ_WRITE_TOKEN from your Vercel Blob store (Project → Storage → Blob → .env.local or Vercel env), then restart the dev server.",
      },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const slug = formData.get("slug");

  if (!file || !slug) {
    return NextResponse.json({ error: "Missing file or slug" }, { status: 400 });
  }

  const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
  const pathname = `blog/${slug}/images/${filename}`;

  try {
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
    });

    // Return the Blob URL directly - it's instantly available
    return NextResponse.json({
      path: blob.url,
      filename,
      via: "vercel-blob",
    });
  } catch (error) {
    console.error("Blob upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
