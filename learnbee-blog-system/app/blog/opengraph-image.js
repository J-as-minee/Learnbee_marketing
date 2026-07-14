import { createOgImageResponse } from "@/lib/seo/og-image-response";
import { OG_IMAGE_SIZE } from "@/lib/seo/og-image";

export const runtime = "edge";

export const alt = "Blog | Bsharp Converse";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return createOgImageResponse({
    brand: "converse",
    title: "Blog",
    subtitle: "Insights for frontline teams",
  });
}
