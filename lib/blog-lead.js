/**
 * Blog post lead form: frontmatter flag + shared parsing.
 * Default: form is shown unless `show_contact_form` is explicitly false.
 */

export function parseShowContactForm(data) {
  const v = data?.show_contact_form;
  if (v === false || v === "false" || v === "no" || v === 0 || v === "0") {
    return false;
  }
  return true;
}

/** Public URL for privacy policy (consent copy). Override via NEXT_PUBLIC_PRIVACY_POLICY_URL. */
export function getPrivacyPolicyUrl() {
  const u = String(process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL || "").trim();
  if (u) return u;
  return "https://learnbee.ai/";
}

export const LEADS_MAX_PER_IP_PER_HOUR = 25;
