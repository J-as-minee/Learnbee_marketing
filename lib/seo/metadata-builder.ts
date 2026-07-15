import type { Metadata } from "next";
import {
  defaultOgSubtitle,
  ogImageMeta,
  siteNameToOgBrand,
  type OgBrand,
} from "./og-image";

export type SiteName = "Bsharp" | "Bsharp Converse" | "Bsharp Vantage" | "Learnbee";

export type PageSeo = {
  path: string;
  title: string;
  description: string;
  siteName?: SiteName;
  /** Override auto-generated /og preview. Use for custom PNGs (e.g. case studies). */
  image?: string;
  imageAlt?: string;
  ogBrand?: OgBrand;
  ogSubtitle?: string;
};

function normalizePath(path: string): string {
  if (!path || path === "/") return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

function resolveOgImage(seo: PageSeo) {
  if (seo.image) {
    return {
      url: seo.image,
      width: 1200,
      height: 630,
      alt: seo.imageAlt ?? seo.title,
    };
  }

  const brand = seo.ogBrand ?? siteNameToOgBrand(seo.siteName ?? "Learnbee");
  return ogImageMeta({
    brand,
    title: seo.title,
    subtitle: seo.ogSubtitle ?? defaultOgSubtitle(brand),
    alt: seo.imageAlt ?? seo.title,
  });
}

/** Build complete Metadata: title, description, canonical, Open Graph, and Twitter. */
export function buildPageMetadata({
  path,
  title,
  description,
  siteName = "Learnbee",
  image,
  imageAlt,
  ogBrand,
  ogSubtitle,
}: PageSeo): Metadata {
  const canonical = normalizePath(path);
  const ogImage = resolveOgImage({
    path,
    title,
    description,
    siteName,
    image,
    imageAlt,
    ogBrand,
    ogSubtitle,
  });

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}
