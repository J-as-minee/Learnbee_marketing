"use client";

import { useEffect, useMemo } from "react";
import { X } from "lucide-react";

function stripHtml(html) {
  return String(html || "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function estimateReadingMinutes(html) {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function todayLabel() {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PreviewModal({
  isOpen,
  onClose,
  title,
  author,
  content,
  thumbnail,
  showContactForm,
}) {
  const readingMins = useMemo(() => estimateReadingMinutes(content), [content]);
  const dateText = useMemo(() => todayLabel(), []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-sm">
      <div className="flex h-full flex-col bg-white">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
              Preview
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-white">
          <article className="mx-auto max-w-4xl px-6 py-10 sm:py-12">
            {thumbnail ? (
              <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <img
                  src={thumbnail}
                  alt=""
                  className="h-auto w-full object-cover"
                />
              </div>
            ) : null}

            <div className="prose prose-lg prose-slate blog-reading-prose mx-auto">
              <p className="!mb-2 text-sm font-medium text-violet-700">
                {dateText} {readingMins ? `• ${readingMins} min read` : ""}
              </p>
              <h1 className="!mb-4">{title || "Untitled draft"}</h1>
              <p className="!mt-0 !mb-8 text-slate-500">
                By {author?.trim() || "Editorial Team"}
              </p>

              <div dangerouslySetInnerHTML={{ __html: content || "" }} />
            </div>

            {showContactForm ? (
              <section
                className="not-prose mx-auto mt-14 max-w-4xl border-t border-slate-200 pt-12"
                aria-label="Lead form preview"
              >
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                    Lead form preview
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">
                    Talk to our team
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm text-slate-600">
                    This is a placeholder for the live lead capture form. It appears
                    under the article when the post setting is enabled.
                  </p>
                </div>
              </section>
            ) : null}
          </article>
        </div>
      </div>
    </div>
  );
}
