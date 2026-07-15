import { NextResponse } from "next/server";
import { z } from "zod";
import { sendNewsletterSignupNotificationEmail } from "@/lib/notify-newsletter-email";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().trim().email().max(320),
  consent: z.literal(true),
  source: z.enum(["footer", "blog-sidebar"]).optional(),
  blog_slug: z.string().trim().max(120).optional(),
  page_path: z.string().trim().max(240).optional(),
  /** Honeypot */
  company_website: z.string().optional(),
});

export async function POST(request) {
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

  const data = parsed.data;
  if (String(data.company_website || "").trim() !== "") {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const submittedAt = new Date().toISOString();
  let emailResult = { ok: false };
  try {
    emailResult = await sendNewsletterSignupNotificationEmail({
      email: data.email.toLowerCase(),
      source: data.source || "blog-sidebar",
      blog_slug: data.blog_slug || "",
      page_path: data.page_path || "",
      submitted_at: submittedAt,
    });
  } catch (e) {
    console.error("[newsletter] notify email threw:", e);
  }

  if (emailResult?.skipped) {
    return NextResponse.json(
      {
        error:
          "Newsletter signup is not configured on this server (email delivery).",
      },
      { status: 503 },
    );
  }

  if (!emailResult?.ok) {
    return NextResponse.json(
      { error: "Could not send notification. Please try again later." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, email_sent: true }, { status: 201 });
}
