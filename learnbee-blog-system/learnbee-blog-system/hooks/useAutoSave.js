"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export function useAutoSave({
  slug,
  title,
  author,
  description,
  category,
  tags,
  thumbnail,
  thumbnailAlt,
  showContactForm,
  content,
  enabled,
}) {
  const storageKey = useMemo(
    () => `bsharp_draft_${slug || "new"}`,
    [slug],
  );

  const [lastSaved, setLastSaved] = useState(null);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);

  const draftData = useMemo(
    () => ({
      slug: slug || "",
      title: title || "",
      author: author || "",
      description: description || "",
      category: category || "",
      tags: tags || "",
      thumbnail: thumbnail || "",
      thumbnailAlt: thumbnailAlt || "",
      showContactForm: Boolean(showContactForm),
      content: content || "",
    }),
    [
      slug,
      title,
      author,
      description,
      category,
      tags,
      thumbnail,
      thumbnailAlt,
      showContactForm,
      content,
    ],
  );

  const saveNow = useCallback(() => {
    if (!enabled || typeof window === "undefined") return;

    const savedAt = new Date().toISOString();
    const payload = { ...draftData, savedAt };

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(payload));
      setLastSaved(savedAt);
      setHasSavedDraft(true);
      console.log("Draft auto-saved");
    } catch {
      // ignore storage quota/private mode failures
    }
  }, [enabled, draftData, storageKey]);

  const restore = useCallback(() => {
    if (typeof window === "undefined") return null;

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed?.savedAt) setLastSaved(parsed.savedAt);
      setHasSavedDraft(true);
      return parsed;
    } catch {
      return null;
    }
  }, [storageKey]);

  const clearSaved = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    setHasSavedDraft(false);
    setLastSaved(null);
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        setHasSavedDraft(false);
        setLastSaved(null);
        return;
      }
      const parsed = JSON.parse(raw);
      setHasSavedDraft(true);
      setLastSaved(parsed?.savedAt || null);
    } catch {
      setHasSavedDraft(false);
      setLastSaved(null);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!enabled) return undefined;

    const debounce = window.setTimeout(() => {
      saveNow();
    }, 2000);

    return () => window.clearTimeout(debounce);
  }, [enabled, draftData, saveNow]);

  useEffect(() => {
    if (!enabled) return undefined;

    const id = window.setInterval(() => {
      saveNow();
    }, 30000);

    return () => window.clearInterval(id);
  }, [enabled, saveNow]);

  return {
    lastSaved,
    restore,
    clearSaved,
    hasSavedDraft,
  };
}

export default useAutoSave;
