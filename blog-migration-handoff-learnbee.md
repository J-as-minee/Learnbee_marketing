# Blog system migration handoff — Bsharp → Learnbee website

> **Install bundle (system only, no posts):** use folder  
> **`migration/learnbee-blog-system/`** + its **`README.md`** — pre-adapted for Learnbee (`product: learnbee`, empty content dirs).  
> This document is the longer reference / audit; the bundle README is the install guide.

**Purpose:** Give the Learnbee website owner (or their agent) everything needed to install the file-based blog + mini CMS from the Bsharp site into `learnbee-website`.

**Does NOT include:** the 68 Bsharp blog posts — Learnbee creates new content via the admin CMS.

**Source of truth (production-tested):**  
`https://github.com/bsharpmarketing11/Bsharp_Website2026.git` — branch `main`  
Latest blog fixes through commit **`35b0849`** (image route tracing + 3 Google Chat thumbnail fixes).

**Target (audited Jul 10, 2026):** `learnbee-website` — Next.js **16.1.6**, App Router, React 19.  
**Verdict:** **GO with changes** (~1–3 days port + rebrand, not a rewrite).

---

## 1. What you are installing

| Piece | Description |
|-------|-------------|
| **Public blog** | `/blog` listing + `/blog/[slug]` posts |
| **Image server** | `/blog/[slug]/images/[...path]` — serves `content/blog-clean/*/images/*` |
| **Admin CMS** | `/blog/blog-admin` — TipTap editor, publish/unpublish/delete |
| **API** | `/api/blog/*` + `/api/admin/blog-settings` |
| **Storage** | Markdown files in git (`content/blog-clean/`, `content/blog-staging/`) — **no database** |
| **Production writes** | GitHub Contents API (Vercel disk is read-only) |
| **Draft autosave** | Upstash Redis / Vercel KV (`KV_REST_API_*`) |
| **New post images** | Vercel Blob (`BLOB_READ_WRITE_TOKEN`) |
| **Email** | Resend (newsletter + optional lead forms) |

**Not included:** WordPress, MDX, Contentlayer, Sanity, or external CMS.

---

## 2. Prerequisites (target project)

Confirm before starting:

- [ ] Next.js **≥ 16**, App Router only (no `/pages` for blog)
- [ ] Node **≥ 20.9**
- [ ] `@/*` path alias in `tsconfig.json` (or adjust imports)
- [ ] Tailwind + `@tailwindcss/typography` (post body uses `prose` classes)
- [ ] No existing `/blog` or `/api/blog` routes (audit said clear on Learnbee)
- [ ] Vercel project linked to Learnbee repo (for Blob/KV/env)

---

## 3. Phase plan (agent-to-agent)

Use this sequence. After each phase, the Learnbee agent fills **§12 Status report** and waits for approval before the next phase.

| Phase | Goal | Done when |
|-------|------|-----------|
| **0** | Clone source + inventory | Source repo checked out; target has free `/blog` routes |
| **1** | Copy runtime code | All files in §4 present; `npm install` clean |
| **2** | Merge config | `next.config`, `vercel.json`, `package.json` scripts (§5–6) |
| **3** | Env vars | §7 set in Vercel + `.env.local` |
| **4** | Content | `content/blog-clean/` + images copied; build passes `blog:validate` |
| **5** | Learnbee rebrand | §8 adaptations applied |
| **6** | Nav + SEO | Blog linked in site nav; sitemap includes `/blog` |
| **7** | Production verify | §9 checklist green on preview URL |

---

## 4. File copy manifest

Copy from **source repo root** (`framer-site-conversion/` if monorepo) into the **same relative paths** on Learnbee.

### 4a. Routes — `app/`

```
app/blog/page.js
app/blog/[slug]/page.js
app/blog/[slug]/images/[...imagePath]/route.js
app/blog/sitemap.js
app/blog/opengraph-image.js
app/blog/blog-admin/page.js
app/blog/blog-admin/layout.js
app/blog/blog-admin/PreviewTokenProvider.js
app/blog/blog-admin/settings/page.js
app/blog/blog-admin/settings/layout.js
app/blog/blog-admin/submissions/page.js
app/blog/blog-admin/submissions/layout.js

app/api/blog/auth/route.js
app/api/blog/save/route.js
app/api/blog/load/route.js
app/api/blog/list/route.js
app/api/blog/publish/route.js
app/api/blog/unpublish/route.js
app/api/blog/delete/route.js
app/api/blog/drafts/route.js
app/api/blog/upload/route.js
app/api/blog/newsletter-subscribe/route.js

app/api/admin/blog-settings/route.js
```

### 4b. Components — `components/`

