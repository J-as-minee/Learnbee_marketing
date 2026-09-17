import { NextResponse } from "next/server";
import { z } from "zod";
import { sendContactEmail } from "@/lib/notify-contact-email";

export const runtime = "nodejs";

const bodySchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(120, "Name is too long."),
  email: z.string().trim().email("Please enter a valid email address.").max(320),
  phone: z.string().trim().max(40, "Phone number is too long.").optional().default(""),
  company: z.string().trim().max(160, "Company name is too long.").optional().default(""),
  message: z.string().trim().min(1, "Please enter a message.").max(5000, "Message is too long (5,000 characters max)."),
  page_path: z.string().trim().max(240).optional(),
  /** Honeypot — real visitors never see or fill this. */
  website: z.string().optional(),
});

export async function POST(request) {
  let json;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message || "Please check the form and try again.";
    return NextResponse.json({ error: first }, { status: 400 });
  }

  const data = parsed.data;

  // A bot filled the hidden field: answer as if it worked, send nothing.
  if (String(data.website || "").trim() !== "") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  let result = { ok: false };
  try {
    result = await sendContactEmail({
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      company: data.company,
      message: data.message,
      page_path: data.page_path || "/contact",
      submitted_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[contact] send threw:", e);
  }

  if (result?.skipped) {
    return NextResponse.json(
      { error: "The contact form isn't available right now. Please email admin@learnbee.ai." },
      { status: 503 },
    );
  }
  if (!result?.ok) {
    return NextResponse.json(
      { error: "We couldn't send your message. Please try again, or email admin@learnbee.ai." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
