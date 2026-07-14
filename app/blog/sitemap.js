import { getAllPosts } from "@/lib/blog";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://learnbee.ai";
  const posts = await getAllPosts();
  const now = new Date();

  // Blog listing page
  const blogIndex = {
    url: `${baseUrl}/blog`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  };

  // All blog posts
  const blogUrls = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [blogIndex, ...blogUrls];
}