```
components/blog/BlogCard.js
components/blog/BlogListing.js
components/blog/BlogLayout.js
components/blog/BlogPostSidebar.js
components/blog/BlogLeadSection.js
components/blog/BlogLeadForm.js
components/blog/BlogNewsletterForm.js
components/blog/ProductTag.js

components/admin/PreviewModal.js          # admin preview modal
```

**Optional / shared site components** (copy or rewire imports):

```
components/newsletter/NewsletterSubscribeForm.js   # used by BlogNewsletterForm
components/seo/JsonLd.js                           # post JSON-LD
```

### 4c. Library — `lib/`

```
lib/blog.js                    # core engine (required)
lib/blog.d.ts                  # optional types
lib/blog-image-fs.js           # image route resolver (required)
lib/blog-asset-url.js
lib/blog-lead.js
lib/blog-settings.js
lib/blog-sidebar-flags.js
lib/blog-sidebar-posts.js
lib/blog-unpublished-meta.js
lib/preview.js
lib/admin-auth.js
lib/draft-storage.js
lib/rehype-bsharp-cta.js       # rename/rebrand later (§8)
lib/cta-props.js               # CTA blocks in posts
lib/github-blog.js
lib/github-blog-read.js
lib/github-blog-save.js
lib/github-blog-publish.js
lib/github-blog-unpublish.js
lib/github-blog-delete.js
lib/notify-newsletter-email.js
lib/notify-lead-email.js       # if lead forms enabled
```

**SEO helpers** (if Learnbee does not already have equivalent):

```
lib/seo/metadata-builder.js
lib/seo/shared.js              # add blogHome entry
lib/seo/schema.js
lib/seo/og-image.js
lib/seo/og-image-response.js
```

### 4d. Hooks

```
hooks/useAutoSaveKV.js
hooks/useAutoSave.js           # if referenced by admin
```

### 4e. Scripts — `scripts/`

```
scripts/validate-blog-frontmatter.js
scripts/verify-blog-image-trace.js
scripts/backfill-blog-product.mjs
scripts/create-staged-blog.js
scripts/publish-staged-blog.js
scripts/repair-missing-local-images.js   # maintenance
scripts/prune-missing-local-image-links.js
```

### 4f. Content (Phase 4)

```
content/blog-clean/<slug>/index.md
content/blog-clean/<slug>/images/**     # ALL images — required for thumbnails
content/blog-staging/                 # empty dir OK initially
data/blog-settings.json                 # optional defaults
```

**Do not copy:** `content/blog/` (legacy), `blog_migration/` (reference only).

**Content scope decision** (pick one before Phase 4):

| Option | Posts | Notes |
|--------|-------|-------|
| **A — Full archive** | All **68** posts | Rebrand links; set `product: learnbee` on every post |
| **B — Learnbee subset** | ~5–10 posts tagged `learnbee` | Faster; less link cleanup |

Learnbee-tagged examples: `learnbee-5-incredible-things-one-document-can-do`, `from-static-pdfs-to-learning-experiences`, `let-a-1000-experiments-bloom`.

### 4g. Do **not** copy (Bsharp-specific)

```
lib/feature-related-blogs.ts     # Converse feature modal map — skip or rewrite for Learnbee
lib/umbrella/nav.ts              # Bsharp nav only
```

---

## 5. `package.json` scripts

Add to target `package.json`:

```json
{
  "scripts": {
    "prebuild": "npm run blog:validate",
    "postbuild": "npm run blog:verify-image-trace",
    "blog:validate": "node scripts/validate-blog-frontmatter.js",
    "blog:validate:staging": "node scripts/validate-blog-frontmatter.js --source=staging",
    "blog:verify-image-trace": "node scripts/verify-blog-image-trace.js",
    "blog:repair-images": "node scripts/repair-missing-local-images.js",
    "blog:prune-missing-images": "node scripts/prune-missing-local-image-links.js",
    "blog:stage:new": "node scripts/create-staged-blog.js",
    "blog:stage:publish": "node scripts/publish-staged-blog.js",
    "backfill:blog-product": "node scripts/backfill-blog-product.mjs"
  }
}
```

If `prebuild` already exists, **chain** blog validate: `"prebuild": "npm run blog:validate && <existing>"`.

### NPM dependencies (verify installed)

```json
"gray-matter": "^4.0.3",
"remark": "^15.0.1",
"remark-gfm": "^4.0.1",
"remark-rehype": "^11.1.2",
"rehype-raw": "^7.0.0",
"rehype-stringify": "^10.0.1",
"unist-util-visit": "^5.0.0",
"@tiptap/react": "^3.20.4",
"@tiptap/starter-kit": "^3.20.4",
"@tiptap/extension-image": "^3.20.4",
"@tiptap/extension-link": "^3.20.4",
"@tiptap/extension-table": "^3.22.0",
"@tiptap/extension-youtube": "^3.20.4",
"@vercel/blob": "^2.3.2",
"@upstash/redis": "^1.37.0",
"@tailwindcss/typography": "^0.5.19"
```

