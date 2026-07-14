import { getBlogPreviewToken } from "@/lib/preview";
import { PreviewTokenProvider } from "./PreviewTokenProvider";

/** Read BLOG_PREVIEW_TOKEN at request time (Vercel env) — avoids empty token if layout was prerendered without env at build. */
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog Admin | Bsharp",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  const previewToken = getBlogPreviewToken();
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-slate-50">
      <PreviewTokenProvider token={previewToken}>{children}</PreviewTokenProvider>
    </div>
  );
}
