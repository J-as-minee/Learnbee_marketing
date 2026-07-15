import "./blog-chrome.css";
import { Suspense } from "react";
import { getSortedPosts } from "@/lib/blog";
import { buildPageMetadata } from "@/lib/seo/metadata-builder";
import { blogHome } from "@/lib/seo/blog-seo";
import BlogListing from "@/components/blog/BlogListing";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";

export const metadata = buildPageMetadata(blogHome);

export default async function BlogIndexPage() {
  const posts = await getSortedPosts();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Blog</h1>
          <p className="mt-3 text-lg text-slate-600">
            Insights, guides, and product updates from Learnbee.
          </p>
        </header>
        <Suspense fallback={<p className="text-slate-500">Loading posts…</p>}>
          <BlogListing posts={posts} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