(Audit said Learnbee already has most of these.)

---

## 6. Config snippets (critical)

### 6a. `next.config.mjs` — file tracing

Blog images **must** ship with the image-route lambda. Use **`./` prefix** on include globs (required on Next 16).

```javascript
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
```

Also add **remote image hosts** if using Blob or absolute URLs in posts:

```javascript
images: {
  remotePatterns: [
    { protocol: "https", hostname: "<your-blob-store>.public.blob.vercel-storage.com", pathname: "/**" },
  ],
},
```

### 6b. `vercel.json` — backup include (Vercel)

Create or merge:

```json
{
  "functions": {
    "app/blog/[slug]/images/[...imagePath]/route.js": {
      "includeFiles": "content/blog-clean/**/images/**"
    }
  }
}
```

### 6c. `.vercelignore` (optional)

```
blog_migration/output/posts/*/images
blog_migration/*.xml
```

---

## 7. Environment variables

Add to **Vercel** (Production + Preview) and `.env.local`.

### Required for admin + preview

| Variable | Purpose |
|----------|---------|
| `BLOG_ADMIN_PASSWORD` | Login for `/blog/blog-admin` |
| `BLOG_PREVIEW_TOKEN` | Draft preview: `/blog/[slug]?preview=<token>` |

### Required for production CMS writes (Vercel)

| Variable | Purpose |
|----------|---------|
| `GITHUB_TOKEN` | Fine-grained PAT — **Contents: Read and write** |
| `GITHUB_REPO` | `owner/learnbee-website` |
| `GITHUB_BRANCH` | `main` (optional) |
| `GITHUB_REPO_ROOT` | Leave empty if repo root **is** the Next app |

### Required for admin image uploads

| Variable | Purpose |
|----------|---------|
| `BLOB_READ_WRITE_TOKEN` | From Vercel → Storage → Blob |

### Required for draft autosave (admin)

| Variable | Purpose |
|----------|---------|
| `KV_REST_API_URL` | Vercel KV / Upstash |
| `KV_REST_API_TOKEN` | Vercel KV / Upstash |

> If Learnbee uses `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` instead, either duplicate values under `KV_*` names or patch `lib/draft-storage.js` to read both.

### Site metadata

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | `https://learnbee.com` (or your domain) |
| `NEXT_PUBLIC_BASE_PATH` | Usually `""` |

### Optional

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Newsletter + lead notifications |
| `NEWSLETTER_NOTIFY_EMAIL` | Team inbox for blog signups |
| `LEADS_NOTIFY_EMAIL` | Lead form notifications |
| `BLOG_IMAGE_FALLBACK_ORIGIN` | Set `""` on Learnbee — do **not** fall back to bsharpcorp.com |

---

## 8. Learnbee-specific adaptations (Phase 5)

### 8a. Product taxonomy

Source uses `product: converse | vantage`. Learnbee should replace this.

**Files to edit:**

1. `lib/blog.js` — `VALID_PRODUCTS = ["learnbee"]` (or `["learnbee", "resources"]`)
2. `components/blog/ProductTag.js` — labels/colors for Learnbee
3. `app/blog/blog-admin/page.js` — product dropdown in editor
4. `scripts/backfill-blog-product.mjs` — default product value
5. All `content/blog-clean/*/index.md` — set `product: learnbee` in frontmatter

Run after content copy:

```bash
node scripts/backfill-blog-product.mjs   # edit script first for learnbee default
```

### 8b. Branding / copy

Search-and-replace in ported files:

| Find | Replace with |
|------|----------------|
| `Bsharp Converse` | `Learnbee` (or your blog title) |
| `bsharpcorp.com` | `learnbee.com` |
| `/converse/learnbee` | Learnbee product URL |
| `rehype-bsharp-cta` | rename to `rehype-learnbee-cta` (optional) |
| `bsharp-cta-editor-placeholder` | learnbee equivalent in admin TipTap |

### 8c. Post content link cleanup

Migrated posts link to Bsharp routes (`/contact-sales`, `/converse/*`, `/celebrate`, old `/blogs/`). After port:

```bash
# Example audit — run on learnbee repo
rg "bsharpcorp\.com|/converse/|/celebrate|contact-sales|/blogs/" content/blog-clean
```

Update or redirect broken links before go-live.

### 8d. Layout / chrome

- Wrap `BlogLayout` in Learnbee site header/footer (or use Learnbee root layout)
- Update `app/blog/page.js` metadata — replace `blogHome` in `lib/seo/shared.js`
- Add **Blog** to Learnbee main nav → `/blog`

### 8e. Thumbnail hygiene (lesson from Bsharp prod)

Every post needs `thumbnail` pointing at a file that **exists** in `content/blog-clean/<slug>/images/`.

Bad pattern (causes 404):

