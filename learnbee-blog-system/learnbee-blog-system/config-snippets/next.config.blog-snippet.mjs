// Merge into learnbee-website next.config.mjs

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

// images.remotePatterns — add your Blob store hostname
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "<your-store>.public.blob.vercel-storage.com",
      pathname: "/**",
    },
  ],
},
