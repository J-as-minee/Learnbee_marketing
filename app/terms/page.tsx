import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import "../site.css";
import "../legal.css";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";

export const metadata: Metadata = {
  title: "Terms & Conditions — Learnbee",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  const raw = fs.readFileSync(
    path.join(process.cwd(), "app/terms/content.html"),
    "utf8"
  );
  // The shared homepage header (SiteNav) replaces the document's own logo header.
  const html = raw.replace(/<header class="site">[\s\S]*?<\/header>/, "");

  return (
    <>
      <SiteNav />
      <div className="legal-doc">
        <div className="wrap" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <SiteFooter />
    </>
  );
}
