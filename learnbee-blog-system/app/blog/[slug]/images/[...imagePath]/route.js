import { NextResponse } from "next/server";
import fs from "node:fs";
import { resolveBlogImageFile } from "@/lib/blog-image-fs";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  const { slug, imagePath } = await params;
  const referer = request.headers.get("referer") || "";
  const isPreviewContext = referer.includes("preview=");

  const resolved = resolveBlogImageFile(slug, imagePath, {
    preview: isPreviewContext,
  });

  if (!resolved) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const buffer = fs.readFileSync(resolved.filePath);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": resolved.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
