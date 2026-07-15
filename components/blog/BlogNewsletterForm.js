"use client";

import NewsletterSubscribeForm from "@/components/newsletter/NewsletterSubscribeForm";

export default function BlogNewsletterForm({
  blogSlug = "",
  heading,
  description,
  previewMode = false,
}) {
  return (
    <NewsletterSubscribeForm
      source="blog-sidebar"
      variant="card"
      heading={heading}
      description={description}
      blogSlug={blogSlug}
      pagePath={blogSlug ? `/blog/${blogSlug}` : "/blog"}
      previewMode={previewMode}
    />
  );
}
