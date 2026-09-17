/**
 * Deliver a Contact-page submission to the team inbox (Resend).
 *
 * Env: RESEND_API_KEY; CONTACT_EMAIL_FROM (else LEADS_EMAIL_FROM, else
 * NEWSLETTER_EMAIL_FROM) — a sender on a Resend-verified domain;
 * CONTACT_NOTIFY_EMAIL (optional, defaults to admin@learnbee.ai).
 */

import { cleanEnv } from "@/lib/clean-env";

const DEFAULT_TO = "admin@learnbee.ai";

export async function sendContactEmail(payload) {
  const key = cleanEnv(process.env.RESEND_API_KEY);
  const to = cleanEnv(process.env.CONTACT_NOTIFY_EMAIL) || DEFAULT_TO;
  const from =
    cleanEnv(process.env.CONTACT_EMAIL_FROM) ||
    cleanEnv(process.env.LEADS_EMAIL_FROM) ||
    cleanEnv(process.env.NEWSLETTER_EMAIL_FROM);

  if (!key || !from) {
    console.warn(
      "[contact] Skipping email: set RESEND_API_KEY and CONTACT_EMAIL_FROM (or LEADS_EMAIL_FROM / NEWSLETTER_EMAIL_FROM)",
    );
    return { ok: false, skipped: true, reason: "missing_env" };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(key);

  const rows = [
    ["Name", payload.name],
    ["Email", payload.email],
    ["Phone", payload.phone || "—"],
    ["Company", payload.company || "—"],
    ["Page", payload.page_path || "/contact"],
    ["Submitted (UTC)", payload.submitted_at],
  ];

  const textBody = [
    "New message from the Learnbee contact form",
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "Message:",
    payload.message,
  ].join("\n");

  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const htmlBody = `
<div style="font-family:system-ui,-apple-system,sans-serif;font-size:14px;color:#14101f;max-width:560px">
  <p style="font-size:16px;font-weight:600;margin:0 0 16px">New message from the Learnbee contact form</p>
  <table style="border-collapse:collapse;width:100%;margin-bottom:16px">
    ${rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:6px 12px 6px 0;color:#6b6480;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:6px 0">${esc(v)}</td></tr>`,
      )
      .join("")}
  </table>
  <p style="color:#6b6480;margin:0 0 6px">Message</p>
  <div style="white-space:pre-wrap;border:1px solid #eceaf3;border-radius:10px;padding:12px 14px;line-height:1.55">${esc(payload.message)}</div>
  <p style="color:#6b6480;font-size:12px;margin-top:16px">Reply to this email to answer ${esc(payload.name)} directly.</p>
</div>`;

  const { data, error } = await resend.emails.send({
    from,
    to: [to.toLowerCase().trim()],
    replyTo: payload.email,
    subject: `[Contact] ${payload.name}${payload.company ? ` (${payload.company})` : ""}`,
    text: textBody,
    html: htmlBody,
  });

  if (error) {
    const detail =
      typeof error === "object" && error !== null ? JSON.stringify(error) : String(error);
    console.error("[contact] Resend API error:", detail);
    return { ok: false, error };
  }

  return { ok: true, id: data?.id };
}
