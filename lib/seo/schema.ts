const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://learnbee.ai").replace(
  /\/$/,
  "",
);

function toAbsoluteUrl(path: string) {
  if (!path) return BASE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${normalized}`;
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Learnbee",
    url: BASE_URL,
    logo: toAbsoluteUrl("/logo.png"),
    sameAs: [],
  };
}

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Learnbee",
    url: BASE_URL,
  };
}

export function buildSoftwareApplicationSchema({
  name,
  description,
  path,
  category,
}: {
  name: string;
  description: string;
  path: string;
  category: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    applicationCategory: category,
    operatingSystem: "Web, iOS, Android",
    description,
    url: toAbsoluteUrl(path),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function buildArticleSchema({
  headline,
  description,
  path,
  datePublished,
  dateModified,
  image,
}: {
  headline: string;
  description: string;
  path: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    datePublished: datePublished || undefined,
    dateModified: dateModified || datePublished || undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": toAbsoluteUrl(path),
    },
    image: image ? [toAbsoluteUrl(image)] : undefined,
    author: {
      "@type": "Organization",
      name: "Learnbee",
    },
    publisher: {
      "@type": "Organization",
      name: "Learnbee",
      logo: {
        "@type": "ImageObject",
        url: toAbsoluteUrl("/logo.png"),
      },
    },
  };
}

export function buildBreadcrumbSchema(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  };
}