```yaml
thumbnail: ''
coverImage: Some-WordPress-Feature-Image-That-Was-Never-Migrated.png
```

Good pattern:

```yaml
thumbnail: /blog/<slug>/images/<actual-file-in-repo>.png
coverImage: <actual-file-in-repo>.png
```

---

## 9. Verification checklist (Phase 7)

Run on **preview deploy** before production:

```bash
npm run blog:validate
npm run build          # includes postbuild image-trace check
npm run start
```

| Check | URL / action | Expected |
|-------|----------------|----------|
| Listing | `/blog` | Grid of cards with thumbnails |
| Sample post | `/blog/learnbee-5-incredible-things-one-document-can-do` | Renders body + images |
| Image route | `/blog/<slug>/images/<file>.png` | **200** (not 404) |
| Admin login | `/blog/blog-admin` | Password gate works |
| Save draft | Admin → save | KV autosave or GitHub commit |
| Upload image | Admin → insert image | Blob URL in markdown |
| Preview | `/blog/<slug>?preview=<token>` | Staging post visible |
| Sitemap | `/blog/sitemap.xml` | Lists all slugs |
| OG | View source on `/blog` | `og:image` present |

**Image trace gate** (must pass in CI/build):

```bash
npm run blog:verify-image-trace
# → OK — 294 blog images traced (count varies by content scope)
```

---

## 10. Quick install commands (Learnbee agent)

```bash
# 0. Clone source (read-only reference)
git clone https://github.com/bsharpmarketing11/Bsharp_Website2026.git bsharp-blog-source
cd bsharp-blog-source   # or cd framer-site-conversion if nested

# 1. Copy code (example — adjust paths)
LEARNBEE=../learnbee-website
rsync -av --relative \
  ./app/blog ./app/api/blog ./app/api/admin/blog-settings \
  ./components/blog ./components/admin/PreviewModal.js \
  ./lib/blog.js ./lib/blog-image-fs.js ./lib/blog-*.js ./lib/github-blog*.js \
  ./lib/draft-storage.js ./lib/preview.js ./lib/admin-auth.js \
  ./lib/rehype-bsharp-cta.js ./lib/cta-props.js \
  ./hooks/useAutoSaveKV.js \
  ./scripts/validate-blog-frontmatter.js ./scripts/verify-blog-image-trace.js \
  "$LEARNBEE/"

# 2. Copy content + images (full archive)
rsync -av ./content/blog-clean/ "$LEARNBEE/content/blog-clean/"
mkdir -p "$LEARNBEE/content/blog-staging"

# 3. Install + validate
cd "$LEARNBEE"
npm install
npm run blog:validate
npm run build
```

Then merge §5–6 config, set §7 env vars, apply §8 rebrand.

---

## 11. Known issues / pitfalls (from Bsharp production)

1. **Missing `./` in `outputFileTracingIncludes`** → all thumbnails 404 on Vercel (fixed in `8349bef`).
2. **Empty `thumbnail` + wrong `coverImage` filename** → falls back to dead remote URL (fixed for 3 posts in `35b0849`).
3. **`product` field required at build** — every `index.md` must have valid `product`.
4. **Admin save on Vercel without `GITHUB_TOKEN`** → read-only filesystem error.
5. **Blob token missing** → image upload 503 in admin.
6. **Double titles on listing** — broken thumbnail shows `alt={title}` above card title; fixing images fixes UX.
7. **Do not rely on `BLOG_IMAGE_FALLBACK_ORIGIN=www.bsharpcorp.com`** on Learnbee — ship images in repo.

---

## 12. Phase status report template (return to Bsharp agent)

Copy this block after each phase:

```markdown
## Learnbee blog migration — Phase N status

- **Phase:** N (name)
- **Branch:** 
- **Preview URL:** 
- **Commit:** 

### Completed
- 

### Verification
- [ ] command / check → result

### Blockers
- 

### Questions for Bsharp agent
- 

### Ready for next phase?
- [ ] Yes / No
```

---

## 13. Support reference docs (source repo)

| Doc | Path |
|-----|------|
| Full system audit | `docs/blog-system-audit.md` |
| Architecture notes | `docs/architecture.md` (§ blog + file tracing) |
| This handoff | `docs/blog-migration-handoff-learnbee.md` |

---

## 14. Contact / handoff

**From:** Bsharp website repo (`Bsharp_Website2026`, `main` @ `35b0849`)  
**To:** Learnbee website owner / agent  
**Estimated effort:** 1–3 days with compatibility audit already done  
**Blocking env for go-live:** `GITHUB_TOKEN`, `GITHUB_REPO`, `BLOG_ADMIN_PASSWORD`, `BLOB_READ_WRITE_TOKEN`, KV credentials

When Phases 0–7 are complete, share preview URL + `npm run build` log for final sign-off.
