/**
 * Notify internal inbox when someone subscribes from the blog sidebar (Resend).
 */

import { cleanEnv } from "@/lib/clean-env";

export async function sendNewsletterSignupNotificationEmail(payload) {
  const key = cleanEnv(process.env.RESEND_API_KEY);
  const to =
    cleanEnv(process.env.NEWSLETTER_NOTIFY_EMAIL) ||
    cleanEnv(process.env.LEADS_NOTIFY_EMAIL);
  const from =
    cleanEnv(process.env.NEWSLETTER_EMAIL_FROM) ||
    cleanEnv(process.env.LEADS_EMAIL_FROM);

  if (!key || !to || !from) {
    console.warn(
      "[newsletter] Skipping email: set RESEND_API_KEY, NEWSLETTER_NOTIFY_EMAIL (or LEADS_NOTIFY_EMAIL), and NEWSLETTER_EMAIL_FROM (or LEADS_EMAIL_FROM)",
    );
    return { ok: false, skipped: true, reason: "missing_env" };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(key);

  const lines = [
    `New Bsharp newsletter signup`,
    ``,
    `Signup type: Newsletter subscription`,
    `Source: ${payload.source || "—"}`,
    `Subscriber email: ${payload.email}`,
    `Page path: ${payload.page_path || "—"}`,
    `Blog slug (if from a post): ${payload.blog_slug || "—"}`,
    `Submitted (UTC): ${payload.submitted_at}`,
    ``,
    `Add this address to your newsletter list and send campaigns from there.`,
  ];

  const textBody = lines.join("\n");
  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  const htmlBody = `<pre style="font-family:system-ui,sans-serif;font-size:14px;white-space:pre-wrap">${esc(textBody)}</pre>`;

  const toNormalized = to.toLowerCase().trim();

  const { data, error } = await resend.emails.send({
    from,
    to: [toNormalized],
    replyTo: payload.email,
    subject: `[Newsletter] New signup: ${payload.email}`,
    text: textBody,
    html: htmlBody,
  });

  if (error) {
    const detail =
      typeof error === "object" && error !== null
        ? JSON.stringify(error)
        : String(error);
    console.error("[newsletter] Resend API error:", detail);
    return { ok: false, error };
  }

  return { ok: true, id: data?.id };
}
