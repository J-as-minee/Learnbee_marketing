import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import BlogNewsletterForm from "@/components/blog/BlogNewsletterForm";
import { getBlogPreviewToken } from "@/lib/preview";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export { BLOG_POST_SIDEBAR_WIDGETS_ENABLED } from "@/lib/blog-sidebar-flags";

function normalizeUrl(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s.replace(/^\/+/, "")}`;
}

function formatSidebarDate(date) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function postHref(slug, previewMode) {
  if (previewMode) {
    const token = encodeURIComponent(getBlogPreviewToken());
    return `${BASE_PATH}/blog/${slug}?preview=${token}`;
  }
  return `${BASE_PATH}/blog/${slug}`;
}

function sidebarPostsTitle(mode) {
  if (mode === "recent") return "Recent posts";
  if (mode === "custom") return "More to read";
  return "Related posts";
}

export default function BlogPostSidebar({
  settings,
  sidebarPosts,
  blogSlug,
  previewMode = false,
}) {
  const social = settings?.social || {};
  const entries = [
    { key: "linkedin", url: normalizeUrl(social.linkedin), Icon: Linkedin, label: "LinkedIn" },
    { key: "twitter", url: normalizeUrl(social.twitter), Icon: Twitter, label: "X / Twitter" },
    { key: "youtube", url: normalizeUrl(social.youtube), Icon: Youtube, label: "YouTube" },
    { key: "facebook", url: normalizeUrl(social.facebook), Icon: Facebook, label: "Facebook" },
    { key: "instagram", url: normalizeUrl(social.instagram), Icon: Instagram, label: "Instagram" },
  ].filter((x) => x.url);

  const listMode = settings?.sidePanel?.postListMode || "related";

  return (
    <div className="flex flex-col gap-10">
      {sidebarPosts?.length ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {sidebarPostsTitle(listMode)}
          </h2>
          <ul className="mt-4 space-y-4">
            {sidebarPosts.map((p) => {
              const imgAlt =
                (p.thumbnailAlt && String(p.thumbnailAlt).trim()) ||
                `Thumbnail: ${p.title}`;
              return (
                <li key={p.slug}>
                  <Link
                    href={postHref(p.slug, previewMode)}
                    className="group flex gap-3 text-sm font-medium text-slate-900 transition hover:text-violet-700"
                  >
                    <div className="relative h-14 w-[5.5rem] shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {p.thumbnailImage ? (
                        <Image
                          src={p.thumbnailImage}
                          alt={imgAlt}
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="88px"
                        />
                      ) : (
                        <div
                          className="h-full w-full bg-gradient-to-br from-violet-100 via-indigo-50 to-slate-100"
                          aria-hidden
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="line-clamp-2 group-hover:underline">{p.title}</span>
                      {p.date ? (
                        <span className="mt-0.5 block text-xs font-normal text-slate-500">
                          {formatSidebarDate(p.date)}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <BlogNewsletterForm
        blogSlug={blogSlug}
        heading={settings?.newsletter?.heading}
        description={settings?.newsletter?.description}
        previewMode={previewMode}
      />

      {entries.length > 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Follow us
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {entries.map(({ key, url, Icon, label }) => (
              <li key={key}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
