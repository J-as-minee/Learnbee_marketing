import { createOgImageResponse } from "@/lib/seo/og-image-response";
import type { OgBrand } from "@/lib/seo/og-image";

export const runtime = "edge";

function parseBrand(value: string | null): OgBrand {
  if (value === "converse" || value === "vantage" || value === "bsharp" || value === "learnbee") return value;
  return "learnbee";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brand = parseBrand(searchParams.get("brand"));
  const title = searchParams.get("title")?.trim() || "Learnbee";
  const subtitle = searchParams.get("subtitle")?.trim() || undefined;

  return createOgImageResponse({ brand, title, subtitle });
}
