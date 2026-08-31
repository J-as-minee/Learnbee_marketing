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

## 2026-08-28 — Terms clause 8 rewritten; "Last updated" bumped on Terms only

**What:** Section 8 (Marketing and Publicity) went from one loose paragraph to 8.1–8.6,
governing when an organisation's name or logo may appear in Learnbee marketing. The
"Last updated" date on **Terms** moved 26 June → 28 August 2026. **Privacy was left at
26 June deliberately.**
**Why:** The old clause said only "with your consent we may reference your name and logo",
which does not distinguish *a person from that company signed up* from *that company is
our customer* — the distinction that actually carries legal and reputational risk. 8.2 now
states plainly that a logo reference is a factual usage statement and not an endorsement,
sponsorship, partnership or customer claim, and requires that to be disclosed on the same
page as the logos. 8.5 puts case studies, testimonials, usage figures and any "is a
customer" claim behind prior written consent. 8.4 gives a no-reason-required removal route
(legal@learnbee.ai, 15 business days).
The date bump is not housekeeping: the change-notification wording in the same document
promises the date is revised when terms change, so shipping a rewritten clause 8 under a
26 June stamp would have contradicted the document itself. Privacy was *not* bumped
because nothing in it changed except a broken footer href — bumping it would imply a
policy change that did not happen and needlessly re-trigger "changes are effective when
posted".
**Touched:** `app/terms/content.html`, `app/privacy/content.html` (link only).
**Open:** confirm `legal@learnbee.ai` is monitored — 8.4 makes it the removal channel.

---

## 2026-08-28 — Site copy caught up with three product releases

**What:** Marketing copy and Help topics were behind the product by roughly a week. SCORM
Export's card and FAQ still described only completion/score/resume; phone playback appeared
nowhere on the site; the slide sorter had no Help coverage. Added question-level reporting
to the tracked-fields list, a phone/portrait line to Publish & Share, a Getting Started FAQ
for the sorter, and an FAQ explaining why an existing SCORM package shows none of it until
re-exported. Getting Started was then curated — three low-value or duplicated questions out,
three higher-value ones in (what Learnbee is, that it is currently free, how to sign up).
**Why:** The re-export FAQ is the important one. A SCORM zip carries its own player, so the
reporting fixes reach a customer only when they export again — without that stated, the
reporting improvements read as broken rather than as pending a re-export.
**Touched:** `components/landing/HelpWiki.tsx`, `components/landing/data.ts`.

---

## 2026-08-28 — Help knowledge base synced from the authoring repo

**What:** Mirrored `docs/HELP_KNOWLEDGE_BASE.md` from the Learnbee authoring repo: the slide
sorter, upright phone playback live on all three player surfaces, question-level SCORM
reporting, two new troubleshooting entries (LMS report wrong or empty; a slide that will not
drag), and the "exported packages are frozen until re-exported" caveat.
**Why:** This file is the single source of truth for the Help Center **and** the Help
Assistant's system prompt, but it lives in the authoring repo and is copied here **by hand**
— so it drifts silently whenever only one side is edited. Worth knowing: when this sync ran,
the file here was already carrying an uncommitted copy of an earlier (20 Aug) edit, which is
exactly the drift the manual step invites. The authoring repo's `docs/README.md` now records
the mirroring rule.
**Touched:** `HELP_KNOWLEDGE_BASE.md`.

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
