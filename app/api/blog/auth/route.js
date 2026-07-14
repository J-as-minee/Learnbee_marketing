import { NextResponse } from "next/server";
import {
  isBlogAdminConfigured,
  verifyBlogAdminPassword,
} from "@/lib/admin-auth";

/** Ensure Node runtime so `process.env` is populated from Vercel (not Edge). */
export const runtime = "nodejs";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const password = body?.password;

  if (!isBlogAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin password not configured on server" },
      { status: 500 },
    );
  }

  if (verifyBlogAdminPassword(password)) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}
