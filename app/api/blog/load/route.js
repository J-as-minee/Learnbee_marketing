import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { verifyBlogAdminRequest } from "@/lib/admin-auth";
import { getPostMarkdownViaGitHub } from "@/lib/github-blog-read";

export const runtime = "nodejs";

function verifyAuth(request) {
  return verifyBlogAdminRequest(request);
}

function parseAndRespond(slug, source, raw) {
  let data, content;
  try {
    ({ data, content } = matter(raw));
  } catch {
    return NextResponse.json({ error: "Failed to parse frontmatter" }, { status: 500 });
  }

  return NextResponse.json({
    slug,
    source,
    frontmatter: {
      title: data.title || "",
      date: data.date ? String(data.date) : "",
      author: data.author || "",
      description: data.description || "",
      categories: data.categories || [],
      tags: data.tags || [],
      show_contact_form:
        data.show_contact_form === false || data.show_contact_form === "false"
          ? false
          : true,
      thumbnail: data.thumbnail != null ? String(data.thumbnail) : "",
      thumbnail_alt: String(
        data.thumbnail_alt ?? data.thumbnailAlt ?? "",
      ).trim(),
    },
    content: content.trim(),
  });
}

export async function GET(request) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const source = searchParams.get("source") || "staging";

  const root = path.join(
    process.cwd(),
    "content",
    source === "live" ? "blog-clean" : "blog-staging",
  );
  const indexPath = path.join(root, slug, "index.md");

  if (fs.existsSync(indexPath)) {
    const raw = fs.readFileSync(indexPath, "utf8");
    return parseAndRespond(slug, source, raw);
  }

  const fromGitHub = await getPostMarkdownViaGitHub(slug, source);
  if (fromGitHub) {
    return parseAndRespond(slug, source, fromGitHub);
  }

  return NextResponse.json({ error: "Post not found" }, { status: 404 });
}
