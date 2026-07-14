# Learnbee blog system — install bundle

Portable copy of the Bsharp file-based blog + mini CMS, **pre-adapted for Learnbee**.

**Includes:** public blog, image route, full admin CMS, newsletter + lead forms, OG images.  
**Does NOT include:** the 68 Bsharp blog posts — Learnbee will create new posts via the admin.

**Source:** `Bsharp_Website2026` repo (`framer-site-conversion/`), commits through `35b0849`.

---

## What you confirmed (scope)

| Item | Decision |
|------|----------|
| Migrated Bsharp posts | **No** — empty `content/blog-clean/` |
| Admin CMS | **Yes** — full `/blog/blog-admin` |
| Forms | **Yes** — newsletter + lead capture |
| `product` field | **`learnbee` only** (already patched in this bundle) |
| Starter content | **Empty dirs only** |

---

## 1. Install (copy into Learnbee repo)

Copy everything in this folder into the **root** of `learnbee-website`, preserving paths:

```
learnbee-blog-system/
  app/          →  learnbee-website/app/
  components/   →  learnbee-website/components/
  lib/          →  learnbee-website/lib/
  hooks/        →  learnbee-website/hooks/
  scripts/      →  learnbee-website/scripts/
  content/      →  learnbee-website/content/
  data/         →  learnbee-website/data/
  config-snippets/   →  reference only (merge manually)
```

**Windows / Mac example:**

```bash
# From inside learnbee-website repo root
cp -R /path/to/learnbee-blog-system/{app,components,lib,hooks,scripts,content,data} .
```

Do **not** overwrite unrelated Learnbee files — merge `app/blog` and `app/api/blog` only if those paths are empty.

---

## 2. `package.json` scripts

Add (or chain with existing `prebuild`):

```json
{
  "scripts": {
    "prebuild": "npm run blog:validate",
    "postbuild": "npm run blog:verify-image-trace",
    "blog:validate": "node scripts/validate-blog-frontmatter.js",
    "blog:verify-image-trace": "node scripts/verify-blog-image-trace.js"
  }
}
```

Verify these dependencies exist (audit said Learnbee already has most):

`gray-matter`, `remark`, `remark-gfm`, `remark-rehype`, `rehype-raw`, `rehype-stringify`, `unist-util-visit`, `@tiptap/*`, `@vercel/blob`, `@upstash/redis`, `@tailwindcss/typography`

---

## 3. Config merge

### `next.config.mjs`

Merge snippets from `config-snippets/next.config.blog-snippet.mjs` — especially **`./` prefixed** `outputFileTracingIncludes` (required for thumbnails on Vercel).

### `vercel.json`

Merge or create from `config-snippets/vercel.json`.

### Environment variables

See `config-snippets/env.blog.example`. **Minimum for production CMS:**

- `BLOG_ADMIN_PASSWORD`
- `BLOG_PREVIEW_TOKEN`
- `GITHUB_TOKEN` + `GITHUB_REPO`
- `BLOB_READ_WRITE_TOKEN`
- `KV_REST_API_URL` + `KV_REST_API_TOKEN`
- `RESEND_API_KEY` (+ notify emails) for forms

Set `BLOG_IMAGE_FALLBACK_ORIGIN=` empty (do not point at bsharpcorp.com).

---

## 4. Learnbee-specific setup still required

These are **not** automatic — do after copy:

| Task | Action |
|------|--------|
| **Logo for OG cards** | Add `public/images/brand/learnbee-logo.png` (path used in `lib/seo/og-image-response.tsx`) |
| **Site nav** | Link to `/blog` from Learnbee header/footer |
| **Layout** | Ensure blog pages use Learnbee chrome (`BlogLayout` is minimal — may need wrapper) |
| **Privacy URL** | Set `NEXT_PUBLIC_PRIVACY_POLICY_URL` if using lead forms |
| **Rebrand CTAs** | Optional: rename `rehype-bsharp-cta.js` → `rehype-learnbee-cta.js` |
| **OG route** | Bundle includes `app/og/route.tsx` — merge if Learnbee has no `/og` yet |

---

## 5. Creating the first post

1. Deploy with env vars set.
2. Open `/blog/blog-admin` → log in with `BLOG_ADMIN_PASSWORD`.
3. Create post → upload images (goes to Vercel Blob) or save images under `content/blog-clean/<slug>/images/`.
4. Publish → commits via GitHub on Vercel, or writes locally in dev.

**Required frontmatter** (admin sets these):

```yaml
title: ...
date: 2026-07-14
author: ...
description: ...
categories: [blogs]
product: learnbee
tags: [general]
thumbnail: /blog/<slug>/images/<file>.png   # or Blob HTTPS URL
```

---

## 6. Verify

```bash
npm run blog:validate    # OK with 0 posts
npm run build            # postbuild passes even with no images yet
```

After first published post with local images:

```bash
npm run blog:verify-image-trace   # should list traced images
```

| URL | Expected |
|-----|----------|
| `/blog` | Empty listing (until posts exist) |
| `/blog/blog-admin` | Admin login |
| `/blog/<slug>/images/<file>` | 200 for committed images |

---

## 7. Bundle contents (pre-patched for Learnbee)

- `lib/blog.js` → `VALID_PRODUCTS = ["learnbee"]`
- `components/blog/ProductTag.js` → Learnbee pill
- `app/blog/blog-admin/page.js` → product dropdown = Learnbee only
- `lib/seo/blog-seo.ts` → blog listing metadata
- `app/blog/page.js` → imports `blog-seo.ts`
- `scripts/verify-blog-image-trace.js` → passes when no posts yet

---

## 8. Phase status (for agent handoff)

After each install phase, report back:

```markdown
## Learnbee blog install — status
- Phase: 
- Preview URL: 
- `npm run build`: pass/fail
- Blockers: 
```

---

## 9. Support reference

Longer audit + pitfalls: `docs/blog-migration-handoff-learnbee.md` in the Bsharp source repo.

Production lessons baked into this bundle:

- Image route file tracing must use `./content/blog-clean/**/images/**/*`
- `thumbnail` must point at files that exist in repo or Blob URLs
- Admin save on Vercel requires GitHub token

---

## 10. File manifest

Run from bundle root:

```bash
find . -type f ! -path './config-snippets/*' | sort
```

~75 files: `app/blog/*`, `app/api/blog/*`, `components/blog/*`, `lib/blog*`, `lib/github-blog*`, `lib/seo/*`, scripts, hooks, empty content dirs.
