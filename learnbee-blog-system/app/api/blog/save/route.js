import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { verifyBlogAdminRequest } from "@/lib/admin-auth";
import { saveBlogPostViaGitHub } from "@/lib/github-blog-save";
import { isUnpublishedFromLiveMeta } from "@/lib/blog-unpublished-meta";

export const runtime = "nodejs";

const STAGING_ROOT = path.join(process.cwd(), "content", "blog-staging");
const LIVE_ROOT = path.join(process.cwd(), "content", "blog-clean");

function verifyAuth(request) {
  return verifyBlogAdminRequest(request);
}

function yamlQuote(value) {
  return JSON.stringify(String(value || ""));
}

function formatFrontmatterDate(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10);
}

export async function POST(request) {
  try {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    slug,
    title,
    author,
    description,
    categories,
    tags,
    product,
    content,
    source = "staging",
  } = body;

  const VALID_PRODUCTS = ["converse", "vantage"];

  const target = source === "live" ? "live" : "staging";
  const root = target === "live" ? LIVE_ROOT : STAGING_ROOT;

  if (!slug || !title) {
    return NextResponse.json({ error: "Slug and title are required" }, { status: 400 });
  }

  const postDir = path.join(root, slug);
  const indexPath = path.join(postDir, "index.md");

  let existing = null;
  if (fs.existsSync(indexPath)) {
    try {
      const raw = fs.readFileSync(indexPath, "utf8");
      existing = matter(raw).data;
    } catch {
      existing = null;
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const dateLine =
    target === "live" && existing?.date != null
      ? formatFrontmatterDate(existing.date)
      : today;

  const cats = (categories?.length ? categories : ["blogs"])
    .map((c) => `  - ${yamlQuote(c)}`)
    .join("\n");
  const tagsList = (tags?.length ? tags : ["general"])
    .map((t) => `  - ${yamlQuote(t)}`)
    .join("\n");

  // Stored bare + lowercase (e.g. `product: converse`), matching the backfill and
  // the validation gate in lib/blog.js. Falls back to the existing value, then to
  // the Converse default, so a save can never strip a post's product.
  const productValue = VALID_PRODUCTS.includes(product)
    ? product
    : VALID_PRODUCTS.includes(existing?.product)
      ? existing.product
      : "converse";

  const thumbnail =
    "thumbnail" in body
      ? yamlQuote(String(body.thumbnail ?? "").trim())
      : existing?.thumbnail != null
        ? yamlQuote(existing.thumbnail)
        : '""';
  const thumbnail_alt =
    "thumbnail_alt" in body
      ? yamlQuote(String(body.thumbnail_alt ?? "").trim())
      : existing?.thumbnail_alt != null || existing?.thumbnailAlt != null
        ? yamlQuote(
            String(existing.thumbnail_alt ?? existing.thumbnailAlt ?? "").trim(),
          )
        : '""';
  const image =
    target === "live" && existing?.image != null ? yamlQuote(existing.image) : '""';
  const coverImage =
    target === "live" && existing?.coverImage != null
      ? yamlQuote(existing.coverImage)
      : '""';

  const showContactForm =
    typeof body.show_contact_form === "boolean"
      ? body.show_contact_form
      : existing != null &&
          (existing.show_contact_form === false || existing.show_contact_form === "false")
        ? false
        : true;

  const preserveUnpublishedMeta =
    target === "staging" && isUnpublishedFromLiveMeta(existing);

  const md = `---
title: ${yamlQuote(title)}
date: ${yamlQuote(dateLine)}
author: ${yamlQuote(author || "Editorial Team")}
description: ${yamlQuote(description || "Add a concise summary for SEO.")}
categories:
${cats}
product: ${productValue}
tags:
${tagsList}
thumbnail: ${thumbnail}
thumbnail_alt: ${thumbnail_alt}
image: ${image}
coverImage: ${coverImage}
show_contact_form: ${showContactForm ? "true" : "false"}
${preserveUnpublishedMeta ? "unpublished_from_live: true\n" : ""}---

${content || ""}
`;

  try {
    fs.mkdirSync(postDir, { recursive: true });
    fs.writeFileSync(indexPath, md, "utf8");
    return NextResponse.json({ ok: true, slug, via: "filesystem", source: target });
  } catch (err) {
    const gh = await saveBlogPostViaGitHub(slug, md, target);
    if (gh.ok) {
      return NextResponse.json({ ok: true, slug, via: "github", source: target });
    }
    return NextResponse.json(
      {
        error:
          gh.error ||
          (err?.code === "EROFS" || err?.code === "EPERM"
            ? "Server filesystem is read-only. Set GITHUB_TOKEN + GITHUB_REPO in Vercel to save via GitHub, or save from a local dev environment."
            : String(err?.message || err)),
      },
      { status: 500 },
    );
  }
  } catch (err) {
    console.error("Save route error:", err?.message, err?.code, err?.stack);
    return NextResponse.json(
      { error: String(err?.message || err), code: err?.code },
      { status: 500 },
    );
  }
}
