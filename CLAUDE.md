# Learnbee — Claude Code Project Brief

## What is Learnbee
A modern training content authoring tool — standalone product (extracted from Bsharp Converse). Replaces Articulate Rise 360. Produces editorial-quality, animated courses with SCORM 1.2 export, AI narration, and shareable online player.

The core insight: most corporate training looks like 2005 PowerPoint. Learnbee produces courses that feel like NYT interactive editorials — alive, readable, memorable.

## Tech Stack
- **Framework:** React 18 + TypeScript (Vite)
- **UI:** ShadCN v4 (uses `@base-ui/react` — `asChild` prop does NOT exist)
- **Styling:** Tailwind CSS v4
- **Animation:** Framer Motion
- **Storage:** Supabase Postgres (`courses`/`modules`/`slides`, primary store) + localStorage (cache) + IndexedDB (audio cache)
- **AI — outline generation:** `claude-opus-4-7` via `/api/anthropic/` proxy
- **AI — slide assist + narration:** `claude-opus-4-7` / `claude-sonnet-4-6`
- **TTS — English + European:** OpenAI TTS via `/api/tts`
- **TTS — Indian languages:** Sarvam Bulbul v3 via `/api/sarvam-tts`
- **Images:** Pexels API via `/api/pexels` + own image library on Supabase Storage (`course-media` bucket) optimised with `sharp` (WebP, 1280px max, 32px blur thumb)
- **Image library DB:** `images` table + `image_courses` junction (tag-based; one image, many courses)
- **Publishing:** Supabase Storage (`published-courses` bucket, public)
- **Auth:** Clerk (sign-in/sign-up wired) + **Supabase Third-Party Auth integration** — Clerk's native session JWT is trusted by Supabase; the supabase client attaches it on every request via the `accessToken` callback in `src/lib/supabase.ts`
- **RLS:** **Enabled** on `courses` / `modules` / `slides` with per-user policies (`created_by = auth.jwt() ->> 'sub'`). Policies are `FOR ALL` (no `TO authenticated` — Clerk's JWT has no `role` claim, so the role gate would fail-closed); security is enforced by the `created_by` check
- **Tenant id:** Clerk `userId` today (= `created_by`); when org-roles land, an OR clause referencing a `course_collaborators` table extends the policy without rewriting it. `org_id` column already exists on `courses` (nullable) for forward compat. Always read tenancy via `src/lib/tenant.ts`, never directly
- **Router:** React Router v7
- **API runtime:** Vercel Node functions for image pipeline (sharp), Edge for Pexels/TTS proxies

## Brand & Design Tokens
- **Primary purple (editor chrome):** `#9333EA`
- **Primary amber (slide accents):** `#F0A500`
- **Dark slide bg:** `#1A1A2E` / `#0F1729`
- **Typography floor:** 27px minimum for slide headings (clamp-based)
- **Body-text floor in slide formats:** **14px minimum** in player/SCORM/preview — applies to paragraph body, list items, descriptions, accordion bodies, comparison rows, scenario card text. Chrome (badges, eyebrow labels, counters) can stay smaller.

## Critical ShadCN v4 Note
ShadCN v4 uses `@base-ui/react`. The `asChild` prop does NOT exist.
**Wrong:** `<DropdownMenuTrigger asChild><Button /></DropdownMenuTrigger>`
**Right:** `<DropdownMenuTrigger className="..."><Icon /></DropdownMenuTrigger>`

---

## Scope Discipline — surface ownership matrix

The three player surfaces (editor preview, `/play/`, SCORM zip) all render the same React format components via SSR. They do **not** share their runtime / state-machine code. When working on one surface, **stay inside that surface's files**.

| Surface | Entry file(s) | Owns |
|---|---|---|
| **Editor preview** | `src/pages/PlayerPage.tsx` | Preview-iframe player, used in editor |
| **`/play/{code}`** | `src/pages/PlayPage.tsx` | Public hosted player |
| **SCORM zip** | `src/lib/scorm.ts`, `src/lib/scormSsr.ts` | Self-contained HTML player embedded in zip |
| **Shared (all three)** | `src/components/formats/*/component.tsx` | The visual format components (SSR'd into all three surfaces) |
| **Shared player infra** | `src/lib/formatGroups.ts`, `src/lib/publish.ts`, `src/lib/audioCache.ts`, `src/lib/db.ts` | Helpers consumed across surfaces |

**Rules of the road:**

- **SCORM bug fix?** Default to editing **`src/lib/scorm.ts`** only. Do **not** modify `PlayPage.tsx` or `PlayerPage.tsx` unless the user explicitly authorizes a cross-cutting change. The two pages are stable and shouldn't move when SCORM issues are being worked.
- **`/play/` bug fix?** Default to **`PlayPage.tsx`**. Mirror the same change into **`PlayerPage.tsx`** if it affects the editor-preview parity — these two are kept symmetric by convention.
- **Editor preview bug?** Default to **`PlayerPage.tsx`**. Same symmetric-mirror rule with `PlayPage.tsx`.
- **Format component bug (visual/layout)?** Edit the component in `src/components/formats/<Format>/component.tsx`. The change automatically flows to all three surfaces via SSR. Verify the user explicitly wants the change to propagate.
- **Cross-cutting work (e.g., porting click mode from `/play/` to SCORM = Phase C)?** This is the **exception**, not the rule. Announce it explicitly: "this requires edits to both `scorm.ts` AND `PlayPage.tsx` because…" — get acknowledgment before touching multiple surfaces.

**Why this matters:** the player code is a high-stakes surface (live customer pilots, shipped behaviour, no easy rollback for SCORM courses already in LMSes). An accidental refactor while fixing an unrelated SCORM issue can break the player surface that's working. Treat each surface as a separate codebase that happens to share components.

**When in doubt, ask.** If a SCORM fix appears to need a `PlayPage.tsx` change, surface that to the user before editing — there's almost always a SCORM-only path.

---

## Role Play (codename: Dialogue) — pilot codebase, separate from Content Creator

**Status (15 May 2026):** A second product surface, **Role Play**, was developed in a parallel session and is now landing on `dev`. It's a conversational voice coaching+testing agent (learner role-plays with an AI customer, then debriefs with an AI coach). Lives entirely under its own file prefix and route prefix — **never co-mingle with Content Creator code.**

### Brand vs codename

- **"Role Play"** is the user-facing brand name. Use it in routes, UI labels, marketing copy, error messages, and anything a learner or admin sees.
- **"Dialogue"** is the internal codename, frozen at first commit to avoid pointless churn. Use it in file names (`dialogue*.ts`, `Dialogue*.tsx`), DB tables (`dialogue_configs`, `dialogue_sessions`, …), type names (`DialogueConfig`, `DialogueScenario`), API helper functions, and code comments.

When in doubt: if a user reads it, write "Role Play". If only a developer reads it, write "Dialogue". Don't refactor — the split is intentional and stable.

### Scope discipline — Role Play is its own codebase

| Surface | Files (internal: "dialogue") | Routes (user-facing: "roleplay") |
|---|---|---|
| **Runtime** | `src/lib/dialogue.ts`, `src/lib/dialogueAi.ts`, `src/lib/dialoguePdf.ts`, `src/lib/dialoguePlay.ts`, `src/lib/dialogueStt.ts` | n/a |
| **Admin pages** | `src/pages/DialogueListPage.tsx`, `src/pages/DialogueWizardPage.tsx`, `src/pages/DialogueSessionsPage.tsx` | `/roleplays`, `/roleplay/new`, `/roleplay/:id`, `/roleplay/:id/sessions` |
| **Learner page** | `src/pages/DialoguePlayPage.tsx` | `/play-roleplay/:code` (public, anon) |
| **Types** | `src/types/dialogue.ts` | n/a |
| **DB migrations** | `db/dialogue/*.sql` (tables remain `dialogue_*`) | applied to Supabase via SQL Editor |

**Rules of the road:**
- **Working on Content Creator (courses)?** Do not touch any file matching `dialogue` / `Dialogue`. They're a separate product.
- **Working on Role Play?** Stay inside the file list above. Reuse cross-cutting infra (`@/lib/tenant`, `@/lib/languages`, `@/lib/supabase`, Clerk auth, sharp pipeline) but do **not** modify those — they belong to all products.
- **Shared infra changes that affect both products** are real but rare. Surface them explicitly before editing.

**Detailed design lives in:** `~/.claude/projects/-Users-gopalswaminathan-Claude-Code/memory/project_learnbee_dialogue_pilot.md` (memory file still uses the codename)

**Role Play is a pilot.** Routes are registered in `App.tsx` (Commit 2 — 15 May). STT proxy endpoints `/api/whisper` and `/api/sarvam-stt` are built (Commit 3 — 15 May) and proxy to OpenAI Whisper / Sarvam Saarika using server-side `OPENAI_API_KEY` and `SARVAM_API_KEY`. Voice now works in both `npm run dev` (direct call with `VITE_*` keys) and prod (via the edge proxies). End-to-end testing pending Supabase migration on dev + a creator-led pilot run.

---

## Current Implementation State (22 May 2026)

### 🆕 Recent landmarks (May 2026)

- **V2 Rich Text Editor — fully rolled out.** All 18 text-bearing format components use `RichTextEditorV2` + `sanitizeHtml`. V1 RTE deleted; the experimental `image-content-test` format removed from the registry. 12 brand colours wired through `defaultColor`/`onDefaultColorChange` props; right-panel `color-swatches` widget removed where it was inline-redundant. Image link URL plumbing exists (Phase 0 helper) but no format reads/writes the URL yet — deferred to F1.
- **Image Explore — IPE / click-per-segment** (all three surfaces). Added to `INTERACT_PER_SEGMENT_FORMATS`; click reveals the hotspot's description card immediately, hotspot's VO plays alongside. Resume-aware on SCORM (visual state restored from `IEX` on slide entry). Three layers of Sibling Lock — see ENGINEERING_RULES E8 + D4.
- **No-VO deadlock fix for all IPE formats.** `_playOneSegment` now fires `_done()` synchronously when `_audSegs[idx]` is empty, so the played-set + format counter advance even for slides authored without narration. React InsightCards + FlipCards mirror this on click. Skip=No no longer deadlocks at "0 of N revealed".
- **Input-test narration defaults.** quiz-mcq, image-match, fill-blanks generate **one short instruction sentence in the course language** — no longer read the question, the labels, or the answers aloud. Image-match dropped from N segments → 1.

### ✅ Fully Built

### ✅ Fully Built

**Course Wizard** (`/wizard`)
- 6-step flow: Basics → Content → Media → Structure → Quiz → Review
- Step 1 (Basics): title, audience, objective, **language picker** (14 languages, immutable)
- Step 2 (Content): reference text paste, reference-PDF upload, web search toggle
- Step 3 (Media): drag-drop multi-upload of course images, **videos**, and **Course PDFs** — all batch-tagged/assigned to the new course on completion (`StepImages`)
- Step 4 (Structure): module count, duration, depth
- Step 5 (Quiz): quiz count, difficulty, distribution
- Step 6 (Review): review → Generate → outline → editor
- AI: `claude-opus-4-7` with adaptive thinking

**Language Infrastructure** (`src/lib/languages.ts`)
- 14 languages: 1 global (English), 9 Indian (Sarvam), 4 European (OpenAI)
- Language set at creation, immutable
- All AI calls language-aware; content generated in course language
- `getVoiceConfig(code)` → `{ provider, voice, model, langCode, mimeType }`
- Lexicon system: `L('key')` returns UI string in course language

**TTS — Dual Provider + Voices v1** (`src/lib/tts.ts`, `src/lib/languages.ts`)
- `generateAudioB64(text, signal?, language, gender)` → routes to OpenAI or Sarvam, gender-aware
- OpenAI: MP3, `nova` (F) / `onyx` (M)
- Sarvam Bulbul v3: WAV, `priya` (F) / `kabir` (M) — confirmed valid v3 speakers
- **Voices v1:** course-level default voice (F/M, set in wizard step 1) + per-segment override toggle in NarrationDrawer. F/M letters used instead of ♀/♂ for cultural fit (Indian users). Audio cache key now includes gender (`courseId/slideId/segIdx/gender`); legacy keys without gender suffix still resolve via fallback
- **Preview button** in voice picker plays a localised sample sentence
- `speakSegment()` has `onpause` handler — prevents overlapping audio

**Audio Cache — IndexedDB** (`src/lib/audioCache.ts`)
- DB: `learnbee_audio_v1`, store: `segments`, key: `courseId/slideId/segIdx`
- Replaces localStorage (5MB quota → silent failures)
- `saveAudio`, `loadAudio`, `loadSlideAudio`, `deleteAudio`
- Audio generated once by creator (~$0.72–0.97/course), $0 per learner

**Publish System** (`src/lib/publish.ts`)
- `publishCourse(title, modules, options)` → uploads to Supabase Storage
- 6-char access code: alphabet `23456789ABCDEFGHJKLMNPQRSTUVWXYZ` (no ambiguous chars)
- Storage key: `published-courses/{code}.json`
- Republish: `upsert: true` → same code, same link, updated content
- Published payload includes `courseId` for audio cache lookup
- Returns `{ code, shareUrl, embedCode }`
- `fetchPublishedCourse(code)` → fetches JSON from Supabase public URL

**Publish Modal** (`src/components/editor/PublishModal.tsx`)
- Access code (big, mono, prominent) + copy button
- QR code (generated via `qrcode` npm, downloads as PNG)
- Share URL + copy
- Embed `<iframe>` code + copy
- Shows "Republish" on button when course already published

**Public Player** (`src/pages/PlayPage.tsx`)
- Route: `/play/:shareCode` (public, no auth)
- Fetches course JSON from Supabase Storage
- `?embed=true` → hides header/footer, shows compact nav strip
- Full player: all 24 formats, narration, gating, completion screen
- Audio lookup uses `course.courseId` (original editor ID) for IndexedDB hit
- Completion screen shows "Powered by Learnbee" branding

**Access Code Entry** (LibraryPage header)
- Text input: 6-char code → Enter or arrow → navigates to `/play/{code}`
- Auto-uppercases, strips non-alphanumeric, arrow enabled only at 6 chars

**SCORM Export** (`src/lib/scorm.ts` + `src/lib/scormSsr.ts`)
- Filename: `coursename_2026-05-02_scorm.zip` (date-stamped)
- Always available — no publish gate
- SCORM 1.2: lesson_status, score, session_time, lesson_location
- **Single-source SSR renderer (22 / 22 formats — migration complete, 10 May 2026)**:
  - Every slide format renders through its React component via `renderToStaticMarkup(<FormatComponent .../>)`. `attachSsrHtml()` walks slides and attaches the result as `slide._ssrHtml`. The embedded SCORM player consumes `_ssrHtml` directly. App CSS is extracted from the live document at build time and inlined into the zip's `<style>` block so the React component's Tailwind classes resolve in the LMS.
  - **Phase 4 cleanup done:** ~1200 lines of legacy vanilla `rXX()` renderers and their handlers (`rBS`, `rIC`, `rSBS`, `rAcc`, `rSS`, `rSSH`, `rQZ`, `rFC`, `rIO`, `rIE`, `rIM`, `rTF`, `rFeatBen`, `rSC`, `rFB`, `rTS`, `rAS`, `rCSBS`, `rCM`, `rCPC`, plus `toggleAcc`, `ssNav`, `flipCard`, etc.) deleted from `scorm.ts`. React components are the single source of truth.
  - **Auto-detected progressive reveal:** `scorm.ts` runtime no longer maintains a per-format allow-list for step-driven slides. It auto-detects them at slide-mount time by scanning the SSR'd HTML for `[data-phase]`, `[data-acc-item]`, or `[data-sticky-step-image]` markers; if any exist, the slide is treated as a step-revealed format and `applyPhase` mirrors the narration-segment counter onto inline styles.
  - Wrapper polish (commit `999cb1d`): slide-wrap radius 12px, `shadow-2xl`-equivalent box-shadow, `main` padding 16px so SCORM slide chrome matches `/play/` (`max-w-5xl rounded-xl shadow-2xl`).
  - Per-format helpers in `scorm.ts` mirror state machines into the SSR'd DOM via inline style mutation: `_applyQzAnsweredVisual` (Quiz), `_applyExploreReveal` (ImageExplore), `_fbApplyState` (FillBlanks), `_imApplyState` (ImageMatch), `_applyScState` (ScenarioChallenge), `_applySsState` (Sticky scroll/slide). Pattern: state lives in vanilla JS state machines; on click, handler updates state, helper walks DOM and toggles inline styles. No re-render of `_ssrHtml`.
- Animation system (ported formats): `data-anim="fade-up" / "fade-left"` attribute + `bee-fade-up / bee-fade-left` CSS keyframes in `src/index.css`. Replaced framer-motion across ported formats so editor / `/play/` / SCORM all animate from a single CSS source.
- **Self-contained packages** — images bundled into the zip (`images/<name>.webp`) via `/api/scorm/bundle-images`; client walks slide content for URLs, server fetches + sharp-optimises + returns base64 + urlMap, client rewrites every URL to the relative path. ~2-4 MB image overhead per typical course; no LMS egress, no Pexels takedown risk.
- File naming inside zip: `<uuid>.webp` (course-media) + `<uuid>_blur.webp` (32px thumb) / `pex_<photoid>.webp` (Pexels, no blur thumb) / `ext_<hash>.webp` (other URLs). The `pex_*` / `ext_*` prefix tells the player JS to fall back to CSS blur for contain mode.
- Manifest declares every bundled file (HTML + JS + audio + images) for strict-validator LMSes
- Export button shows "Packaging…" spinner + disabled state during the 30–40s bundle/zip step (image fetch + sharp dominate); prevents double-clicks

**Narration System**
- Script: `claude-sonnet-4-6`, max_tokens 3000, one segment per section
- Voice: routed by language → OpenAI or Sarvam
- Audio: IndexedDB, key = `courseId/slideId/segIdx`
- NarrationDrawer: stop-on-unmount, three per-slide toggles ("Learner can skip" / "Learner clicks on each segment" / "Auto-advance") with a course-wide default for each in Course Settings. Per-slide flags resolve from course defaults via silent inheritance (`slide.content._flag ?? courseDefault.flag`) — no eager seeding at slide-creation time, so changing the course default retroactively updates slides that didn't override

**Interactivity — Click Mode** (Phase B, shipped 13 May 2026)
- Per-slide `_interactPerElement` flag with course-level `defaultInteractPerElement`. Flips a Group-B format from linear-narration auto-cycle to learner-controlled per-element narration: each click plays one segment, the next-nav locks during audio (strict-listening gate), only segments whose audio actually completes get marked as played
- Group-B formats: **flip-cards, accordion, insight-cards, step-by-step, sticky-scroll, sticky-slide**. Single source of truth: `INTERACT_PER_SEGMENT_FORMATS` in `src/lib/formatGroups.ts`. Group A (narrative) and Group C (inherently interactive — quiz/fill-blanks/etc.) don't participate
- Generic player wiring lives in `src/pages/PlayPage.tsx` + `PlayerPage.tsx`: `playSingleSegment(idx)`, `clickModePlayedRef` (segments marked on audio completion only), `interactPerElementFor(slide)` helper. Auto-advance fires when `clickModePlayed.size >= narration.length`
- Strict-listening UI: forward nav (next button in sequential formats, non-current cards in free-click formats) is `disabled` while `narrationActive` is true; back nav stays enabled
- Bottom-chrome bar in both pages is **status-only** (segment-time progress + countdown, no play/pause/seek). Same in click and linear modes
- **Recipe:** see `CLICK_MODE_RECIPE.md` for the playbook on adding click mode to a new format

**Interactivity — Auto-Advance** (Phase D, shipped earlier May 2026)
- Per-slide `_autoAdvance` flag with course-level `defaultAutoAdvance`. When narration ends on a slide with this flag, a 2-second cancellable toast appears bottom-centre ("Advancing in 2s…"), then fires Next. Cancels on slide change, manual nav, or learner cancel

**Editor**
- Three-zone layout: Module Tree | Canvas | Properties Panel
- Auto-save: 1.5s-debounced write to Supabase (`saveCourseModules` in `src/lib/db.ts`) **and** immediate localStorage cache write. `shareCode` preserved on both paths (so republish reuses same code).
- Preview → `/player/:id?from=N`
- All 24 formats inline-editable
- **Module Tree:** slide title is primary in each row, format type is secondary subtext (course title used as fallback when slide has no title). Voice-ready indicator on each slide row in the tree; voiceover-status indicator also on the SlideCanvas's bottom-right palette area.
- `<CourseProvider courseId>` wraps the tree so deep children (ImagePicker) can read the active course id without prop drilling

**Image Library** (May 2026)
- **Storage:** Supabase `course-media` public bucket. Path pattern `{org_id}/{image_id}.webp` + `{org_id}/{image_id}_blur.webp` (32px blur thumbnail for blur-fill backgrounds).
- **DB:** `images` table (one row per upload; org-scoped) + `image_courses` junction (many-to-many tags). Pexels images do NOT go through this; they stay as remote URLs.
- **Pipeline:** every Upload / From Link goes through sharp — resize to 1280px max, WebP @ 80%, EXIF strip, plus a 32px blur thumbnail. Predictable 150–300 KB per image.
- **Picker** (`src/components/editor/ImagePicker.tsx`): 5 tabs — `Pexels`, `From Course`, `All Images` (whole library), `Upload`, `From Link`. Backward-compatible `onSelect(url)` so all 14 callsites keep working.
- **Auto-tagging:** any uploaded / URL-fetched / library-picked image gets tagged to the current course. Picking from Pexels does NOT tag (nothing to tag). Tag insertion is idempotent.
- **Wizard step "Media"** (between Content and Structure): drag-drop multi-upload of images, videos, and Course PDFs with optional title; on completion, all wizard images are batch-tagged to the new course via `assignImagesToCourse` (videos/PDFs assigned similarly).
- **Display modes** (`imageDisplayMode: 'cover' | 'contain'`): added to 8 image-bearing formats — `big-statement`, `title-slide`, `image-overlay-*`, `image-content-*`, `key-points`, `flip-cards`, `fill-blanks`, `quiz-mcq`. Default `cover`. `contain` shows the whole image with a blur-fill backdrop using the stored 32px thumb (CSS `filter: blur` fallback for Pexels).
- **Display modes — skipped intentionally:** `image-explore`, `image-match` (hotspots positioned by % of panel; contain mode would offset them); `sticky-scroll`, `sticky-slide` (per-step images need per-step toggle); `insight-cards`, `scenario-challenge` (no slide-level bg image).
- **Lazy migration of legacy base64 images:** when EditorPage detects any `data:image/...;base64,` strings in slide content on load, walks the JSON, uploads each to the bucket, replaces with the bucket URL, and the auto-save effect persists. Cheap `JSON.stringify` pre-check; skips if no base64. Runs once per session.
- **Tenant resolution:** `src/lib/tenant.ts` — `useTenantWithUser()` hook returns `{ orgId, userId, ... }` based on Clerk. `org_id` column today = Clerk `userId`; same column will hold real org id later, no schema change required.
- **From Link error contract:** `/api/images/fetch-url` returns a stable `code` field on every failure (one of 11 codes — see `FetchUrlErrorCode` in `imageApi.ts`). Client throws `FetchUrlError` carrying that code. The `LinkErrorBanner` component in `ImagePicker.tsx` maps each code to actionable user copy, with clickable handoff links to the Upload tab where relevant (`forbidden`, `too_large`, `data_url`, `source_error`).

---

## Slide Format Registry (24 format IDs)

| Format ID | Name | Category | Gated? |
|-----------|------|----------|--------|
| `title-slide` | Title Slide | Narrative | No |
| `agenda-slide` | Agenda Slide | Narrative | No |
| `big-statement` | Big Statement | Narrative | No |
| `key-points` | Key Points | Content | No |
| `insight-cards` | Insight Cards | Content | No |
| `image-content-left` | Image + Content (Left) | Content | No |
| `image-content-right` | Image + Content (Right) | Content | No |
| `image-overlay-left` | Image Overlay (Left) | Content | No |
| `image-overlay-right` | Image Overlay (Right) | Content | No |
| `pdf-viewer` | PDF Viewer | Content | No |
| `comparison-side-by-side` | Side by Side | Comparison | No |
| `comparison-matrix` | Feature Matrix | Comparison | No |
| `comparison-pros-cons` | Pros & Cons | Comparison | No |
| `step-by-step` | Step by Step | Content | ✅ |
| `accordion` | Accordion | Content | ✅ |
| `sticky-scroll` | Sticky Scroll | Content | ✅ |
| `sticky-slide` | Sticky Slide | Content | ✅ |
| `scenario-challenge` | Scenario Challenge | Interactive | ✅ |
| `quiz-mcq` | Quiz / MCQ | Interactive | ✅ |
| `true-false` | True / False | Interactive | ✅ |
| `flip-cards` | Flip Cards | Interactive | ✅ |
| `image-explore` | Image Explore | Interactive | ✅ |
| `image-match` | Image Match | Interactive | ✅ |
| `fill-blanks` | Fill in the Blanks | Interactive | ✅ |

**Video slides:** there is no standalone `video` format. Video lives as a **mode** of `big-statement` (`content.mode: 'statement' | 'video'`). A video-mode slide plays full-slide and supports either an uploaded video **file** (`backgroundVideo`, `<video>` with our controls) or a **YouTube embed** (iframe, plays via YouTube's controls). Narration is disabled in video mode — the video owns the audio. Backed by a **video embed library** (YouTube oEmbed picker + backfill + SCORM bundling).

**PDF slides:** `pdf-viewer` embeds a paged PDF document (`content.pdf`). Sourced via a PDF library/picker, with a "Course PDFs" multi-upload step in the wizard Media step, and live SCORM render support.

---

## API Routes (`/api/`)

| Route | Runtime | Purpose | Key env var |
|-------|---------|---------|-------------|
| `api/anthropic/[...path].ts` | Edge | Anthropic API proxy | `ANTHROPIC_API_KEY` |
| `api/tts.ts` | Edge | OpenAI TTS proxy | `OPENAI_API_KEY` |
| `api/sarvam-tts.ts` | Edge | Sarvam Bulbul v3 proxy | `SARVAM_API_KEY` |
| `api/pexels.ts` | Edge | Pexels image search proxy | `PEXELS_API_KEY` |
| `api/health.ts` | Edge | Health check | — |
| `api/images/upload.ts` | Node | multipart upload → sharp → bucket + DB row | `SUPABASE_SERVICE_ROLE_KEY` |
| `api/images/fetch-url.ts` | Node | server-side URL pull → sharp → bucket + DB row | `SUPABASE_SERVICE_ROLE_KEY` |
| `api/images/list.ts` | Node | list by `scope=course` (via junction) or `scope=all` | `SUPABASE_SERVICE_ROLE_KEY` |
| `api/images/delete.ts` | Node | remove files + cascade DB row | `SUPABASE_SERVICE_ROLE_KEY` |
| `api/images/assign-course.ts` | Node | batch-tag images to a course (used by wizard on completion); also persists titles as alt_text | `SUPABASE_SERVICE_ROLE_KEY` |
| `api/images/tag.ts` | Node | add/remove a single course tag (used by `From Course` / `All Images` picks) | `SUPABASE_SERVICE_ROLE_KEY` |
| `api/scorm/bundle-images.ts` | Node | fetch + sharp-optimise every image URL referenced by slides; returns base64 + urlMap for inclusion in the SCORM zip | — (uses public/CDN URLs only) |

Dev: uses `VITE_*` vars, calls APIs directly. Prod: routes through `/api/*`.

**Local dev proxy:** `vite.config.ts` forwards `/api/*` to `creator.learnbee.ai` so `npm run dev` hits the live functions without `vercel dev`. NOTE: dev calls hit production storage and DB — revisit when dev/prod environments are split.

---

## Data Flow & Storage

```
localStorage:
  learnbee_editor_{id}   ← course JSON + _narration + shareCode
  learnbee_preview_{id}  ← written on Preview click
  learnbee_courses       ← course list registry

IndexedDB (learnbee_audio_v1):
  segments/{courseId}/{slideId}/{segIdx}  ← base64 audio

Supabase Storage:
  published-courses/{6-char-code}.json   ← published course JSON (public read)
  course-media/{org_id}/{image_id}.webp        ← uploaded images (public read)
  course-media/{org_id}/{image_id}_blur.webp   ← 32px blur thumb for blur-fill

Supabase tables (RLS on, per-user via created_by = auth.jwt()->>'sub'):
  courses    ← primary store; columns include created_by, org_id (nullable),
               language, is_root, status, pass_mark, min_questions,
               thumbnail_url, scorm_url, share_link, root_course_id, timestamps
  modules    ← primary store; created_by, course_id, position, is_opening
  slides     ← primary store; created_by, module_id, format_id, position,
               content (jsonb)
  images     ← row per uploaded image, org-scoped
  image_courses  ← junction (image_id, course_id) — many-to-many tags
```

---

## Environment Variables

| Variable | Dev | Prod |
|---|---|---|
| `VITE_ANTHROPIC_API_KEY` | ✅ | — |
| `ANTHROPIC_API_KEY` | — | ✅ |
| `VITE_OPENAI_API_KEY` | ✅ | — |
| `OPENAI_API_KEY` | — | ✅ |
| `VITE_SARVAM_API_KEY` | ✅ | — |
| `SARVAM_API_KEY` | — | ✅ |
| `VITE_PEXELS_API_KEY` | ✅ | — |
| `PEXELS_API_KEY` | — | ✅ |
| `VITE_SUPABASE_URL` | ✅ | ✅ |
| `VITE_SUPABASE_ANON_KEY` | ✅ | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ✅ | (server-side only — bypasses RLS, keep secret; required by `api/images/*`) |
| `VITE_CLERK_PUBLISHABLE_KEY` | ✅ | ✅ |

---

## File Structure (May 2026)

```
api/
  anthropic/[...path].ts
  health.ts
  pexels.ts
  sarvam-tts.ts
  tts.ts
  images/                       ← NEW — image library APIs (Node runtime)
    upload.ts                   ← multipart upload, sharp pipeline
    fetch-url.ts                ← URL fetch (with SSRF guard)
    list.ts                     ← scope=course | all
    delete.ts                   ← cascades to image_courses
    assign-course.ts            ← batch-tag (used by wizard completion)
    tag.ts                      ← add/remove single course tag

src/
  components/
    editor/
      AIAssistPanel.tsx
      FormatPicker.tsx
      ImagePicker.tsx
      ModuleTree.tsx
      NarrationDrawer.tsx
      PropertiesPanel.tsx
      PublishModal.tsx        ← NEW — access code, QR, share URL, embed code
      RichTextEditor.tsx
    formats/
      registry.ts
      _shared/
        SlideImage.tsx          ← NEW — cover/contain helper with blur fill
      Accordion/, AgendaSlide/, BigStatement/, FillBlanks/
      FlipCards/, ImageContent/, ImageExplore/, ImageMatch/
      ImageOverlay/, InsightCards/, KeyPoints/, QuizMCQ/
      ScenarioChallenge/, StepByStep/, StickyScroll/
      StickySlide/, TitleSlide/
    library/
      CourseCard.tsx
  pages/
    CourseWizardPage.tsx
    EditorPage.tsx
    LibraryPage.tsx           ← access code entry box in header
    PlayPage.tsx              ← NEW — public player (/play/:shareCode)
    PlayerPage.tsx            ← editor preview (/player/:id)
    SignInPage.tsx
    SignUpPage.tsx
  lib/
    ai.ts
    aiAssist.ts
    audioCache.ts
    brand.ts
    courseContext.tsx         ← NEW — CourseProvider + useCourseId() hook
    db.ts
    fontColors.ts
    imageApi.ts               ← NEW — client wrappers for /api/images/*
    imageBlur.ts              ← NEW — getBlurUrl() derives blur thumb URL from main URL
    languages.ts
    lexicon/en.ts, index.ts
    migrateBase64Images.ts    ← NEW — lazy migration of legacy data:image strings
    narrationGenerator.ts
    outlineToEditor.ts
    pexels.ts
    publish.ts                ← NEW — publishCourse(), fetchPublishedCourse()
    restore.ts                ← NEW — findUnsyncedCourses(), restoreCourse(), restoreAll() — migrates legacy localStorage-only courses into Supabase under the user's real Clerk userId
    tenant.ts                 ← NEW — useTenantWithUser(); resolves Clerk userId → org_id
    scorm.ts
    supabase.ts
    tts.ts
    utils.ts
  types/index.ts
```

---

## Key Technical Gotchas

1. **Republish reuses same code** — `shareCode` stored in localStorage under `learnbee_editor_{id}`. Both auto-save paths must include it or it's lost on reload.
2. **Audio cache lookup uses `course.courseId`** — published JSON includes the original editor `courseId` so IndexedDB lookup works on the creator's device. Other devices fall back to live TTS.
3. **Supabase Storage bucket must be public** — `published-courses` bucket, public read, no auth needed.
4. **Sarvam request body** — `{ text, target_language_code, speaker, model }` NOT `inputs: [text]`.
5. **Non-Latin tokens** — Hindi/Devanagari costs 2-3× tokens. Use 4000 max_tokens for AI assist, 3000 for narration.
6. **SCORM `correctIndex`** — always `Number()` cast both sides to avoid string/number mismatch.
7. **`speakSegment` onpause** — resolves Promise on external pause to prevent overlapping audio.
8. **Language immutable** — set in wizard step 1, stored on Course, never changed.
9. **Vercel Node runtime** — `api/images/*` use `(req: VercelRequest, res: VercelResponse)` from `@vercel/node`. The Edge-style `(req: Request) => Response` signature crashes Node functions with `FUNCTION_INVOCATION_FAILED`. Sharp requires Node, not Edge.
10. **Vite `/api/*` proxy in dev** — `vite.config.ts` forwards `/api/*` to `creator.learnbee.ai`. Without it, requests hit Vite's static handler and return the `.ts` source as text, causing client-side `Unexpected token 'i' "import { c"... is not valid JSON` errors.
11. **SCORM apostrophes inside single-quoted JS strings** — A literal `'` inside a single-quoted JS string concatenation in the generated SCORM HTML kills the entire script with a SyntaxError → blank slides. Use `&#39;` or move to a backtick template literal. Bit me hard once on `What you'll achieve`.
12. **Image data URLs in localStorage** — old uploads stored `data:image/...;base64,` directly in slide content; quota errors silently strip them on save. The migration in `migrateBase64Images.ts` runs once per session to move them to the bucket.
13. **`org_id` is currently Clerk userId** — schema uses `org_id text` so swap to a real org id later is a one-shot SQL update, no code rewrite. Always go through `useTenantWithUser()` / `resolveOrgIdFromUserId()` rather than reading `userId` directly.
14. **Tag-based image model** — an image's row in `images` is its presence in "All Images". Course tags live in `image_courses`. `images.course_id` column is kept as a transitional safety net; nothing reads it. Drop later.
15. **Branching during the SSR migration** — `dev` branch deploys to `dev.learnbee.ai`; `main` deploys to `creator.learnbee.ai`. SSR work pushes to `dev` only. Hotfixes that need to ship to customers go on `main` and should be merged into `dev` to keep them in sync. Single `dev` → `main` PR at the end of Phase 4 cuts the whole migration over.
16. **SSR caveats per ported format** — components must be SSR-safe. Drop `framer-motion` (its initial states bake into static markup as `opacity:0`, leaving content invisible in SCORM). Replace with `data-anim` + the `bee-fade-*` CSS keyframes in `index.css`. `useEffect` / `useRef` / `useState` are harmless during `renderToStaticMarkup` (effects don't fire) — keep them only if `/play/` still needs them.
17. **Vercel env vars are per-environment** — Production env vars do NOT auto-apply to Preview deployments. When adding a new domain like `dev.learnbee.ai` mapped to a branch, you must edit each existing var to tick "Production and Preview" (without a Custom Preview Branch pin) or the Preview build will read `undefined` and the app boots into a `supabaseUrl is required` crash. After changing env vars, redeploy with **"Use existing Build Cache" unchecked** — Vite bakes `VITE_*` vars at build time, so cached builds keep stale values.
18. **Clerk → Supabase auth** — wired via Supabase's "Third-Party Auth" provider (Authentication → Providers → Clerk → domain `holy-prawn-49.clerk.accounts.dev`). Clerk's *native* session token is trusted (no Clerk JWT template needed). The supabase client in `src/lib/supabase.ts` calls `window.Clerk.session.getToken()` (no `template` arg) on every request via the `accessToken` callback. Adding a `{ template: 'supabase' }` arg breaks this — there is no template, and Clerk silently returns null.
19. **RLS policies must NOT use `TO authenticated`** — Clerk's JWT does not include a `role` claim, so PostgREST never tags the request as the `authenticated` role and `TO authenticated` policies fall through to default-deny. Use `FOR ALL` with no `TO` clause; security comes from the `created_by = auth.jwt() ->> 'sub'` USING/WITH CHECK expression (which is unforgeable without a valid Clerk-signed JWT).
20. **PostgREST `not.in.(...)` quoting** — `.not('id', 'in', '(\'a\',\'b\')')` does NOT work. Wrapping each id in single quotes makes PostgREST treat them as literal apostrophe-prefixed strings; nothing matches. Use `not.in.(a,b)` (plain comma-separated, no per-item quotes). Bit us hard: the saveCourseModules cleanup step was deleting every row it had just upserted because the `not.in` filter "kept" zero ids.
21. **Schema drift can silently 400** — when `db.ts` writes a column the table doesn't have (e.g. `language`, `is_root`), PostgREST returns 400 with no row inserted. Always run `SELECT column_name FROM information_schema.columns WHERE table_name = '...'` after a code change that adds an inserted column, and `ALTER TABLE … ADD COLUMN IF NOT EXISTS …` to keep schema in sync.

---

## Pending / Roadmap

### This Week — Sprint Plan
- **Templates** — curated content presets layered on the existing format system. Browse by category, click to insert pre-filled slides.
- **SuperCreator account / curated library** — official Learnbee account with a published library of courses any user can browse, copy, and adapt.
- **Publish flow polish** — round out the access-code / share / embed experience.

### Pre-Launch (before public rollout)
- **Separate prod Supabase project** — currently dev and creator share one DB, isolated only by RLS per-user. Customer rollout needs its own project.
- **Real prod Clerk instance** — replace the shared dev Clerk (`holy-prawn-49.clerk.accounts.dev`) with a production Clerk app: prod keys, custom email sender, real MAU pricing.
- **RLS audit on ALL tables** — we have policies on `courses`/`modules`/`slides`. Need the same per-user / per-org treatment on `images`, `image_courses`, `published-courses` storage, audio cache (still IndexedDB-only). Anything strangers can sign up against must be locked down.
- **Google OAuth redirect URIs** — Clerk OAuth currently routes through `*.clerk.accounts.dev`. Redirect URIs need to point at `learnbee.ai` so the consent screen looks right.

### Next (after pre-launch)
- **Drop `images.course_id`** — column unused after the tag-based migration, kept temporarily for safety
- **Org-role support (author / reviewer)** — extend the per-user RLS with an OR clause referencing `course_collaborators`. No rewrite of the base policy needed.
- **Translate function** — one-click copy + translate to target language

### Parked
- Super creator account + templates
- Learner tracking (email gate on PlayPage)
- Arabic/RTL
- Interactive Video format
- Free-format / custom HTML slide type (sandboxed iframe + Claude generation)
- Display modes for `image-explore`, `image-match` (need hotspot recalc when image is letterboxed)
- Per-step / per-card image display modes (sticky-scroll, sticky-slide, flip-cards card faces, insight-cards cards)
- Multi-tenant org model — proper `organisations` table + Clerk Orgs integration

### Recently Shipped (May 2026)
- **Supabase persistence reconnected (10 May 2026)** — courses had been silently saving only to localStorage since day one because the supabase client had no Clerk JWT, RLS rejected every write with 401, and the app caught the error and fell back to localStorage with stub `created_by: 'local'`. Fixed end-to-end: (1) supabase client wraps Clerk's session token via `accessToken` callback (`src/lib/supabase.ts`); (2) Supabase Third-Party Auth provider configured for Clerk in the dashboard; (3) schema migrated to add `created_by`, `org_id`, `language`, `is_root`, `root_course_id`, `scorm_url`, `share_link` columns + indexes; (4) RLS turned on with per-user policies on `courses`/`modules`/`slides` (FOR ALL, no `TO authenticated` since Clerk JWT has no role claim); (5) `db.ts` writes the real Clerk userId and surfaces failures via `console.error`; (6) `not.in.()` quoting bug in `saveCourseModules` cleanup fixed (was deleting just-upserted rows); (7) restore banner on Library page (`src/lib/restore.ts`) auto-detects courses stuck in localStorage and migrates them into Supabase under the user's real userId.
- **SSR migration complete — 22 / 22 (10 May 2026)** — Phase 4 cleanup landed: ~1200 lines of legacy vanilla `rXX()` renderers and their handlers deleted from `scorm.ts`. ScenarioChallenge ported, then StickyScroll + StickySlide ported (with parallax preserved via CSS transitions on inline transforms). Auto-detected progressive reveal: `scorm.ts` no longer has a per-format allow-list; it scans the SSR'd HTML for `[data-phase]`/`[data-acc-item]`/`[data-sticky-step-image]` markers at slide-mount time. Comprehensive inline-styles bake across workhorse formats (ImageContent, KeyPoints, BigStatement, AgendaSlide, ImageOverlay, TitleSlide) — Tailwind utility classes don't always survive SCORM CSS extraction; structural styles (padding, gaps, font sizes, spacing) are baked inline.
- **Voices v1 (10 May 2026)** — per-course voice picker (F/M, with localised preview button) on the wizard's first page; default voice persisted on Course; per-segment gender override toggle in NarrationDrawer; F/M letters used instead of ♀/♂ symbols (cultural fit for Indian users); audio cache key includes gender suffix with legacy-key fallback. OpenAI: nova/onyx. Sarvam Bulbul v3: priya/kabir.
- **Editor UX polish (10 May 2026)** — slide title swapped to primary in module tree (format type as secondary subtext, course title as fallback for untitled slides); voiceover-status indicator moved from left panel to slide canvas's bottom-right palette area; voice-ready indicator on each slide row.
- **Narration polish (10 May 2026)** — TitleSlide narration prompt now opens with course name + welcome; agenda slide objective is LLM-refined per actual modules (not raw wizard text); ImagePicker falls back to course title for Pexels query when slide heading empty; InsightCards description removed from card front.
- **SSR migration — 19 / 22 (8–9 May, on `dev` branch)** — all display-only formats plus 8 of 11 interactives now render through their React component. Pattern split: SSR captures the React render at SCORM-build time; vanilla JS in `scorm.ts` handles clicks/state via `data-action` attributes baked into the SSR'd HTML. State machines (QA, IEX, FB_*, IM_*, etc.) stay in vanilla JS; per-format `_applyXxxState` helpers walk the SSR'd DOM and mirror state changes via inline style mutation (no re-render of frozen `_ssrHtml`). New `src/lib/scormSsr.ts` does the dispatch. `extractAppCss()` inlines the live document's stylesheets into the zip. framer-motion replaced with CSS keyframes (`bee-fade-up / bee-fade-left` + `data-anim` attribute) across ported formats. Cardinal rule learned: Tailwind utility classes are NOT trustworthy as a visual contract for SCORM output — bake structural styles (padding, borders, shadows, layout widths) inline. Standard padding is 24/32; body text floor is 16px; dividers derive from `fontColor` so they work on any background. SCORM wrapper now matches `/play/` chrome (12px radius, shadow-2xl, 16px main padding, 1024px slide cap). See `SSR_PORT_RECIPE.md`.
- **SCORM image bundling** — zips are now self-contained: `/api/scorm/bundle-images` fetches every referenced image (course-media + Pexels + arbitrary URLs), runs sharp, returns base64 + urlMap; client adds them under `images/` and rewrites slide content URLs to relative paths. Manifest declares every bundled file. Export button shows packaging spinner for the 30–40s build.
- **SCORM TitleSlide** — layout 3 background image now actually renders (was missing).
- **SCORM ImageContent + Accordion** — per-section / per-item images render in the vanilla-JS renderer (parity with React).
- **AgendaSlide** — Immersive single-card layout matching SCORM; Cinema layout column count synced with React module-grid; Next anchored right; content visible even when slide has no narration.
- **SCORM player rewrites** — apostrophe-in-JS-string fix, audio-bleed fix, audio progress bar in footer (circular play/pause + countdown), visibility-listener stop-on-tab-hide, double-play guard
- **Body text 14px floor** across all formats and the SCORM renderer
- **Editor preview parity** — same double-play guard + visibility listener as PlayPage
- **Image library** — full pipeline (foundation, APIs, picker UI, wizard step, tag-based model, display modes on 8 formats, base64 migration, auto-tag-on-pick)
- **From Link error UX** — stable `code` contract on every failure path; 11 codes mapped to specific user-facing copy with clickable Upload-tab handoffs
- **KeyPoints byline removed** from all layers (registry, component, scorm renderer, AI prompts, narration prompt)
