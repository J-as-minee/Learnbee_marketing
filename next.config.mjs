/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Admin image uploads land in Vercel Blob; wildcard matches any Blob store subdomain.
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
  // Blog content is file-based (committed to git). These keep index.md in the
  // page/route lambdas and images in the image-route lambda ONLY.
  // The leading "./" on the includes is REQUIRED on Next 16 — without it,
  // zero images ship in the lambda and every blog thumbnail 404s.
  outputFileTracingExcludes: {
    "/blog/[slug]": [
      "content/blog-clean/**/images/**/*",
      "content/blog-staging/**/images/**/*",
    ],
    "/blog": [
      "content/blog-clean/**/images/**/*",
      "content/blog-staging/**/images/**/*",
    ],
  },
  outputFileTracingIncludes: {
    "/blog/[slug]": [
      "./content/blog-clean/**/index.md",
      "./content/blog-staging/**/index.md",
    ],
    "/blog": ["./content/blog-clean/**/index.md"],
    "/blog/[slug]/images/[...imagePath]": [
      "./content/blog-clean/**/images/**/*",
      "./content/blog-staging/**/images/**/*",
    ],
    "/blog/*/images/*": [
      "./content/blog-clean/**/images/**/*",
      "./content/blog-staging/**/images/**/*",
    ],
  },
};

export default nextConfig;
