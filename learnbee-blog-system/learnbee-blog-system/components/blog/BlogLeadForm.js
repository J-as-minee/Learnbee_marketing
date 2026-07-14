"use client";

import { useState } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function BlogLeadForm({
  blogSlug,
  submissionsActive = true,
  previewMode = false,
}) {
  const [workEmail, setWorkEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState("idle");
  const [emailSent, setEmailSent] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    if (!submissionsActive) {
      setErrorMsg(
        "Submissions are not enabled (set RESEND_API_KEY, LEADS_NOTIFY_EMAIL, and LEADS_EMAIL_FROM on the server).",
      );
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch(`${BASE_PATH}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          work_email: workEmail,
          full_name: fullName,
          company_name: companyName,
          phone: phone || "",
          message: message || "",
          blog_slug: blogSlug,
          consent_contact: true,
          company_website: honeypot,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(
          data?.error === "Too many submissions. Please try again later."
            ? data.error
            : data?.error || "Something went wrong. Please try again.",
        );
        setStatus("idle");
        return;
      }
      setEmailSent(data?.email_sent !== false);
      setStatus("success");
      setWorkEmail("");
      setFullName("");
      setCompanyName("");
      setPhone("");
      setMessage("");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-6 py-8 text-center">
        <p className="text-lg font-semibold text-emerald-900">Thank you</p>
        <p className="mt-2 text-sm text-emerald-800">
          We received your details and will get back to you soon.
        </p>
        {!emailSent ? (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-left text-xs text-amber-950">
            Your message was saved. Our team notification email could not be sent (mail
            settings). We will still use your details from this submission — or contact us
            directly if you need an immediate reply.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2
          id="blog-lead-form-heading"
          className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
        >
          Get in touch with our team
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Share your work email and we&apos;ll reach out about Bsharp Converse.
        </p>
      </div>

      {!submissionsActive ? (
        <div
          className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
            previewMode
              ? "border-amber-200 bg-amber-50 text-amber-950"
              : "border-slate-200 bg-slate-50 text-slate-700"
          }`}
          role="status"
        >
          {previewMode
            ? "Draft preview: the form is shown as it will appear when published. Add RESEND_API_KEY, LEADS_NOTIFY_EMAIL, and LEADS_EMAIL_FROM on the server to accept real submissions from here."
            : "Lead capture is not configured on this server."}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Honeypot */}
        <div
          className="pointer-events-none absolute -left-[9999px] top-0 h-px w-px overflow-hidden opacity-0"
          aria-hidden="true"
        >
          <label htmlFor="blog-lead-company-website">Company website</label>
          <input
            id="blog-lead-company-website"
            name="company_website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="blog-lead-email"
            className="mb-1 block text-sm font-medium text-slate-800"
          >
            Work email <span className="text-red-500">*</span>
          </label>
          <input
            id="blog-lead-email"
            type="email"
            required
            autoComplete="email"
            value={workEmail}
            onChange={(e) => setWorkEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="blog-lead-name"
              className="mb-1 block text-sm font-medium text-slate-800"
            >
              Your name <span className="text-red-500">*</span>
            </label>
            <input
              id="blog-lead-name"
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
          <div>
            <label
              htmlFor="blog-lead-company"
              className="mb-1 block text-sm font-medium text-slate-800"
            >
              Company name <span className="text-red-500">*</span>
            </label>
            <input
              id="blog-lead-company"
              type="text"
              required
              autoComplete="organization"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Company"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
        </div>

        <div>
          <label htmlFor="blog-lead-phone" className="mb-1 block text-sm font-medium text-slate-800">
            Phone <span className="text-slate-400">(optional)</span>
          </label>
          <input
            id="blog-lead-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <div>
          <label
            htmlFor="blog-lead-message"
            className="mb-1 block text-sm font-medium text-slate-800"
          >
            Describe your requirement <span className="text-slate-400">(optional)</span>
          </label>
          <textarea
            id="blog-lead-message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what you’re looking for"
            className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        {errorMsg ? (
          <p className="text-sm font-medium text-red-600" role="alert">
            {errorMsg}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={status === "loading" || !submissionsActive}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:from-violet-700 hover:to-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "loading"
            ? "Submitting…"
            : !submissionsActive
              ? "Submit disabled (email not configured)"
              : "Submit your form"}
        </button>
      </form>
    </div>
  );
}
