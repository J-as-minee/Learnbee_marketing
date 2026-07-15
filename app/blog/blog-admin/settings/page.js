"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  LogIn,
  LogOut,
  FileText,
  Save,
  Settings2,
} from "lucide-react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const ADMIN_SESSION_KEY = "bsharp_blog_admin_session_v1";

const emptySettings = {
  sidePanel: { postListMode: "related", customSlugs: [] },
  social: {
    twitter: "",
    linkedin: "",
    youtube: "",
    facebook: "",
    instagram: "",
  },
  newsletter: {
    heading: "Subscribe to our newsletter",
    description: "",
  },
};

export default function AdminBlogSettingsPage() {
  const [sessionReady, setSessionReady] = useState(false);
  const [authPw, setAuthPw] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [form, setForm] = useState(emptySettings);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let saved = "";
      try {
        saved = localStorage.getItem(ADMIN_SESSION_KEY) || "";
      } catch {
        saved = "";
      }
      if (!saved) {
        if (!cancelled) setSessionReady(true);
        return;
      }
      try {
        const res = await fetch(`${BASE_PATH}/api/blog/list`, {
          headers: { "x-admin-password": saved },
        });
        if (res.ok && !cancelled) setAuthPw(saved);
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setSessionReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadSettings = useCallback(async (password) => {
    setLoadError("");
    setSaveMsg("");
    try {
      const res = await fetch(`${BASE_PATH}/api/admin/blog-settings`, {
        headers: { "x-admin-password": password },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setLoadError(err?.error || "Could not load settings");
        return;
      }
      const data = await res.json();
      setForm({
        sidePanel: {
          postListMode: data.sidePanel?.postListMode || "related",
          customSlugs: data.sidePanel?.customSlugs || [],
        },
        social: { ...emptySettings.social, ...(data.social || {}) },
        newsletter: { ...emptySettings.newsletter, ...(data.newsletter || {}) },
      });
    } catch {
      setLoadError("Connection error");
    }
  }, []);

  useEffect(() => {
    if (authPw) loadSettings(authPw);
  }, [authPw, loadSettings]);

  const login = async (e) => {
    e?.preventDefault();
    setLoadError("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/blog/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (!res.ok) {
        setLoadError("Invalid password");
        return;
      }
      setAuthPw(pw);
      try {
        localStorage.setItem(ADMIN_SESSION_KEY, pw);
      } catch {
        /* ignore */
      }
      setPw("");
    } catch {
      setLoadError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      /* ignore */
    }
    setAuthPw("");
    setPw("");
    setForm(emptySettings);
  }, []);

  const save = async () => {
    setSaveMsg("");
    setLoadError("");
    setSaving(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/admin/blog-settings`, {
        method: "PUT",
        headers: {
          "x-admin-password": authPw,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sidePanel: form.sidePanel,
          social: form.social,
          newsletter: form.newsletter,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoadError(data?.error || "Save failed");
        return;
      }
      setSaveMsg("Saved.");
    } catch {
      setLoadError("Save failed (network)");
    } finally {
      setSaving(false);
    }
  };

  if (!sessionReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" aria-label="Loading" />
      </div>
    );
  }

  if (!authPw) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
              <Settings2 className="h-6 w-6 text-violet-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Blog settings</h1>
            <p className="mt-1 text-sm text-slate-500">Same password as Blog Admin</p>
          </div>
          <form onSubmit={login}>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              placeholder="Admin password"
              autoFocus
            />
            {loadError ? <p className="mb-3 text-sm text-red-600">{loadError}</p> : null}
            <button
              type="submit"
              disabled={loading || !pw}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn size={16} />}
              Sign in
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            <Link href="/blog/blog-admin" className="font-medium text-violet-600 hover:underline">
              ← Blog dashboard
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/blog/blog-admin"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft size={16} /> Dashboard
            </Link>
            <h1 className="text-xl font-bold text-slate-900">Blog settings</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => save()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
              Save
            </button>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <LogOut size={16} /> Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-6 py-8">
        {loadError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {loadError}
          </p>
        ) : null}
        {saveMsg ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {saveMsg}
          </p>
        ) : null}

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <FileText size={18} className="text-violet-600" />
            Blog side panel
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Controls the right column on individual blog posts (live and preview). Shows 3–4 posts
            plus newsletter and social links.
          </p>
          <fieldset className="mt-5 space-y-3">
            <legend className="sr-only">Which posts to show</legend>
            {[
              {
                value: "related",
                label: "Related posts",
                hint: "Prefer posts that share tags with the current article; fills with recent if needed.",
              },
              {
                value: "recent",
                label: "Recent posts",
                hint: "Newest posts first (excluding the one you are reading).",
              },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition ${
                  form.sidePanel.postListMode === opt.value
                    ? "border-violet-400 bg-violet-50/50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="postListMode"
                  value={opt.value}
                  checked={form.sidePanel.postListMode === opt.value}
                  onChange={() =>
                    setForm((f) => ({
                      ...f,
                      sidePanel: { ...f.sidePanel, postListMode: opt.value },
                    }))
                  }
                  className="mt-1 h-4 w-4 border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                <span>
                  <span className="block text-sm font-medium text-slate-900">{opt.label}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{opt.hint}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <p className="mt-4 text-xs text-slate-400">
            Custom hand-picked posts will be available here in a future update.
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Social links</h2>
          <p className="mt-1 text-sm text-slate-500">
            Full URLs work best (e.g. https://linkedin.com/company/your-org). Leave blank to hide a
            network.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              ["linkedin", "LinkedIn"],
              ["twitter", "X / Twitter"],
              ["youtube", "YouTube"],
              ["facebook", "Facebook"],
              ["instagram", "Instagram"],
            ].map(([key, label]) => (
              <label key={key} className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">{label}</span>
                <input
                  type="url"
                  value={form.social[key] || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      social: { ...f.social, [key]: e.target.value },
                    }))
                  }
                  placeholder="https://…"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Newsletter block</h2>
          <p className="mt-1 text-sm text-slate-500">
            Copy shown next to the signup form. Subscribers trigger an email to your team (Resend +
            env vars — see docs).
          </p>
          <label className="mt-4 block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Heading</span>
            <input
              type="text"
              value={form.newsletter.heading}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  newsletter: { ...f.newsletter, heading: e.target.value },
                }))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </label>
          <label className="mt-4 block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Description</span>
            <textarea
              value={form.newsletter.description}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  newsletter: { ...f.newsletter, description: e.target.value },
                }))
              }
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </label>
        </section>
      </main>
    </div>
  );
}
