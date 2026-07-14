import { NextResponse } from "next/server";
import { verifyBlogAdminRequest } from "@/lib/admin-auth";
import { saveDraftToKV, getDraftFromKV, deleteDraftFromKV, listUserDrafts } from "@/lib/draft-storage";

export const runtime = "nodejs";

// Get a specific draft or list all drafts
export async function GET(request) {
  if (!verifyBlogAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  const slug = searchParams.get("slug");

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  // If slug provided, get specific draft
  if (slug) {
    const draft = await getDraftFromKV(sessionId, slug);
    return NextResponse.json({ draft });
  }

  // Otherwise list all drafts for this session
  const drafts = await listUserDrafts(sessionId);
  return NextResponse.json({ drafts });
}

// Save a draft
export async function POST(request) {
  if (!verifyBlogAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { sessionId, slug, ...draftData } = body;

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  const result = await saveDraftToKV(sessionId, slug, draftData);

  if (result.ok) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: result.error }, { status: 500 });
}

// Delete a draft
export async function DELETE(request) {
  if (!verifyBlogAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  const slug = searchParams.get("slug");

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  const result = await deleteDraftFromKV(sessionId, slug);

  if (result.ok) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: result.error }, { status: 500 });
}
