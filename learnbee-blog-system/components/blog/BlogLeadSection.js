import { isLeadEmailNotifyConfigured } from "@/lib/notify-lead-email";
import BlogLeadForm from "@/components/blog/BlogLeadForm";

/**
 * Lead capture below article body when `show_contact_form` is on.
 * - Live blog: hidden if Resend notify env is not set.
 * - Draft preview: always shown so editors see layout; submit works only when email is configured.
 */
export default function BlogLeadSection({ blogSlug, show, previewMode = false }) {
  if (!show) return null;

  const emailOk = isLeadEmailNotifyConfigured();
  if (!previewMode && !emailOk) return null;

  return (
    <section
      className="not-prose mx-auto mt-14 max-w-4xl border-t border-slate-200 pt-12"
      aria-labelledby="blog-lead-form-heading"
    >
      <BlogLeadForm
        blogSlug={blogSlug}
        submissionsActive={emailOk}
        previewMode={previewMode}
      />
    </section>
  );
}
