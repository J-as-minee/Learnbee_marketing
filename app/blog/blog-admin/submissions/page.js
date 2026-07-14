"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, LogIn, LogOut, FileText } from "lucide-react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const ADMIN_SESSION_KEY = "bsharp_blog_admin_session_v1";

export default function AdminSubmissionsPage() {
  const [sessionReady, setSessionReady] = useState(false);
  const [authPw, setAuthPw] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const login = async (e) => {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/blog/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (!res.ok) {
        setError("Invalid password");
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
      setError("Connection error");
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
  }, []);

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
              <FileText className="h-6 w-6 text-violet-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Lead submissions</h1>
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
            {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
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
            <h1 className="text-xl font-bold text-slate-900">Lead submissions</h1>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Email-only leads</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Blog and campaign lead forms no longer store rows in a database. Each submission sends a
            notification to your team via{" "}
            <span className="font-medium text-slate-800">Resend</span> using{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">LEADS_NOTIFY_EMAIL</code>.
            There is nothing to export here — check the inbox configured for lead alerts.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            Required environment variables:{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">RESEND_API_KEY</code>,{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">LEADS_NOTIFY_EMAIL</code>,{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">LEADS_EMAIL_FROM</code>.
          </p>
        </div>
      </main>
    </div>
  );
}
