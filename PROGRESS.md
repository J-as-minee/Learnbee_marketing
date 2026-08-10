# Progress Log

Running record of decisions and implementations on the Learnbee marketing/blog site (this repo — Next.js). Newest entries at the top. One entry per notable change: what happened, why, and what it touched.

Not for day-to-day task tracking (use TODO.md for parked ideas) — this is the "why did we do it this way" record so future sessions don't have to reverse-engineer decisions from commit messages alone.

---

## How to add an entry

```
## YYYY-MM-DD — Short title

**What:** one or two sentences on the change/decision.
**Why:** the reasoning, constraint, or tradeoff that drove it.
**Touched:** key files/dirs.
```

---

## 2026-08-10 — Repo audit: CLAUDE.md mismatch identified

**What:** Reviewed repo structure (`app/`, `components/`, `lib/`, `content/`, `scripts/`) and flagged that the checked-in `CLAUDE.md` documents a *different* codebase — the Vite/React Learnbee product app (course editor, SCORM export, Supabase) — not this Next.js marketing/blog site.
**Why:** `CLAUDE.md` is auto-loaded as project instructions; a mismatched brief risks steering future work with wrong stack assumptions (Vite vs Next.js, no Supabase courses table here, etc.).
**Touched:** none yet — fix deferred, tracked in TODO.md.
**Also noted:** `lib/` is a flat 29-file directory mixing ~12 blog-CMS files (`blog-*.js`, `github-blog-*.js`) with SEO/email/utils; no test runner configured; several standalone `.md` research/content files live at repo root instead of a `docs/` folder.

---

## Earlier history (from `git log`, pre-dates this file)

- File-based blog + mini-CMS installed (git-backed drafts in `content/blog-staging` / `content/blog-clean`, admin UI under `app/blog/blog-admin`, publish/unpublish/save API routes).
- Help Centre added with AI assistant (`app/help`, `app/api/help/chat`).
- OG image generation, responsive/mobile fixes.
- Course library section / Collaborate feature landing copy — added, reverted, then reapplied (see `git log` around `c00c815`–`411685e` for the back-and-forth).
