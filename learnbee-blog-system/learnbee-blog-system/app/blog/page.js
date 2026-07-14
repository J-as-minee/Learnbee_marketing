import { Suspense } from "react";
import BlogCard from "@/components/blog/BlogCard";
import BlogListing from "@/components/blog/BlogListing";
import { getSortedPosts } from "@/lib/blog";
import { buildPageMetadata } from "@/lib/seo/metadata-builder";
import { blogHome } from "@/lib/seo/blog-seo";

export const metadata = {
  ...buildPageMetadata(blogHome),
  /** Explicit allow-list for crawlers (blog listing must be indexed). */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default async function BlogPage() {
  const posts = await getSortedPosts();

  // Ship only what the cards + filter/search need (omit the heavy contentHtml).
  const items = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    readingTime: post.readingTime,
    thumbnailImage: post.thumbnailImage,
    thumbnailAlt: post.thumbnailAlt,
    product: post.product,
  }));

  return (
    <main className="bg-white px-6 py-14 sm:py-16">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-10 max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Blog
          </h1>
          <p className="mt-3 text-slate-600">
            Ideas, experiments, and practical guides for frontline learning.
          </p>
        </div>

        <Suspense
          fallback={
            items.length ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            ) : (
              <p className="text-slate-600">No blog posts yet.</p>
            )
          }
        >
          <BlogListing posts={items} />
        </Suspense>
      </div>
    </main>
  );
}
