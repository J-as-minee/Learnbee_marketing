import type { SiteName } from "./metadata-builder";

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

export type OgBrand = "bsharp" | "converse" | "vantage" | "learnbee";

export function siteNameToOgBrand(siteName: SiteName): OgBrand {
  if (siteName === "Bsharp Converse") return "converse";
  if (siteName === "Bsharp Vantage") return "vantage";
  if (siteName === "Learnbee") return "learnbee";
  return "bsharp";
}

/** Shorten page titles for OG card display (strip site suffix, cap length). */
export function displayTitleForOg(title: string, maxLen = 72): string {
  const primary = title.split("|")[0]?.trim() || title.trim();
  if (primary.length <= maxLen) return primary;
  return `${primary.slice(0, maxLen - 1).trim()}…`;
}

export function defaultOgSubtitle(brand: OgBrand): string {
  switch (brand) {
    case "converse":
      return "Bsharp Converse";
    case "vantage":
      return "Bsharp Vantage";
    case "learnbee":
      return "Learnbee";
    default:
      return "Frontline Technology Platform";
  }
}

export function ogImagePath(opts: {
  brand: OgBrand;
  title: string;
  subtitle?: string;
}): string {
  const params = new URLSearchParams({
    brand: opts.brand,
    title: displayTitleForOg(opts.title),
  });
  const subtitle = opts.subtitle?.trim();
  if (subtitle) params.set("subtitle", subtitle);
  return `/og?${params.toString()}`;
}

export function ogImageMeta(opts: {
  brand: OgBrand;
  title: string;
  subtitle?: string;
  alt?: string;
}) {
  const url = ogImagePath(opts);
  return {
    url,
    width: OG_IMAGE_SIZE.width,
    height: OG_IMAGE_SIZE.height,
    alt: opts.alt ?? displayTitleForOg(opts.title),
  };
}

export function siteOriginForOg(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://learnbee.ai").replace(/\/$/, "");
}

export function absoluteOgImageUrl(relativePath: string): string {
  if (/^https?:\/\//i.test(relativePath)) return relativePath;
  return `${siteOriginForOg()}${relativePath.startsWith("/") ? relativePath : `/${relativePath}`}`;
}
