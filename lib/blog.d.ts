/**
 * Type declarations for the JavaScript module `lib/blog.js`.
 *
 * The blog pipeline (gray-matter → remark → rehype) lives in plain JS; this file
 * gives its public surface a typed contract. The `product` field is REQUIRED and
 * is hard-gated at parse time by `validatePost` in lib/blog.js.
 *
 * Note: an identical `'converse' | 'vantage'` union already exists as
 * `ProductSlug` in lib/umbrella/products.ts (the product catalog domain). `Product`
 * here is the blog-domain spelling mandated by docs/blog-product-tagging-decision.md.
 */

export type Product = "converse" | "vantage";

export type BlogSource = "live" | "staging";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  thumbnailImage: string;
  featuredImage: string;
  image: string;
  readingTime: number;
  contentHtml: string;
  content: string;
  showContactForm: boolean;
  tags: string[];
  category: string;
  thumbnailAlt: string;
  product: Product;
}

export function getPostSlugsBySource(source?: BlogSource): string[];
export function getPostBySlugFromSource(
  slug: string,
  source?: BlogSource,
): Promise<BlogPost | null>;
export function getSortedPostsBySource(source?: BlogSource): Promise<BlogPost[]>;
export function getPostSlugs(): string[];
export function getPostBySlug(slug: string): Promise<BlogPost | null>;
export function getSortedPosts(): Promise<BlogPost[]>;
export function getAllPosts(): Promise<BlogPost[]>;
