"use client";

import { useState } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export type NewsletterSource = "footer" | "blog-sidebar";

type NewsletterSubscribeFormProps = {
  source: NewsletterSource;
  heading?: string;
  description?: string;
  blogSlug?: string;
  pagePath?: string;
  previewMode?: boolean;
  variant?: "card" | "footer";
  /** Footer column layout — title/description rendered by SiteFooter */
  hideHeader?: boolean;
};

export default function NewsletterSubscribeForm({
  source,
  heading,
  description,
  blogSlug = "",
  pagePath = "",
  previewMode = false,
  variant = "card",
  hideHeader = false,
}: NewsletterSubscribeFormProps) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    if (!consent) {
      setErrorMsg("Please confirm you want to receive emails from us.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch(`${BASE_PATH}/api/blog/newsletter-subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          consent: true,
          source,
          blog_slug: blogSlug || undefined,
          page_path: pagePath || undefined,
          company_website: honeypot,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(
          data?.error === "Newsletter signup is not configured on this server (email delivery)."
            ? previewMode
              ? "Preview: email delivery is not configured on this server."
              : "Newsletter signup is not set up on this server yet."
            : data?.error || "Something went wrong. Please try again.",
        );
        setStatus("idle");
        return;
      }
      setStatus("success");
      setEmail("");
      setConsent(false);
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "success") {
    if (variant === "footer") {
      return (
        <>
          <p className="text-[14px] font-semibold text-white md:text-[15px]">You&apos;re subscribed.</p>
          <p className="mt-1 text-[13px] text-white/50 md:text-[14px]">Watch your inbox for updates from Bsharp.</p>
        </>
      );
    }
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-5 py-6">
        <p className="text-sm font-semibold text-emerald-900">You&apos;re subscribed</p>
        <p className="mt-1 text-sm text-emerald-800">
          Thanks — our team has been notified and you&apos;ll hear from us in your inbox.
        </p>
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div>
        {!hideHeader && heading ? (
          <p className="text-[13px] font-semibold text-white">{heading}</p>
        ) : null}
        {!hideHeader && description ? (
          <p className="mt-1 text-[12px] leading-relaxed text-white/50">{description}</p>
        ) : null}
        <form onSubmit={onSubmit} className={hideHeader ? "" : "mt-3"}>
          <label className="sr-only" htmlFor="footer-newsletter-email">
            Email
          </label>
          <div className="flex w-full max-w-full items-center rounded-full border border-white/12 bg-white/[0.04] px-3 focus-within:border-white/25 focus-within:bg-white/[0.06] sm:px-4">
            <input
              id="footer-newsletter-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="min-w-0 flex-1 bg-transparent py-2 text-[14px] text-white placeholder:text-white/35 outline-none sm:py-1.5"
            />
          </div>
          <input
            type="text"
            name="company_website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
          />
          <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-[12px] leading-relaxed text-white/45 md:text-[13px]">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-white/25 bg-transparent text-violet-500 focus:ring-0 focus:ring-offset-0 md:h-4 md:w-4"
            />
            <span>Occasional newsletter emails from Bsharp. Unsubscribe anytime.</span>
          </label>
          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-3 shrink-0 rounded-full bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[#0A0A12] transition hover:bg-white/90 disabled:opacity-60 sm:text-[13px]"
          >
            {status === "loading" ? "…" : "Subscribe"}
          </button>
          {errorMsg ? (
            <p className="mt-2 text-[12px] font-medium text-red-300/90 md:text-[13px]" role="alert">
              {errorMsg}
            </p>
          ) : null}
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50/80 to-white px-5 py-6 shadow-sm">
      {heading ? <h3 className="text-base font-semibold text-slate-900">{heading}</h3> : null}
      {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      {previewMode ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs text-amber-900">
          Preview: the form matches the live blog. Submissions need Resend + notify email env vars on
          the server.
        </p>
      ) : null}
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <label className="sr-only" htmlFor="newsletter-email">
          Email
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
        />
        <input
          type="text"
          name="company_website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
        />
        <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
          />
          <span>I agree to receive occasional newsletter emails from Bsharp.</span>
        </label>
        {errorMsg ? (
          <p className="text-sm font-medium text-red-600" role="alert">
            {errorMsg}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
        >
          {status === "loading" ? "Sending…" : "Subscribe"}
        </button>
      </form>
    </div>
  );
}
