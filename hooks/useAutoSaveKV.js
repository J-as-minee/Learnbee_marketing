import { useState, useEffect, useCallback, useRef } from "react";

const LOCAL_STORAGE_PREFIX = "bsharp_draft_";
const AUTO_SAVE_DELAY = 3000; // 3 seconds debounce

export function useAutoSaveKV({
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
  enabled = true,
  authPassword,
}) {
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const timeoutRef = useRef(null);
  const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

  const draftData = {
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
  };

  // Save to LocalStorage (instant)
  const saveToLocal = useCallback((data) => {
    try {
      const key = `${LOCAL_STORAGE_PREFIX}${slug || "new"}`;
      localStorage.setItem(key, JSON.stringify({ ...data, savedAt: new Date().toISOString() }));
    } catch (e) {
      console.error("LocalStorage save failed:", e);
    }
  }, [slug]);

  // Save to KV (cloud)
  const saveToKV = useCallback(async (data) => {
    if (!sessionId || !authPassword) return;

    setIsSaving(true);
    try {
      await fetch(`${BASE_PATH}/api/blog/drafts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": authPassword,
        },
        body: JSON.stringify({ sessionId, slug, ...data }),
      });
      setLastSaved(new Date().toISOString());
    } catch (e) {
      console.error("KV save failed:", e);
    } finally {
      setIsSaving(false);
    }
  }, [sessionId, slug, authPassword, BASE_PATH]);

  // Debounced auto-save
  useEffect(() => {
    if (!enabled || !title) return;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Save to localStorage immediately (debounced slightly)
    timeoutRef.current = setTimeout(() => {
      saveToLocal(draftData);
      saveToKV(draftData);
    }, AUTO_SAVE_DELAY);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, title, content, description, category, tags, product, thumbnail, thumbnailAlt, showContactForm]);

  // Restore from LocalStorage
  const restoreFromLocal = useCallback(() => {
    try {
      const key = `${LOCAL_STORAGE_PREFIX}${slug || "new"}`;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, [slug]);

  // Restore from KV
  const restoreFromKV = useCallback(async () => {
    if (!sessionId || !authPassword) return null;

    try {
      const res = await fetch(`${BASE_PATH}/api/blog/drafts?sessionId=${sessionId}&slug=${slug || "new"}`, {
        headers: { "x-admin-password": authPassword },
      });
      const data = await res.json();
      return data.draft || null;
    } catch {
      return null;
    }
  }, [sessionId, slug, authPassword, BASE_PATH]);

  // Clear saved draft
  const clearSaved = useCallback(async () => {
    try {
      const key = `${LOCAL_STORAGE_PREFIX}${slug || "new"}`;
      localStorage.removeItem(key);
    } catch {}

    if (sessionId && authPassword) {
      try {
        await fetch(`${BASE_PATH}/api/blog/drafts?sessionId=${sessionId}&slug=${slug || "new"}`, {
          method: "DELETE",
          headers: { "x-admin-password": authPassword },
        });
      } catch {}
    }
  }, [sessionId, slug, authPassword, BASE_PATH]);

  return {
    lastSaved,
    isSaving,
    restoreFromLocal,
    restoreFromKV,
    clearSaved,
  };
}
