import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./create.css";

/* Quick Create is type-led and sets its own font, so it loads Inter here rather
   than inheriting the site's Geist. Scoped to this route only. */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Build your course — Learnbee",
  description:
    "Describe your course, pick a source, and generate it. No account needed to start.",
  robots: { index: false },
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return <div className={inter.variable}>{children}</div>;
}
