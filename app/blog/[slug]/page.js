import "../blog-chrome.css";
import { notFound } from "next/navigation";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";
import BlogLayout from "@/components/blog/BlogLayout";
import BlogLeadSection from "@/components/blog/BlogLeadSection";
import BlogPostSidebar from "@/components/blog/BlogPostSidebar";
import ProductTag from "@/components/blog/ProductTag";
import { BLOG_POST_SIDEBAR_WIDGETS_ENABLED } from "@/lib/blog-sidebar-flags";
import {
  getPostBySlug,
  getPostBySlugFromSource,
  getPostSlugs,
  getSortedPosts,
  getSortedPostsBySource,
} from "@/lib/blog";
import { isValidPreviewToken } from "@/lib/preview";
import { getBlogSettings } from "@/lib/blog-settings";
import { resolveSidebarPosts } from "@/lib/blog-sidebar-posts";
import JsonLd from "@/components/seo/JsonLd";
import { buildArticleSchema } from "@/lib/seo/schema";
import { ogImagePath } from "@/lib/seo/og-image";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasTitleHeadingInContent(contentHtml, title) {
  if (!contentHtml || !title) return false;
  const plain = title.trim();
  const encoded = plain.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  for (const variant of [plain, encoded]) {
    const re = new RegExp(`<h[1-6][^>]*>\\s*${escapeRegExp(variant)}\\s*<\\/h[1-6]>`, "i");
    if (re.test(contentHtml)) return true;
  }
  return false;
}

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  const isPreview = isValidPreviewToken(query?.preview || "");
  const post = isPreview
    ? await getPostBySlugFromSource(slug, "staging")
    : await getPostBySlug(slug);
  const canonicalPath = `/blog/${slug}`;

  if (!post) {
    return {
      ...(isPreview
        ? {
            title: "Preview Not Found",
            description: "The requested preview post could not be found.",
            robots: {
              index: false,
              follow: false,
              googleBot: {
                index: false,
                follow: false,
              },
            },
          }
        : {
            title: "Post Not Found | Learnbee",
            description: "The requested post could not be found.",
          }),
    };
  }

  const description = post.description || `Read ${post.title} on the Learnbee blog.`;
  const ogImage =
    post.featuredImage ||
    ogImagePath({
      brand: "learnbee",
      title: post.title,
      subtitle: "Learnbee Blog",
    });

  return {
    title: post.title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: post.title,
      description,
      images: [ogImage],
      type: "article",
      url: canonicalPath,
      publishedTime: post.date ? new Date(post.date).toISOString() : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [ogImage],
    },
    ...(isPreview
      ? {
          robots: {
            index: false,
            follow: false,
            googleBot: {
              index: false,
              follow: false,
            },
          },
        }
      : {}),
  };
}

export default async function BlogPostPage({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  const isPreview = isValidPreviewToken(query?.preview || "");

  // Load from staging if preview mode, otherwise from live
  const post = isPreview
    ? await getPostBySlugFromSource(slug, "staging")
    : await getPostBySlug(slug);
  if (!post) notFound();
  const showTitle = !hasTitleHeadingInContent(post.contentHtml, post.title);

  const [settings, allPosts] = await Promise.all([
    getBlogSettings(),
    isPreview ? getSortedPostsBySource("staging") : getSortedPosts(),
  ]);
  const sidebarPosts = BLOG_POST_SIDEBAR_WIDGETS_ENABLED
    ? resolveSidebarPosts(settings, slug, post, allPosts)
    : [];
  const articleSchema = buildArticleSchema({
    headline: post.title,
    description: post.description || `Read ${post.title} on the Learnbee blog.`,
    path: `/blog/${slug}`,
    datePublished: post.date ? new Date(post.date).toISOString() : undefined,
    dateModified: post.date ? new Date(post.date).toISOString() : undefined,
    image: post.featuredImage,
  });
  const sidebar = BLOG_POST_SIDEBAR_WIDGETS_ENABLED ? (
    <BlogPostSidebar
      settings={settings}
      sidebarPosts={sidebarPosts}
      blogSlug={slug}
      previewMode={isPreview}
    />
  ) : null;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteNav />
      <BlogLayout sidebar={sidebar}>
      <JsonLd data={articleSchema} />
      {isPreview && (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Preview mode: this draft is not published.
        </div>
      )}
      <div className="!mb-2 flex flex-wrap items-center gap-3">
        {post.date ? (
          <p className="!my-0 text-sm font-medium text-violet-700">
            {formatDate(post.date)} {post.readingTime ? `• ${post.readingTime} min read` : ""}
          </p>
        ) : null}
        <ProductTag product={post.product} />
      </div>
      {showTitle ? (
        <h1 className="!mb-6 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
          {post.title}
        </h1>
      ) : null}

      <article className="max-w-none">
        <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      </article>

      <BlogLeadSection
        blogSlug={slug}
        show={post.showContactForm}
        previewMode={isPreview}
      />
      </BlogLayout>
      <SiteFooter />
    </div>
  );
}

