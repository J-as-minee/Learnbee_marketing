"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import PreviewModal from "@/components/admin/PreviewModal";
import { usePreviewToken } from "./PreviewTokenProvider";
import { useAutoSaveKV } from "@/hooks/useAutoSaveKV";
import { BLOG_POST_SIDEBAR_WIDGETS_ENABLED } from "@/lib/blog-sidebar-flags";
import {
  LogIn,
  LogOut,
  Plus,
  Eye,
  Send,
  Save,
  ArrowLeft,
  Pencil,
  Trash2,
  FileText,
  ExternalLink,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  ImageUp,
  EyeOff,
  Search,
} from "lucide-react";

/** Same as next.config `basePath` — required for client `fetch` / `window.open` (Next does not prefix these). */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** Persists admin session across refresh & browser tabs (same origin). */
const ADMIN_SESSION_KEY = "bsharp_blog_admin_session_v1";

const TipTapEditor = dynamic(() => import("@/components/admin/TipTapEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-lg border border-slate-200 bg-white">
      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
    </div>
  ),
});

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/** Case-insensitive match; every whitespace-separated term must appear somewhere in the indexed fields. */
function postMatchesSearch(p, queryLower) {
  const q = queryLower.trim().toLowerCase();
  if (!q) return true;
  const hay = [
    p.slug,
    p.title,
    p.author,
    p.description,
    ...(Array.isArray(p.categories) ? p.categories : []),
    ...(Array.isArray(p.tags) ? p.tags : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return q
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => hay.includes(term));
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed right-6 top-6 z-[60] flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
        type === "error"
          ? "bg-red-600 text-white"
          : "bg-emerald-600 text-white"
      }`}
    >
      {type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}

/** In-page confirm (window.confirm is blocked or auto-accepted in some embedded browsers). */
function ConfirmModal({ config, onClose }) {
  useEffect(() => {
    if (!config) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [config, onClose]);

  if (!config) return null;
  const {
    title,
    message,
    confirmLabel = "OK",
    cancelLabel = "Cancel",
    variant = "default",
    onConfirm,
  } = config;
  const confirmClass =
    variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700"
      : "bg-violet-600 text-white hover:bg-violet-700";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="max-h-[min(90vh,32rem)] w-full max-w-md overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-modal-title" className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        <p className="mt-3 whitespace-pre-line text-sm text-slate-600">{message}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => onConfirm()}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const blogPreviewToken = usePreviewToken();
  const [sessionReady, setSessionReady] = useState(false);
  const [view, setView] = useState("login");
  const [pw, setPw] = useState("");
  const [authPw, setAuthPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [publishStatus, setPublishStatus] = useState("");
  const [toast, setToast] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const ignoreDirtyRef = useRef(false);
  /** Dedupe keepalive save on pagehide + beforeunload */
  const closingRepoSaveRef = useRef(false);
  const isNewRef = useRef(false);

  const [posts, setPosts] = useState({
    drafts: [],
    unpublished: [],
    published: [],
  });
  const [dashboardTab, setDashboardTab] = useState("drafts");
  const [postSearchQuery, setPostSearchQuery] = useState("");
  const [confirmModal, setConfirmModal] = useState(null);

  const postSearchNorm = postSearchQuery.trim().toLowerCase();
  const filteredDrafts = useMemo(
    () => posts.drafts.filter((p) => postMatchesSearch(p, postSearchNorm)),
    [posts.drafts, postSearchNorm],
  );
  const filteredUnpublished = useMemo(
    () => posts.unpublished.filter((p) => postMatchesSearch(p, postSearchNorm)),
    [posts.unpublished, postSearchNorm],
  );
  const filteredPublished = useMemo(
    () => posts.published.filter((p) => postMatchesSearch(p, postSearchNorm)),
    [posts.published, postSearchNorm],
  );

  const [editorKey, setEditorKey] = useState(0);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("Editorial Team");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("blogs");
  const [tags, setTags] = useState("general");
  const [product, setProduct] = useState("learnbee");
  const [thumbnail, setThumbnail] = useState("");
  const [thumbnailAlt, setThumbnailAlt] = useState("");
  const [thumbnailBusy, setThumbnailBusy] = useState(false);
  const [showContactForm, setShowContactForm] = useState(true);
  const [content, setContent] = useState("");
  const [isNew, setIsNew] = useState(true);
  const [slugLocked, setSlugLocked] = useState(false);
  /** "staging" = draft (blog-staging); "live" = published post (blog-clean) */
  const [editSource, setEditSource] = useState("staging");
  const [sessionId] = useState(() => {
    if (typeof window === "undefined") return "";
    let id = localStorage.getItem("bsharp_admin_session_id");
    if (!id) {
      id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem("bsharp_admin_session_id", id);
    }
    return id;
  });
  const { lastSaved, isSaving, restoreFromLocal, restoreFromKV, clearSaved } = useAutoSaveKV({
    sessionId,
    slug,
    title,
    author,
    description,
    category,
    tags,
    product,
    thumbnail,
    thumbnailAlt,
    showContactForm,
    content,
    enabled: view === "editor" && isNew,
    authPassword: authPw,
  });

  const headers = useCallback(
    () => ({ "x-admin-password": authPw, "Content-Type": "application/json" }),
    [authPw],
  );

  const notify = useCallback((message, type = "success") => {
    setToast({ message, type, key: Date.now() });
  }, []);

  const openStagingPreview = useCallback(
    (postSlug) => {
      if (!blogPreviewToken) {
        notify(
          "Blog preview is not configured. Set BLOG_PREVIEW_TOKEN in Vercel (or .env.local) and redeploy.",
          "error",
        );
        return;
      }
      window.open(
        `${BASE_PATH}/blog/${postSlug}?preview=${encodeURIComponent(blogPreviewToken)}`,
        "_blank",
      );
    },
    [blogPreviewToken, notify],
  );

  const persistSession = useCallback((password) => {
    try {
      localStorage.setItem(ADMIN_SESSION_KEY, password);
    } catch {
      /* private mode / blocked */
    }
  }, []);

  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const resetEditor = useCallback(() => {
    setSlug("");
    setTitle("");
    setAuthor("Editorial Team");
    setDescription("");
    setCategory("blogs");
    setTags("general");
    setProduct("learnbee");
    setThumbnail("");
    setThumbnailAlt("");
    setShowContactForm(true);
    setContent("");
    setIsNew(true);
    setSlugLocked(false);
    setEditSource("staging");
    setDirty(false);
    setEditorKey((k) => k + 1);
  }, []);

  /** Restore session: same tab refresh + other tabs (localStorage). */
  useEffect(() => {
    let cancelled = false;
    async function restore() {
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
        if (!res.ok) {
          clearSession();
          if (!cancelled) setSessionReady(true);
          return;
        }
        if (!cancelled) {
          setAuthPw(saved);
          setView("dashboard");
        }
      } catch {
        clearSession();
      } finally {
        if (!cancelled) setSessionReady(true);
      }
    }
    restore();
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  /** Cross-tab logout: if another tab clears storage, this tab logs out. */
  useEffect(() => {
    function onStorage(e) {
      if (e.key !== ADMIN_SESSION_KEY) return;
      if (e.newValue === null && e.oldValue !== null) {
        setAuthPw("");
        setView("login");
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const markDirty = useCallback(() => {
    if (!ignoreDirtyRef.current) setDirty(true);
  }, []);

  useEffect(() => {
    isNewRef.current = isNew;
  }, [isNew]);

  useEffect(() => {
    if (view !== "editor") return;
    ignoreDirtyRef.current = true;
    const t = window.setTimeout(() => {
      ignoreDirtyRef.current = false;
    }, 500);
    return () => window.clearTimeout(t);
  }, [view, editorKey]);

  useEffect(() => {
    closingRepoSaveRef.current = false;
  }, [view, editorKey]);

  /* ── Auth ── */
  const login = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/blog/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (!res.ok) {
        let msg = "Invalid password";
        try {
          const data = await res.json();
          if (res.status === 500 && data?.error) {
            msg = data.error.includes("not configured")
              ? "BLOG_ADMIN_PASSWORD is missing on the server. In Vercel: Project → Settings → Environment Variables → add BLOG_ADMIN_PASSWORD (check Production), then Redeploy."
              : String(data.error);
          }
        } catch {
          /* ignore */
        }
        notify(msg, "error");
        return;
      }
      setAuthPw(pw);
      persistSession(pw);
      setView("dashboard");
    } catch {
      notify("Connection error", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ── Posts list ── */
  const loadPosts = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_PATH}/api/blog/list`, {
        headers: { "x-admin-password": authPw },
      });
      if (res.ok) {
        const data = await res.json();
        setPosts({
          drafts: data.drafts ?? [],
          unpublished: data.unpublished ?? [],
          published: data.published ?? [],
        });
      }
    } catch {
      /* silent */
    }
  }, [authPw]);

  useEffect(() => {
    if (view === "dashboard" && authPw) loadPosts();
  }, [view, authPw, loadPosts]);

  /* ── Editor helpers ── */
  const openNewPost = async () => {
    // Check LocalStorage first (instant)
    const localDraft = restoreFromLocal();

    // Check KV for cloud-synced draft
    const kvDraft = await restoreFromKV();

    // Use the most recent one
    const saved = kvDraft && localDraft
      ? (new Date(kvDraft.savedAt) > new Date(localDraft.savedAt) ? kvDraft : localDraft)
      : kvDraft || localDraft;

    if (saved && saved.content) {
      const shouldRestore = window.confirm(
        `Found auto-saved draft "${saved.title || "Untitled"}" from ${new Date(saved.savedAt).toLocaleString()}.\n\nRestore it?`,
      );
      if (shouldRestore) {
        setSlug(saved.slug || "");
        setTitle(saved.title || "");
        setAuthor(saved.author || "Editorial Team");
        setDescription(saved.description || "");
        setCategory(saved.category || "blogs");
        setTags(saved.tags || "general");
        setProduct(saved.product || "learnbee");
        setThumbnail(saved.thumbnail || "");
        setThumbnailAlt(saved.thumbnailAlt || "");
        setShowContactForm(saved.showContactForm !== false);
        setContent(saved.content || "");
        setEditorKey((k) => k + 1);
        setView("editor");
        return;
      }
      // User declined - clear the saved draft
      await clearSaved();
    }

    resetEditor();
    setView("editor");
  };

  const openEditPost = async (postSlug, source) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_PATH}/api/blog/load?slug=${postSlug}&source=${source}`,
        { headers: { "x-admin-password": authPw } },
      );
      if (!res.ok) {
        notify("Failed to load post", "error");
        return;
      }
      const data = await res.json();
      setEditSource(data.source === "live" ? "live" : "staging");
      setSlug(data.slug);
      setTitle(data.frontmatter.title);
      setAuthor(data.frontmatter.author);
      setDescription(data.frontmatter.description);
      setCategory(data.frontmatter.categories?.[0] || "blogs");
      setTags(data.frontmatter.tags?.join(", ") || "general");
      setProduct(data.frontmatter.product || "learnbee");
      setThumbnail(String(data.frontmatter.thumbnail || "").trim());
      setThumbnailAlt(String(data.frontmatter.thumbnail_alt || "").trim());
      setShowContactForm(data.frontmatter.show_contact_form !== false);
      setContent(data.content);
      setIsNew(false);
      setSlugLocked(true);
      setEditorKey((k) => k + 1);
      setView("editor");
      setDirty(false);
    } catch {
      notify("Connection error", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (val) => {
    setTitle(val);
    markDirty();
    if (!slugLocked) setSlug(slugify(val));
  };

  const onContentChange = useCallback(
    (html) => {
      setContent(html);
      markDirty();
    },
    [markDirty],
  );

  const getSavePayload = useCallback(() => {
    const finalSlug = slug || slugify(title);
    return {
      slug: finalSlug,
      title,
      author,
      description,
      categories: category.split(",").map((c) => c.trim()).filter(Boolean),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      product,
      thumbnail: thumbnail.trim(),
      thumbnail_alt: thumbnailAlt.trim(),
      show_contact_form: showContactForm,
      content,
      source: editSource,
    };
  }, [
    slug,
    title,
    author,
    description,
    category,
    tags,
    product,
    thumbnail,
    thumbnailAlt,
    showContactForm,
    content,
    editSource,
  ]);

  /* ── Save ── */
  const saveDraft = useCallback(
    async (opts = {}) => {
      const { keepalive = false, quietSuccess = false } = opts;
      if (!title.trim()) {
        if (!quietSuccess) notify("Title is required", "error");
        return false;
      }
      if (!["learnbee"].includes(product)) {
        if (!quietSuccess) notify("Select a product (Learnbee)", "error");
        return false;
      }
      const payload = getSavePayload();
      if (!keepalive) {
        setSlug(payload.slug);
        setSlugLocked(true);
        setLoading(true);
      }
      try {
        const res = await fetch(`${BASE_PATH}/api/blog/save`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(payload),
          keepalive,
        });
        if (!res.ok) throw new Error();
        if (!keepalive) {
          const wasNew = isNewRef.current;
          setIsNew(false);
          setDirty(false);
          if (wasNew) clearSaved();
          if (!quietSuccess) notify(editSource === "live" ? "Published post saved" : "Draft saved");
        }
        return true;
      } catch {
        notify("Failed to save", "error");
        return false;
      } finally {
        if (!keepalive) setLoading(false);
      }
    },
    [title, product, getSavePayload, headers, notify, editSource, clearSaved],
  );

  const tryRepoSaveOnClose = useCallback(() => {
    if (closingRepoSaveRef.current) return;
    if (view !== "editor" || !dirty || !authPw || !title.trim()) return;
    closingRepoSaveRef.current = true;
    const payload = getSavePayload();
    fetch(`${BASE_PATH}/api/blog/save`, {
      method: "POST",
      headers: { "x-admin-password": authPw, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }, [view, dirty, authPw, title, getSavePayload]);

  useEffect(() => {
    const onPageHide = () => tryRepoSaveOnClose();
    const onBeforeUnload = (e) => {
      tryRepoSaveOnClose();
      if (view === "editor" && dirty && !title.trim()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [view, dirty, title, tryRepoSaveOnClose]);

  const leaveEditorToDashboard = useCallback(async () => {
    if (dirty && title.trim()) {
      ignoreDirtyRef.current = true;
      const ok = await saveDraft();
      ignoreDirtyRef.current = false;
      if (!ok) return;
    } else if (dirty && !title.trim()) {
      if (
        !window.confirm(
          "You have unsaved changes but a title is required to save to the repo. Leave anyway?",
        )
      ) {
        return;
      }
    }
    setView("dashboard");
    resetEditor();
  }, [dirty, title, saveDraft, resetEditor]);

  const logout = useCallback(async () => {
    if (view === "editor" && dirty && title.trim() && authPw) {
      ignoreDirtyRef.current = true;
      const ok = await saveDraft({ quietSuccess: true });
      ignoreDirtyRef.current = false;
      if (!ok) return;
    } else if (view === "editor" && dirty && !title.trim()) {
      if (
        !window.confirm(
          "You have unsaved changes but a title is required to save. Log out anyway?",
        )
      ) {
        return;
      }
    }
    clearSession();
    setAuthPw("");
    setPw("");
    setView("login");
    resetEditor();
  }, [view, dirty, title, authPw, saveDraft, clearSession, resetEditor]);

  const uploadThumbnailAndSet = useCallback(async () => {
    const currentSlug = slug || slugify(title);
    if (!currentSlug.trim()) {
      notify("Set a title first so the image can be stored under your post folder", "error");
      return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setThumbnailBusy(true);
      setSlug(currentSlug);
      setSlugLocked(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slug", currentSlug);
      fd.append("source", editSource);
      try {
        const res = await fetch(`${BASE_PATH}/api/blog/upload`, {
          method: "POST",
          headers: { "x-admin-password": authPw },
          body: fd,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          notify(String(data.error || `Thumbnail upload failed (${res.status})`), "error");
          return;
        }
        const imageUrl = String(data.path || "").trim();
        if (imageUrl) {
          setThumbnail(imageUrl);
          markDirty();
          notify("Thumbnail filename saved — add alt text, then Save");
        }
      } catch {
        notify("Thumbnail upload failed", "error");
      } finally {
        setThumbnailBusy(false);
      }
    };
    input.click();
  }, [authPw, editSource, markDirty, notify, slug, title]);

  /* ── Image upload ── */
  const uploadImage = useCallback(
    async (file) => {
      const currentSlug = slug || slugify(title);
      if (!currentSlug) {
        notify("Set a title first so images have a folder", "error");
        return null;
      }
      setSlug(currentSlug);
      setSlugLocked(true);

      const fd = new FormData();
      fd.append("file", file);
      fd.append("slug", currentSlug);
      fd.append("source", editSource);

      try {
        const res = await fetch(`${BASE_PATH}/api/blog/upload`, {
          method: "POST",
          headers: { "x-admin-password": authPw },
          body: fd,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          notify(String(data.error || `Image upload failed (${res.status})`), "error");
          return null;
        }
        return data.path;
      } catch {
        notify("Image upload failed", "error");
        return null;
      }
    },
    [slug, title, authPw, notify, editSource],
  );

  /* ── Preview ── */
  const preview = async () => {
    await saveDraft();
    const previewSlug = slug || slugify(title);
    if (editSource === "live") {
      window.open(`${BASE_PATH}/blog/${previewSlug}`, "_blank");
      return;
    }
    openStagingPreview(previewSlug);
  };

  /* ── Unpublish (live → staging + admin flag) — in-page modal, not window.confirm ── */
  const performUnpublish = useCallback(
    async (targetSlug, postSlugArg) => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_PATH}/api/blog/unpublish`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({ slug: targetSlug }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          notify(data?.error || "Unpublish failed", "error");
          return;
        }
        notify("Post is unpublished — find it under the Unpublished tab");
        await loadPosts();
        setDashboardTab("unpublished");
        if (!postSlugArg) {
          setView("dashboard");
          resetEditor();
        }
      } catch {
        notify("Unpublish failed", "error");
      } finally {
        setLoading(false);
      }
    },
    [headers, notify, loadPosts, resetEditor],
  );

  const requestUnpublish = useCallback(
    (postSlug, postTitleFromList) => {
      const targetSlug = postSlug || slug;
      if (!targetSlug) return;
      const fromList = typeof postSlug === "string" && postSlug.length > 0;
      const displayName = fromList
        ? (postTitleFromList && String(postTitleFromList).trim()) || postSlug
        : (title && String(title).trim()) || targetSlug;

      const openUnpublishFinal = () => {
        setConfirmModal({
          title: "Unpublish this post?",
          message: `Unpublish "${displayName}"?\n\nIt will be hidden from the public blog and listed under Unpublished. You can edit and publish again later.`,
          confirmLabel: "Unpublish",
          cancelLabel: "Cancel",
          variant: "default",
          onConfirm: () => {
            setConfirmModal(null);
            void performUnpublish(targetSlug, postSlug);
          },
        });
      };

      if (dirty) {
        setConfirmModal({
          title: "Unsaved changes",
          message: `You have unsaved changes in the editor.\n\nContinue to unpublish "${displayName}"? Anything not saved will not appear on the live post.`,
          confirmLabel: "Continue",
          cancelLabel: "Cancel",
          variant: "default",
          onConfirm: () => {
            openUnpublishFinal();
          },
        });
        return;
      }
      openUnpublishFinal();
    },
    [slug, title, dirty, performUnpublish],
  );

  /* ── Publish ── */
  const publish = async (postSlug) => {
    const targetSlug = postSlug || slug || slugify(title);
    setLoading(true);
    setPublishStatus(!postSlug ? "Saving draft..." : "Publishing...");
    try {
      if (!postSlug) {
        if (!title.trim()) {
          notify("Title is required before publish", "error");
          return;
        }
        if (!["learnbee"].includes(product)) {
          notify("Select a product (Learnbee) before publish", "error");
          return;
        }
        const payload = { ...getSavePayload(), source: "staging" };
        const saveRes = await fetch(`${BASE_PATH}/api/blog/save`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(payload),
        });
        let saveData = {};
        try {
          saveData = await saveRes.json();
        } catch {
          /* ignore */
        }
        if (!saveRes.ok) {
          notify(
            saveData?.error || "Failed to save draft before publish",
            "error",
          );
          return;
        }
        setSlug(payload.slug);
        setSlugLocked(true);
        setIsNew(false);
        setDirty(false);
        setPublishStatus("Publishing...");
      }

      const res = await fetch(`${BASE_PATH}/api/blog/publish`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ slug: targetSlug }),
      });
      if (!res.ok) throw new Error();
      setPublishStatus("");
      notify(`Published: ${targetSlug}`);
      clearSaved();
      if (!postSlug) {
        setView("dashboard");
        resetEditor();
      } else {
        loadPosts();
      }
    } catch {
      setPublishStatus("");
      notify("Failed to publish", "error");
    } finally {
      setLoading(false);
      setPublishStatus("");
    }
  };

  /* ── Delete — in-page modal ── */
  const performDelete = useCallback(
    async (postSlug, source) => {
      setPosts((prev) => ({
        drafts: prev.drafts.filter((p) => p.slug !== postSlug),
        unpublished: prev.unpublished.filter((p) => p.slug !== postSlug),
        published: prev.published.filter((p) => p.slug !== postSlug),
      }));
      notify("Deleting...");

      try {
        const res = await fetch(`${BASE_PATH}/api/blog/delete`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({ slug: postSlug, source }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          notify(data?.error || "Failed to delete", "error");
          loadPosts();
          return;
        }
        notify("Deleted successfully");
      } catch {
        notify("Failed to delete", "error");
        loadPosts();
      }
    },
    [headers, notify, loadPosts],
  );

  const requestDelete = useCallback(
    (postSlug, source, postTitle) => {
      const displayName = (postTitle && String(postTitle).trim()) || postSlug;
      const isLive = source === "live";
      const message = isLive
        ? `Permanently delete "${displayName}"?\n\nThis removes the post and cannot be undone.\n\nIf you only want to hide it from readers, use Unpublish instead of Delete.`
        : `Permanently delete "${displayName}"?\n\nThis removes this draft or unpublished copy and cannot be undone.`;
      setConfirmModal({
        title: "Delete post permanently?",
        message,
        confirmLabel: "Delete permanently",
        cancelLabel: "Cancel",
        variant: "danger",
        onConfirm: () => {
          setConfirmModal(null);
          void performDelete(postSlug, source);
        },
      });
    },
    [performDelete],
  );

  /* Session bootstrap */
  if (!sessionReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" aria-label="Loading" />
      </div>
    );
  }

  /* ═══════════════════ LOGIN ═══════════════════ */
  if (view === "login") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
              <FileText className="h-6 w-6 text-violet-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Blog Admin</h1>
            <p className="mt-1 text-sm text-slate-500">
              Sign in to manage posts
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              login();
            }}
          >
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              placeholder="Enter admin password"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !pw}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ═══════════════════ DASHBOARD ═══════════════════ */
  if (view === "dashboard") {
    return (
      <div className="min-h-screen">
        <ConfirmModal
          config={confirmModal}
          onClose={() => setConfirmModal(null)}
        />
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <h1 className="text-xl font-bold text-slate-900">
              Blog Dashboard
            </h1>
            <div className="flex items-center gap-2">
              {BLOG_POST_SIDEBAR_WIDGETS_ENABLED ? (
                <Link
                  href="/blog/blog-admin/settings"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Settings
                </Link>
              ) : null}
              <Link
                href="/blog/blog-admin/submissions"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Lead submissions
              </Link>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <LogOut size={16} /> Log out
              </button>
              <button
                onClick={openNewPost}
                className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                <Plus size={16} /> New Post
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-8">
          <div className="relative mb-6">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              value={postSearchQuery}
              onChange={(e) => setPostSearchQuery(e.target.value)}
              placeholder="Search by title, slug, author, tags, categories…"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              aria-label="Search posts"
            />
            {postSearchQuery.trim() ? (
              <button
                type="button"
                onClick={() => setPostSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            ) : null}
          </div>
          {postSearchNorm ? (
            <p className="-mt-2 mb-4 text-xs text-slate-500">
              Filtering this tab
              {dashboardTab === "drafts" &&
                ` · ${filteredDrafts.length} of ${posts.drafts.length} drafts`}
              {dashboardTab === "published" &&
                ` · ${filteredPublished.length} of ${posts.published.length} published`}
              {dashboardTab === "unpublished" &&
                ` · ${filteredUnpublished.length} of ${posts.unpublished.length} unpublished`}
            </p>
          ) : null}

          <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-1">
            {[
              { id: "drafts", label: "Drafts", count: posts.drafts.length },
              { id: "published", label: "Published", count: posts.published.length },
              {
                id: "unpublished",
                label: "Unpublished",
                count: posts.unpublished.length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDashboardTab(tab.id)}
                className={`rounded-t-lg px-4 py-2 text-sm font-medium transition ${
                  dashboardTab === tab.id
                    ? "bg-white text-violet-700 ring-1 ring-slate-200 ring-b-0"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-slate-400">({tab.count})</span>
              </button>
            ))}
          </div>

          {dashboardTab === "drafts" && (
            <section>
              <p className="mb-4 text-sm text-slate-500">
                New posts and work in progress (not on the public blog until you
                publish).
              </p>
              {posts.drafts.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 px-6 py-8 text-center text-sm text-slate-400">
                  No drafts yet. Click &quot;New Post&quot; to get started.
                </p>
              ) : filteredDrafts.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 px-6 py-8 text-center text-sm text-slate-400">
                  No drafts match your search.
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredDrafts.map((p) => (
                    <div
                      key={p.slug}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-5 py-4 transition hover:shadow-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-medium text-slate-900">
                          {p.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {p.date} &middot; {p.author || "No author"}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditPost(p.slug, "staging")}
                          className="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openStagingPreview(p.slug)}
                          className="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          title="Preview"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => publish(p.slug)}
                          className="rounded-md p-2 text-emerald-500 transition hover:bg-emerald-50 hover:text-emerald-700"
                          title="Publish"
                        >
                          <Send size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDelete(p.slug, "staging", p.title)}
                          className="rounded-md p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {dashboardTab === "published" && (
            <section>
              <p className="mb-4 text-sm text-slate-500">
                Live on the site. Unpublish to hide a post without deleting it.
              </p>
              {posts.published.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 px-6 py-8 text-center text-sm text-slate-400">
                  No published posts yet.
                </p>
              ) : filteredPublished.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 px-6 py-8 text-center text-sm text-slate-400">
                  No published posts match your search.
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredPublished.map((p) => (
                    <div
                      key={p.slug}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-5 py-4 transition hover:shadow-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-medium text-slate-900">
                          {p.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {p.date} &middot; {p.author || "No author"}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditPost(p.slug, "live")}
                          className="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            window.open(`${BASE_PATH}/blog/${p.slug}`, "_blank")
                          }
                          className="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          title="View live"
                        >
                          <ExternalLink size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => requestUnpublish(p.slug, p.title)}
                          className="rounded-md p-2 text-amber-600 transition hover:bg-amber-50 hover:text-amber-800"
                          title="Unpublish"
                        >
                          <EyeOff size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDelete(p.slug, "live", p.title)}
                          className="rounded-md p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {dashboardTab === "unpublished" && (
            <section>
              <p className="mb-4 text-sm text-slate-500">
                Previously live posts you have taken down. They are not public;
                publish again when ready.
              </p>
              {posts.unpublished.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 px-6 py-8 text-center text-sm text-slate-400">
                  No unpublished posts. Use Unpublish on a published post to move
                  it here.
                </p>
              ) : filteredUnpublished.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 px-6 py-8 text-center text-sm text-slate-400">
                  No unpublished posts match your search.
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredUnpublished.map((p) => (
                    <div
                      key={p.slug}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-5 py-4 transition hover:shadow-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-medium text-slate-900">
                          {p.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {p.date} &middot; {p.author || "No author"}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditPost(p.slug, "staging")}
                          className="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openStagingPreview(p.slug)}
                          className="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          title="Preview staging"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => publish(p.slug)}
                          className="rounded-md p-2 text-emerald-500 transition hover:bg-emerald-50 hover:text-emerald-700"
                          title="Publish again"
                        >
                          <Send size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDelete(p.slug, "staging", p.title)}
                          className="rounded-md p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    );
  }

  /* ═══════════════════ EDITOR ═══════════════════ */
  return (
    <div className="flex h-screen flex-col">
      <ConfirmModal
        config={confirmModal}
        onClose={() => setConfirmModal(null)}
      />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <button
          type="button"
          onClick={() => void leaveEditorToDashboard()}
          className="flex items-center gap-1.5 text-sm text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} /> Dashboard
        </button>
        <div className="flex items-center gap-2">
          <Link
            href="/blog/blog-admin/submissions"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Lead submissions
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <LogOut size={14} /> Log out
          </button>
          <button
            onClick={saveDraft}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {editSource === "live" ? "Save" : "Save Draft"}
          </button>
          {editSource === "live" ? (
            <button
              type="button"
              onClick={() => requestUnpublish()}
              disabled={loading || !slug}
              className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 transition hover:bg-amber-100 disabled:opacity-50"
            >
              <EyeOff size={14} /> Unpublish
            </button>
          ) : null}
          {isSaving && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </span>
          )}
          {!isSaving && lastSaved && (
            <span className="text-xs text-slate-400">
              Auto-saved {new Date(lastSaved).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={preview}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-violet-300 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-100 disabled:opacity-50"
          >
            <Eye size={14} /> {editSource === "live" ? "View live" : "Preview"}
          </button>
          {editSource !== "live" ? (
            <button
              onClick={() => publish()}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              <Send size={14} />{" "}
              {loading && publishStatus ? publishStatus : "Publish"}
            </button>
          ) : null}
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-px">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <TipTapEditor
              key={editorKey}
              content={content}
              onChange={onContentChange}
              onImageUpload={uploadImage}
            />
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-80 shrink-0 overflow-auto border-l border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Post Settings
          </h2>

          <div className="space-y-4">
            <Field label="Title" required>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Your blog post title"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </Field>

            <Field label="Slug">
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugLocked(true);
                  markDirty();
                }}
                placeholder="auto-generated-from-title"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </Field>

            <Field label="Author">
              <input
                type="text"
                value={author}
                onChange={(e) => {
                  setAuthor(e.target.value);
                  markDirty();
                }}
                placeholder="Editorial Team"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </Field>

            <Field label="Description (SEO)">
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  markDirty();
                }}
                rows={3}
                placeholder="Short summary for search results"
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </Field>

            <div className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Thumbnail image
              </span>
              <p className="mb-2 text-xs text-slate-500">
                Used on the blog index, Open Graph, and the related/recent sidebar. Filename only
                (e.g. <code className="rounded bg-slate-100 px-1">cover.jpg</code>) or upload
                below.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={thumbnail}
                  onChange={(e) => {
                    setThumbnail(e.target.value);
                    markDirty();
                  }}
                  placeholder="cover.jpg"
                  className="w-full flex-1 rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />
                <button
                  type="button"
                  onClick={() => uploadThumbnailAndSet()}
                  disabled={thumbnailBusy || loading}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-800 transition hover:bg-violet-100 disabled:opacity-50"
                >
                  {thumbnailBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImageUp className="h-4 w-4" />
                  )}
                  Upload
                </button>
              </div>
            </div>

            <Field label="Thumbnail alt text">
              <input
                type="text"
                value={thumbnailAlt}
                onChange={(e) => {
                  setThumbnailAlt(e.target.value);
                  markDirty();
                }}
                placeholder="Short description for screen readers and SEO"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </Field>

            <Field label="Category">
              <input
                type="text"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  markDirty();
                }}
                placeholder="blogs"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </Field>

            <Field label="Tags (comma-separated)">
              <input
                type="text"
                value={tags}
                onChange={(e) => {
                  setTags(e.target.value);
                  markDirty();
                }}
                placeholder="general, lms, frontline"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </Field>

            <div>
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Product<span className="text-red-500"> *</span>
              </span>
              <div className="flex gap-2">
                {[
                  { value: "learnbee", label: "Learnbee" },
                ].map((opt) => {
                  const selected = product === opt.value;
                  return (
                  <label
                    key={opt.value}
                    className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      selected
                        ? "border-violet-500 bg-violet-50 text-violet-700 ring-2 ring-violet-500/20"
                        : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="product"
                      value={opt.value}
                      checked={selected}
                      onChange={() => {
                        setProduct(opt.value);
                        markDirty();
                      }}
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={`h-[14px] w-[14px] shrink-0 rounded-full border-2 border-violet-500 transition-all duration-150 ${
                        selected ? "bg-violet-500 ring-2 ring-violet-500/25" : "bg-white"
                      }`}
                    />
                    {opt.label}
                  </label>
                  );
                })}
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
              <input
                type="checkbox"
                checked={showContactForm}
                onChange={(e) => {
                  setShowContactForm(e.target.checked);
                  markDirty();
                }}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              <span>
                <span className="block text-sm font-medium text-slate-800">
                  Show lead form on this post
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Renders below the article on live and preview. Each submission is stored with
                  this post&apos;s slug so you know which blog it came from.
                </span>
              </span>
            </label>
          </div>

          <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
            <p className="mb-1 font-medium text-slate-600">Tips</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Drag images directly into the editor</li>
              <li>Use H1 for the main title in content</li>
              <li>Save Draft often to avoid losing work</li>
              <li>Preview opens in a new tab</li>
            </ul>
          </div>
        </aside>
      </div>

      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={title}
        author={author}
        content={content}
        thumbnail={thumbnail}
        showContactForm={showContactForm}
      />

    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}
