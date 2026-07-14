/**
 * Shared CTA block schema: TipTap attrs, data-props encoding, defaults.
 */

export const CTA_VARIANTS = [
  { id: "banner", label: "Banner" },
  { id: "card", label: "Card" },
  { id: "compact", label: "Compact" },
];

export const CTA_BG_MODES = [
  { id: "none", label: "None" },
  { id: "color", label: "Solid color" },
  { id: "image", label: "Image" },
];

/** Tailwind classes for solid backgrounds (must appear in source for Tailwind to emit). */
export const CTA_BG_COLORS = [
  { id: "violet", label: "Violet", className: "bg-violet-600" },
  { id: "slate", label: "Slate", className: "bg-slate-700" },
  { id: "rose", label: "Rose", className: "bg-rose-600" },
  { id: "emerald", label: "Emerald", className: "bg-emerald-600" },
  { id: "dark", label: "Dark", className: "bg-slate-900" },
  { id: "light", label: "Light", className: "bg-slate-100" },
];

export function defaultCtaAttrs() {
  return {
    title: "Headline",
    subcopy: "Supporting text for your call to action.",
    buttonLabel: "Get started",
    buttonUrl: "",
    variant: "card",
    bgMode: "color",
    bgColor: "violet",
    bgImageUrl: "",
    /** Focal point for background-size: cover (0–100). Center = 50. */
    bgImagePosX: "50",
    bgImagePosY: "50",
    overlay: "45",
  };
}

/** Clamp background focal percentages for CSS background-position. */
export function parseBgImagePosition(attrs) {
  const x = Math.min(100, Math.max(0, parseInt(String(attrs?.bgImagePosX ?? 50), 10) || 50));
  const y = Math.min(100, Math.max(0, parseInt(String(attrs?.bgImagePosY ?? 50), 10) || 50));
  return { x, y };
}

/**
 * TipTap may pass `undefined` for attrs; spreading those overwrites defaults with undefined.
 * JSON.stringify then drops keys, so bgMode could be lost while bgImageUrl remains → wrong branch in rehype.
 */
function mergeCtaAttrs(attrs) {
  const cleaned = Object.fromEntries(
    Object.entries(attrs || {}).filter(([, v]) => v !== undefined && v !== null),
  );
  const merged = { ...defaultCtaAttrs(), ...cleaned };
  if (merged.bgMode !== "none" && isSafeBackgroundImageUrl(merged.bgImageUrl)) {
    merged.bgMode = "image";
  }
  return merged;
}

export function encodeCtaProps(attrs) {
  try {
    return encodeURIComponent(JSON.stringify(mergeCtaAttrs(attrs)));
  } catch {
    return encodeURIComponent(JSON.stringify(defaultCtaAttrs()));
  }
}

export function decodeCtaProps(encoded) {
  if (encoded == null || encoded === "") return defaultCtaAttrs();
  const raw = typeof encoded === "string" ? encoded : String(encoded);
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (!parsed || typeof parsed !== "object") return defaultCtaAttrs();
    return mergeCtaAttrs(parsed);
  } catch {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return defaultCtaAttrs();
      return mergeCtaAttrs(parsed);
    } catch {
      return defaultCtaAttrs();
    }
  }
}

export function isSafeBackgroundImageUrl(url) {
  const u = String(url || "").trim();
  if (!u) return false;
  if (u.startsWith("/") && !u.startsWith("//")) return true;
  try {
    const parsed = new URL(u);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}
