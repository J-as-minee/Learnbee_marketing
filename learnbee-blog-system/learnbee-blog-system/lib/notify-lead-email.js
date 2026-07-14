/**
 * Notify internal inbox when a blog lead is submitted (Resend).
 */

import { cleanEnv } from "@/lib/clean-env";

/** True when lead forms can send team notification email (no DB required). */
export function isLeadEmailNotifyConfigured() {
  return Boolean(
    cleanEnv(process.env.RESEND_API_KEY) &&
      cleanEnv(process.env.LEADS_NOTIFY_EMAIL) &&
      cleanEnv(process.env.LEADS_EMAIL_FROM),
  );
}

export async function sendBlogLeadNotificationEmail(payload) {
  const key = cleanEnv(process.env.RESEND_API_KEY);
  const to = cleanEnv(process.env.LEADS_NOTIFY_EMAIL);
  const from = cleanEnv(process.env.LEADS_EMAIL_FROM);

  if (!key || !to || !from) {
    console.warn(
      "[leads] Skipping email: set RESEND_API_KEY, LEADS_NOTIFY_EMAIL, and LEADS_EMAIL_FROM",
    );
    return { ok: false, skipped: true, reason: "missing_env" };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(key);

  const lines = [
    `New blog lead submission`,
    ``,
    `Blog slug: ${payload.blog_slug}`,
    `Name: ${payload.full_name}`,
    `Work email: ${payload.work_email}`,
    `Company: ${payload.company_name}`,
    `Phone: ${payload.phone || "—"}`,
    `Message: ${payload.message || "—"}`,
    `Submitted (UTC): ${payload.created_at}`,
    `Reference: ${payload.id}`,
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
    replyTo: payload.work_email,
    subject: `Blog lead: ${payload.full_name} · ${payload.blog_slug}`,
    text: textBody,
    html: htmlBody,
  });

  if (error) {
    const detail =
      typeof error === "object" && error !== null
        ? JSON.stringify(error)
        : String(error);
    console.error("[leads] Resend API error:", detail);
    return { ok: false, error };
  }

  return { ok: true, id: data?.id };
}

/**
 * Notify internal inbox when a campaign page lead is submitted (Resend).
 * Same env vars as blog leads: RESEND_API_KEY, LEADS_NOTIFY_EMAIL, LEADS_EMAIL_FROM.
 */
export async function sendCampaignLeadNotificationEmail(payload) {
  const key = cleanEnv(process.env.RESEND_API_KEY);
  const to = cleanEnv(process.env.LEADS_NOTIFY_EMAIL);
  const from = cleanEnv(process.env.LEADS_EMAIL_FROM);

  if (!key || !to || !from) {
    console.warn(
      "[campaign-leads] Skipping email: set RESEND_API_KEY, LEADS_NOTIFY_EMAIL, and LEADS_EMAIL_FROM",
    );
    return { ok: false, skipped: true, reason: "missing_env" };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(key);

  const lines = [
    `New campaign lead submission`,
    ``,
    `Campaign: ${payload.campaign_source}`,
    `Name: ${payload.full_name}`,
    `Work email: ${payload.work_email}`,
    `Company: ${payload.company_name}`,
    `Phone: ${payload.phone || "—"}`,
    `Message: ${payload.message || "—"}`,
    `Submitted (UTC): ${payload.created_at}`,
    `Reference: ${payload.id}`,
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
    replyTo: payload.work_email,
    subject: `Campaign lead: ${payload.full_name} · ${payload.campaign_source}`,
    text: textBody,
    html: htmlBody,
  });

  if (error) {
    const detail =
      typeof error === "object" && error !== null
        ? JSON.stringify(error)
        : String(error);
    console.error("[campaign-leads] Resend API error:", detail);
    return { ok: false, error };
  }

  return { ok: true, id: data?.id };
}
