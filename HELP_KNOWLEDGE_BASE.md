# Learnbee — Product Knowledge Base

> **Purpose of this document.** This is the single source of truth for Learnbee's
> AI-powered Help Center and support assistant. It is written for both humans and
> AI retrieval (RAG). The assistant should answer **only** from this document; if a
> question is not covered here, it should say so and point the user to support
> rather than guess.
>
> **Maintenance rule.** When a feature ships or changes, update the relevant
> section here. Anything not yet verifiable is marked **To Be Documented (TBD)** —
> do not replace TBD with assumptions.
>
> **Last reviewed:** 2026-07-10 · **Applies to:** Learnbee (web app)

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Terminology & Glossary](#2-terminology--glossary)
3. [Getting Started](#3-getting-started)
4. [Features](#4-features)
5. [Workflows](#5-workflows)
6. [Frequently Asked Questions](#6-frequently-asked-questions)
7. [Troubleshooting](#7-troubleshooting)
8. [Errors & Messages](#8-errors--messages)
9. [Permissions & Roles](#9-permissions--roles)
10. [Limits & Constraints](#10-limits--constraints)
11. [Integrations](#11-integrations)
12. [API](#12-api)
13. [Known Limitations](#13-known-limitations)
14. [Best Practices](#14-best-practices)
15. [Release Notes](#15-release-notes)
16. [Appendix](#16-appendix)

---

## 1. Product Overview

### What Learnbee is
Learnbee is a **training-content authoring tool** for creating modern, animated,
editorial-quality online courses. Creators generate a course outline with AI, fill
it with text, images, video, PDFs and interactive slides, add AI voice narration,
and then either publish the course as a shareable online player or export it as a
**SCORM 2004 package** for a Learning Management System (LMS).

**Keywords / synonyms:** course builder, e-learning authoring tool, training
creator, course maker, Rise 360 alternative, Articulate alternative, LMS content
authoring.

### Who it is for
- **Course creators / instructional designers** building corporate or educational
  training.
- **Trainers and L&D teams** who need SCORM-compatible or shareable courses.
- **Learners** who take a published course via a link, access code, embedded
  player, or an LMS.

### Core use cases
- Turn reference material (text, PDFs) into a structured, multi-module course with
  AI.
- Produce narrated courses in multiple languages, including Indian languages.
- Publish a course online (link, QR code, embed) or export SCORM for an LMS.
- Reuse and adapt ready-made courses from a curated Library.
- Translate a course into other languages.
- Collaborate with reviewers via threaded comments.

### Key benefits
- **AI-assisted authoring** — generate outlines and slide content from your source
  material.
- **AI narration** — voice-over generated once, plays free for every learner, in
  the course language.
- **24 slide formats** — from narrative to interactive/quiz layouts.
- **Multi-format delivery** — the same course plays in the editor preview, the
  hosted `/play` player, and inside a SCORM package.
- **Self-contained SCORM** — images, audio and video are bundled into the export.

---

## 2. Terminology & Glossary

| Term | Definition |
|---|---|
| **Course** | The top-level unit a creator builds and publishes. Contains modules and slides. |
| **Module** | A named section of a course; contains an ordered list of slides. |
| **Slide** | A single screen in a course, using one of the 24 slide **formats**. |
| **Format** | The layout/type of a slide (e.g. Title Slide, Quiz / MCQ). See the [format registry](#appendix-a--slide-format-registry). |
| **Wizard / Course Wizard** | The 6-step guided flow for creating a new course. |
| **Narration / Voiceover** | AI-generated spoken audio for slides, in the course language. |
| **Segment** | One narration unit within a slide (usually one per section/element). |
| **Click mode** | A narration mode where the learner clicks each element to hear its segment, instead of it auto-playing. Internally "interact per element / per segment". |
| **Auto-advance** | Option to move to the next slide automatically after narration ends. |
| **Gated slide** | An interactive slide the learner must complete before proceeding. |
| **Access code** | A 6-character code a learner enters to open a published course. |
| **Publish** | Make a course available online with a link, QR code, and embed code. |
| **SCORM package** | A downloadable `.zip` of the course for uploading to an LMS. |
| **Display mode** | For image slides: **Cover** (fills, may crop) or **Contain** (whole image + blurred backdrop). |
| **Library / Curated Library** | A curated collection of ready-made courses to browse, copy, and adapt. |
| **Translation family** | A set of the same course translated into multiple languages, linked together. |
| **Course PDF** | A PDF document embedded via the PDF Viewer slide. |
| **Reference content / Reference PDF** | Source material you provide so the AI can generate the course. |

### Internal names vs user-facing names
Some names differ between what a developer sees and what a user sees. Always use the
**user-facing** name in help answers.

| Internal name | User-facing name |
|---|---|
| **Dialogue** | **Role Play** (a separate voice role-play/coaching product; see notes below) |
| Interact-per-element / per-segment | **Click mode** ("Learner clicks on each segment") |
| Bsharp Converse | (former host product; Learnbee is the standalone product) |

> **Role Play (internal codename "Dialogue")** is a separate, pilot product surface
> (a conversational voice coaching/testing agent), distinct from the course
> **Content Creator** described in this document. Unless a user explicitly asks about
> Role Play, assume questions are about course creation. Detailed Role Play
> documentation is **TBD** here.

---

## 3. Getting Started

### 3.1 Account creation & login
- Learnbee uses **Clerk** for authentication; sign-up and sign-in are available.
- **Sign-in / Sign-up** pages are provided in the app.
- Sign-in options and identity providers (e.g. Google): **partially TBD** — Google
  OAuth is planned/in progress; exact available providers at any moment are TBD.

**Prerequisite:** You must be signed in to create, edit, publish, or manage courses.
Learners taking a **published** course via link or access code do **not** need an
account.

### 3.2 Navigation (main areas)
| Area | What it's for |
|---|---|
| **Home** | Entry screen; start a new course, open recent work, enter a learner access code. |
| **Courses** | Your full list of courses (shown as translation families). |
| **Library** | Curated, ready-made courses to browse, copy, and adapt. |
| **Course Wizard** | Guided 6-step new-course creation. |
| **Editor** | Where you build a course (module tree, canvas, properties panel). |
| **Translate** | Copy + translate a course into another language. |
| **Player / Preview** | Play a course as a learner (editor preview or hosted player). |

### 3.3 Initial setup
There is no separate onboarding/setup step. To begin, **start a new course** from
the "New" menu, which opens the [Course Wizard](#41-creating-a-course-the-course-wizard).

### 3.4 Permissions and roles (summary)
See [Permissions & Roles](#9-permissions--roles) for detail. In short: a course has an
owner (creator) and can be shared with up to **6 collaborators**, each with a role —
**owner, admin, editor, reviewer, or viewer** — ranging from full editing to view-only.
Reviewers can comment but not edit.

---

## 4. Features

Each feature below follows the same structure: **Purpose · When to use · How it
works · Steps · Options · Example · Best practices · Common mistakes · Limitations ·
Related.**

---

### 4.1 Creating a course (the Course Wizard)

**Purpose.** Generate a complete, structured, AI-written course from your inputs.

**When to use.** Any time you start a new course from scratch or from reference
material.

**How it works.** A 6-step guided wizard collects your settings, then the AI
generates a full outline (modules + slides) and opens it in the editor.

**Steps.**
1. **Basics** — enter course **title**, **audience**, **learning objective**, choose
   the **language** (permanent — see [Languages](#42-languages)), and pick a default
   narration **voice** (female or male).
2. **Content** — paste **reference text**, upload **reference PDFs**, and optionally
   enable **web search** so the AI can use current information.
3. **Media** — drag-and-drop **images, videos, and PDFs** to attach to the course up
   front; these are tagged to the new course on completion.
4. **Structure** — set **module count**, approximate **duration**, and content
   **depth** (overview / standard / deep).
5. **Quiz** — set **quiz count**, **difficulty** (basic / intermediate / advanced),
   and **distribution** (per-module or end-only).
6. **Review** — review choices, then **Generate**. The AI builds the outline and
   drops you into the editor.

**Configuration options.** Title, audience, objective, language, voice, reference
text/PDFs, web search on/off, module count, duration, depth, quiz count/difficulty/
distribution.

**Example.** "Create a 4-module 'Workplace Safety' course in Hindi, standard depth,
with one quiz per module."

**Best practices.**
- Provide clear reference content — better inputs produce better courses.
- Choose the correct language up front; it **cannot** be changed later.

**Common mistakes.**
- Picking the wrong language (it's permanent).
- Expecting to edit language after creation.

**Limitations.** Language is immutable after creation. Generation quality depends on
the reference material provided.

**Related.** [Languages](#42-languages), [Editor](#43-the-editor),
[Narration](#45-narration-ai-voiceover).

---

### 4.2 Languages

**Purpose.** Produce a course and its narration in a chosen language.

**How it works.** Learnbee supports **14 languages**:
- **1 global:** English.
- **9 Indian:** Hindi, Marathi, Gujarati, Bengali, Punjabi, Tamil, Kannada, Telugu,
  Malayalam.
- **4 European:** (exact set **TBD** — European languages beyond English are
  supported for narration and content.)

All AI-generated content and narration are produced in the course language, and UI
strings are localized where available.

**Steps.** Choose the language in **wizard step 1 (Basics)**.

**Options.** One language per course.

**Best practices.** Decide the language before generating; use **Translate** to make
other-language versions (see [Translate](#412-translate)).

**Common mistakes.** Assuming the language can be switched after creation.

**Limitations.** **Language is immutable** — it is set at creation and cannot be
changed. To get a course in a different language, use Translate to create a new
linked copy.

**Related.** [Translate](#412-translate), [Narration](#45-narration-ai-voiceover).

---

### 4.3 The editor

**Purpose.** Build and edit a course.

**How it works.** Three-zone layout:
- **Module Tree (left)** — modules and slides; each slide shows its title (primary)
  and format (secondary), plus a voice-ready indicator.
- **Canvas (middle)** — the slide you're editing; all 24 formats are editable inline.
- **Properties Panel (right)** — settings for the selected slide.

**Auto-save.** Work saves automatically as you edit (debounced, ~1.5 seconds). There
is **no manual save button**.

**Preview.** Click **Preview** to play the course as a learner would.

**Best practices.** Give slides clear titles (used in the module tree and elsewhere).

**Common mistakes.** Waiting for a "Save" button — saving is automatic.

**Related.** [Slide formats](#44-slide-formats), [Narration](#45-narration-ai-voiceover).

---

### 4.4 Slide formats

**Purpose.** Present content in the most effective layout for each idea.

**How it works.** There are **24 formats** in 4 categories. Interactive formats and
step-revealed formats can act as **gates** (must be completed to proceed). See the
full table in [Appendix A](#appendix-a--slide-format-registry).

**Categories (summary).**
- **Narrative:** Title Slide, Agenda Slide, Big Statement.
- **Content:** Key Points, Insight Cards, Image + Content (left/right), Image Overlay
  (left/right), PDF Viewer, Step by Step, Accordion, Sticky Scroll, Sticky Slide.
- **Comparison:** Side by Side, Feature Matrix, Pros & Cons.
- **Interactive:** Scenario Challenge, Quiz / MCQ, True / False, Flip Cards, Image
  Explore, Image Match, Fill in the Blanks.

**Notes.**
- **Video** is a **mode of Big Statement**, not a separate format (see
  [Videos](#47-videos)).
- **PDF Viewer** embeds a paged PDF (see [PDFs](#48-pdfs)).

**Best practices.** Match the format to the content (e.g. use Comparison formats for
before/after; use Interactive formats to check understanding).

**Related.** [Videos](#47-videos), [PDFs](#48-pdfs), [Quizzes & interactive slides](#49-quizzes--interactive-slides).

---

### 4.5 Narration (AI voiceover)

**Purpose.** Add spoken narration to slides automatically, in the course language.

**When to use.** Whenever you want the course to be narrated.

**How it works.**
- Each course has a **default voice** — **female or male** — chosen in the wizard.
- You can **override the voice per narration segment** in the **Narration drawer**,
  and **preview** a voice before choosing it.
- Narration audio is **generated once by the creator** and then plays for every
  learner at no extra per-learner cost.
- Narration is split into **segments** (typically one per section/element of a slide).

**Per-slide narration options** (each with a course-wide default in Course
Settings):
- **Learner can skip** — lets the learner skip the narration.
- **Learner clicks on each segment** (**click mode**) — the learner clicks each
  element to hear its narration one segment at a time.
- **Auto-advance** — when narration ends, the course advances to the next slide after
  a short, cancellable countdown (about 2 seconds).

**Steps.**
1. Open a slide's **Narration** controls / drawer.
2. Generate or edit the narration script.
3. Choose voice (course default or per-segment override) and options.

**Options.** Voice gender (F/M), per-segment voice override, skip, click mode,
auto-advance.

**Examples.**
- Input-check slides (Quiz/MCQ, Image Match, Fill in the Blanks) narrate a single
  short instruction sentence rather than reading the question and answers aloud.

**Best practices.** Set the course default voice and options once; override per
segment only when needed.

**Common mistakes.** Expecting narration on video slides (video slides have their
own audio and do not use narration).

**Limitations.** Narration is disabled in video mode. Narration is in the course
language only.

**Related.** [Videos](#47-videos), [Languages](#42-languages).

---

### 4.6 Images

**Purpose.** Add and manage images in slides.

**How it works — the Image Picker tabs.**
1. **Pexels** — search free stock photos.
2. **From Course** — images already tagged to this course.
3. **All Images** — your whole image library.
4. **Upload** — upload your own image file.
5. **From Link** — paste an image URL to import.

**Automatic handling.**
- Uploaded and linked images are **optimised automatically** (resized, converted to
  WebP) so courses stay fast.
- Images you upload, link, or pick from the library are **automatically tagged** to
  the current course. Pexels images are used directly (not tagged).
- You can **crop** an image when adding it.

**Display modes.** Many image-bearing formats support:
- **Cover** (default) — image fills the area and may be cropped.
- **Contain** — the whole image is shown with a soft **blurred backdrop**.

**Formats supporting display modes** include: Big Statement, Title Slide, Image
Overlay (left/right), Image + Content (left/right), Key Points, Flip Cards, Fill in
the Blanks, Quiz / MCQ.

**Display modes NOT available on** (by design): Image Explore, Image Match, Sticky
Scroll, Sticky Slide, Insight Cards, Scenario Challenge.

**Steps.** Open the image picker on any image slide → choose a tab → select/upload/
paste → crop if desired → confirm.

**Best practices.** Use **Contain** when the full image matters (e.g. diagrams); use
**Cover** for backgrounds.

**Common mistakes.** Expecting display-mode toggles on hotspot formats (Image
Explore/Match) — not available because hotspots are positioned by percentage.

**Limitations.** See "Display modes NOT available" above.

**Related.** [Image Explore / Image Match](#49-quizzes--interactive-slides),
["From Link" errors](#8-errors--messages).

---

### 4.7 Videos

**Purpose.** Add full-screen video to a course.

**How it works.** There is **no standalone video format**. Video is a **mode of the
Big Statement slide**. A video slide plays full-screen and supports either:
- An **uploaded video file**, or
- A **YouTube** video (paste the link; plays via YouTube's player).

**Important behavior.** Narration is **disabled** on video slides — the video
provides its own audio.

**Steps.** Add/select a Big Statement slide → switch it to **video mode** → upload a
file or paste a YouTube link.

**Limits.** A course can use **up to 6 uploaded video files**, each up to **25 MB**
(MP4 or WebM). **YouTube links are unlimited** — only uploaded files count toward the
cap. The counter (shown on a video slide's settings panel and in the upload dialog as
"*X of 6 videos used*") counts each **video-mode** slide that has an uploaded file, so
the same file placed on several slides counts once per slide. Switching a slide out of
video mode (to Statement) frees its slot; switching it back is blocked once you are
already at 6.

**Common mistakes.** Looking for a separate "Video" format — use Big Statement's
video mode instead.

**Related.** [Big Statement](#appendix-a--slide-format-registry),
[Limits & Constraints](#10-limits--constraints).

---

### 4.8 PDFs

**Purpose.** Embed a PDF document inside a course.

**How it works.** The **PDF Viewer** slide displays a paged PDF. Add PDFs in the
wizard's **Media** step, or via the PDF picker in the editor.

**Steps.** Add a **PDF Viewer** slide → choose a PDF from your Course PDFs, or upload
one.

**Limitations.** Supported PDF size limits and page limits: **TBD**.

**Related.** [Creating a course (Media step)](#41-creating-a-course-the-course-wizard).

---

### 4.9 Quizzes & interactive slides

**Purpose.** Check understanding and let learners explore.

**Interactive formats.** Scenario Challenge, Quiz / MCQ, True / False, Flip Cards,
Image Explore, Image Match, Fill in the Blanks. Several are **gated** (must be
completed before continuing).

**Quiz configuration.** Quiz count, difficulty (basic / intermediate / advanced),
and distribution (per-module or end-only) are set in the wizard; a **pass mark** and
minimum questions can be configured for the course.

**Narration on input checks.** Quiz/MCQ, Image Match, and Fill in the Blanks narrate
a **single short instruction sentence** rather than reading the question and answers
aloud.

**SCORM behavior.** In a SCORM package, quizzes report **completion and score** to
the LMS.

**Related.** [Slide formats](#44-slide-formats), [SCORM export](#411-scorm-export).

---

### 4.10 Publishing & sharing

**Purpose.** Make a course available online.

**How it works.** Open the **Publish** dialog to publish. You receive:
- A **6-character access code** (learners enter it to open the course).
- A **shareable link** and a **downloadable QR code** (as an image).
- An **embed code** (an `<iframe>`) to place the course in another website.

**Re-publishing.** Re-publishing **keeps the same access code and link** and updates
the content in place.

**How learners open a published course.**
- Visit the **share link**, or
- Enter the **access code** in the "Access code" box on the home screen (learners
  don't need an account).
- Embedded view: appending `?embed=true` hides the header/footer and shows a compact
  player (used by the embed code).

**Access code format.** 6 characters from an unambiguous alphabet (excludes easily
confused characters like 0/O and 1/I).

**Best practices.** Share the link or QR for direct access; use the embed code for
websites/intranets.

**Common mistakes.** Expecting a new code after re-publishing — the code and link
stay the same.

**Related.** [Access code entry](#3-getting-started), [SCORM export](#411-scorm-export).

---

### 4.11 SCORM export

**Purpose.** Deliver a course through an LMS.

**How it works.** Export any course as a **SCORM 2004** package (a `.zip`). Key
points:
- **Always available** — you do **not** need to publish first.
- The file is **date-stamped** (e.g. `coursename_YYYY-MM-DD_scorm.zip`).
- The package is **self-contained** — images, audio, and video are bundled inside, so
  it doesn't depend on external hosting.
- It tracks **lesson status/completion, score, session time**, and resume location.
- It plays the same 24 formats as the online player.

**Steps.** Use the **Export SCORM** action. Packaging takes about **30–40 seconds**
(a "Packaging…" spinner shows while it builds); then the `.zip` downloads.

**Best practices.** Upload the `.zip` to your LMS as a SCORM 2004 course.

**Common mistakes.** Double-clicking Export during packaging (the button is disabled
while building).

**Limitations.** SCORM 2004 (not 1.2 or xAPI) — other standards are **TBD**.

**Related.** [Publishing & sharing](#410-publishing--sharing),
[Integrations](#11-integrations).

---

### 4.12 Translate

**Purpose.** Produce the same course in another language.

**How it works.** A course can be copied and **translated** into a target language,
producing a linked **translation family** (the same course in multiple languages).

**Steps.** From a course, choose **Translate** and pick the target language.

**Limitations.** Detailed translate behavior and any per-format caveats: **TBD**.

**Related.** [Languages](#42-languages).

---

### 4.13 Collaboration

**Purpose.** Invite others to review or co-edit a course.

**How it works.**
- **Invite collaborators by email.** They receive an email with a **join link**; when
  they sign in they're added to the course with the role you chose. Up to **6
  collaborators** per course (see [Permissions & Roles](#9-permissions--roles) for what
  each role can do).
- **Threaded review comments.** Leave a comment on the **whole course** or on a
  **specific slide**; anyone on the course can reply. There is no "resolve" step — a
  comment stays until its author **deletes** it (deleting the first comment removes its
  replies too). You can **dictate** a comment with speech-to-text.
- **Per-slide comment indicator.** Slides with comments show a comment icon and an
  **unread badge** in the module tree, so it's clear where feedback is.
- **Per-thread AI-Assist.** From a comment thread, an author can ask AI to apply the
  requested change to that slide, and can **revert** it (newest applied edit first).
- **Shared-course indicators.** A shared course shows a **"Shared"** badge and a
  **"by \<owner\> · \<role\>"** byline in the Library, so you can tell whose course it is
  and your role on it.

**Related.** [Permissions & Roles](#9-permissions--roles).

---

### 4.14 Curated Library

**Purpose.** Start from ready-made courses.

**How it works.** The **Library** is a curated set of official/ready-made courses
organized into **collections**. You can **browse, copy (clone), and adapt** them as
your own starting point. The Library supports **semantic search** (search by meaning,
not just keywords).

**Steps.** Open **Library** → browse a collection → open a course → **clone/copy** it
to start editing your own version.

**Related.** [Creating a course](#41-creating-a-course-the-course-wizard).

---

## 5. Workflows

### 5.1 Create → narrate → publish (typical journey)
1. **Start** a new course from the "New" menu.
2. Complete the **6-step wizard** (Basics → Content → Media → Structure → Quiz →
   Review) and **Generate**.
3. In the **editor**, refine slides, images, and content.
4. Add/generate **narration**; set voice and per-slide options.
5. **Preview** as a learner.
6. **Publish** → share the link / QR / embed, or give learners the access code.

**Expected outcome.** A live, narrated course reachable by link, QR, embed, or access
code.

### 5.2 Create → export SCORM → upload to LMS
1. Create and refine the course (as above).
2. Choose **Export SCORM** (available without publishing).
3. Wait ~30–40 seconds for packaging; download the `.zip`.
4. Upload the `.zip` to your LMS as a SCORM 2004 course.

**Expected outcome.** A self-contained SCORM course in the LMS that tracks completion
and quiz scores.

### 5.3 Start from the Library
1. Open **Library** → pick a collection → open a course.
2. **Clone** it.
3. Edit the clone in the editor; publish or export as needed.

**Expected outcome.** Your own editable copy of a ready-made course.

### 5.4 Translate an existing course
1. Open the source course.
2. Choose **Translate** → pick the target language.
3. Review the translated copy (part of the same translation family).

**Expected outcome.** A linked copy of the course in the new language.

### 5.5 Learner journey (taking a course)
1. Open the **share link** (or enter the **access code** on the home screen; or open
   an embedded/LMS-hosted copy).
2. Progress through slides; complete any **gated** interactive slides.
3. Reach the **completion screen**.

**Decision points.** Narration options (skip / click each segment / auto-advance)
affect how the learner moves through slides.

**Expected outcome.** Course completion (and, in SCORM, completion + score reported to
the LMS).

---

## 6. Frequently Asked Questions

**Q: How do I create a course?**
A: Use the **Course Wizard** (New → 6 steps → Generate). See
[4.1](#41-creating-a-course-the-course-wizard).

**Q: Can I change the course language after creating it?**
A: No — the **language is permanent**. To get another language, use **Translate** to
create a linked copy. See [4.2](#42-languages) and [4.12](#412-translate).

**Q: How do I add voice narration?**
A: Narration is AI-generated in the course language; set a default voice in the
wizard and adjust per slide/segment in the Narration drawer. See
[4.5](#45-narration-ai-voiceover).

**Q: How do I publish and share a course?**
A: Open **Publish** to get a 6-character access code, a share link, a QR code, and an
embed code. See [4.10](#410-publishing--sharing).

**Q: Do learners need an account?**
A: No — learners open a **published** course via link or access code without signing
in.

**Q: How do I export to SCORM / put my course in an LMS?**
A: Use **Export SCORM** (no need to publish first); upload the resulting `.zip` to
your LMS. See [4.11](#411-scorm-export).

**Q: Does re-publishing change the link or code?**
A: No — re-publishing keeps the **same code and link** and updates the content.

**Q: How do I add a video?**
A: Use a **Big Statement** slide in **video mode** (uploaded file or YouTube link).
There's no separate video format. See [4.7](#47-videos).

**Q: Why isn't there narration on my video slide?**
A: Narration is **disabled** on video slides by design — the video supplies its own
audio.

**Q: How do I add images? Can I use my own?**
A: Use the Image Picker — Pexels, From Course, All Images, Upload, or From Link. You
can crop, and choose Cover vs Contain display. See [4.6](#46-images).

**Q: Where can I find ready-made courses?**
A: The **Library** — browse collections, clone a course, and adapt it. See
[4.14](#414-curated-library).

**Q: Do I need to save my work?**
A: No — the editor **auto-saves** continuously.

**Q: Is narration expensive per learner?**
A: No — narration audio is generated once and reused, so it's free to play for every
learner.

---

## 7. Troubleshooting

> For each issue: **Symptoms → Possible causes → Resolution → When to contact
> support.**

### 7.1 Can't change the course language
- **Symptoms:** No option to switch language after creation.
- **Cause:** Language is immutable by design.
- **Resolution:** Use **Translate** to create a linked copy in the new language.
- **Contact support if:** Translate isn't producing the expected language. 

### 7.2 SCORM export seems stuck
- **Symptoms:** Export button shows "Packaging…" and is disabled.
- **Cause:** Packaging bundles images/audio/video and takes ~30–40 seconds.
- **Resolution:** Wait for packaging to finish; the `.zip` will download. Don't
  double-click.
- **Contact support if:** It runs far longer than ~40 seconds or fails repeatedly.

### 7.3 Narration missing on a slide
- **Symptoms:** No audio plays on a slide.
- **Possible causes:** It's a **video** slide (narration disabled), narration wasn't
  generated for that slide, or "Learner can skip" was used.
- **Resolution:** For non-video slides, generate/enable narration in the Narration
  drawer.
- **Contact support if:** Narration won't generate at all.

### 7.4 Image won't import "From Link"
- **Symptoms:** Pasting an image URL fails with a message.
- **Possible causes:** The source blocks access, the file is too large, the link
  isn't a direct image, or the link is a data URL. See the specific messages in
  [Errors & Messages](#8-errors--messages).
- **Resolution:** Follow the on-screen guidance — often, download the image and use
  the **Upload** tab instead.
- **Contact support if:** Uploading also fails.

### 7.5 Learner can't open a course with the access code
- **Symptoms:** Access code doesn't open the course.
- **Possible causes:** Code mistyped, course not published, or the wrong code.
- **Resolution:** Re-check the 6-character code (it uses an unambiguous alphabet).
  Ensure the course is published; re-share the link.
- **Contact support if:** A correct code for a published course still fails.

### 7.6 Reached the video limit
- **Symptoms:** A message says you've hit the video cap, or switching a slide back to
  video mode is blocked.
- **Cause:** A course can have at most **6 uploaded video files** (each ≤ 25 MB).
- **Resolution:** Remove a video from a slide, or switch a slide to Statement mode, to
  free a slot — then add the new one. **YouTube links don't count**, so use a YouTube
  link instead of an upload if you need more videos.
- **Contact support if:** You need a higher limit.

---

## 8. Errors & Messages

> **"From Link" image import** returns a stable error type for every failure. The
> exact wording shown to users maps to specific guidance. Meanings below are grouped
> by cause; **exact final copy is partly TBD** but the categories are authoritative.

| Error category | Meaning | Likely cause | Resolution |
|---|---|---|---|
| `forbidden` | The source refused access to the image. | Site blocks hotlinking/automated fetch. | Download the image and use the **Upload** tab. |
| `too_large` | The image exceeds the size limit. | File too big. | Resize/compress, or upload a smaller version. |
| `data_url` | The link is a data URL, not a fetchable web URL. | Pasted a `data:` URL. | Save it as a file and use **Upload**. |
| `source_error` | The source returned an error. | Broken/expired link or server error. | Verify the URL opens in a browser; otherwise **Upload**. |
| Other fetch errors (several codes) | The link couldn't be imported. | Not a direct image, network error, unsupported type, etc. | Check the link points directly to an image; otherwise **Upload**. |

> There are **11** defined "From Link" error codes in total; those not listed
> explicitly above are handled with actionable on-screen guidance. Full per-code copy:
> **TBD**.

**Other known system messages:**
- **"ANTHROPIC_API_KEY is not configured on the server."** — An internal
  configuration error in the AI service. **Meaning:** the server can't reach the AI
  provider. **Resolution:** contact support (this is not a user-fixable setting).

> Additional user-visible error messages: **To Be Documented.**

---

## 9. Permissions & Roles

**Summary of what's known:**
- A course has an **owner** (the creator).
- Courses can be **shared** with collaborators; collaboration includes **roles**,
  **threaded review comments**, and **shared-course indicators**.
- Access to your own courses is **per-user** (you see and edit your own courses).
- The **Library** allows browsing and cloning courses across users (read/copy access
  to curated content).

**Roles.** A course has five roles (each collaborator is assigned one):

| Role | Edit content | Course settings / images | Comment | Invite / manage collaborators |
|---|---|---|---|---|
| **Owner** | ✅ | ✅ | ✅ | ✅ (also delete the course) |
| **Admin** | ✅ | ✅ | ✅ | ✅ |
| **Editor** | ✅ | ✅ | ✅ | — |
| **Reviewer** | — (locked) | — | ✅ | — |
| **Viewer** | — | — | — (view only) | — |

- **Reviewer / Viewer** see the full editor but **read-only** (locked yet still
  scrollable, so they can review everything); course settings and image editing are
  hidden, and Library card actions are limited by role.
- A course can have up to **6 collaborators** in addition to the owner.

---

## 10. Limits & Constraints

| Area | Constraint |
|---|---|
| **Course language** | Exactly one, set at creation, **immutable**. |
| **Languages supported** | 14 (English + 9 Indian + 4 European; the 4 European set is TBD). |
| **Slide formats** | 24 (see [Appendix A](#appendix-a--slide-format-registry)). |
| **Narration voices** | Female or male per course; per-segment override available. |
| **Access code** | 6 characters, unambiguous alphabet. |
| **SCORM** | SCORM **2004**; packaging ~30–40 seconds; self-contained zip. |
| **Videos per course** | Up to **6 uploaded video files**. YouTube links are unlimited and don't count. |
| **Video file size** | **25 MB** max per uploaded file (MP4 or WebM). |
| **Title Slide layouts** | **7** shuffleable layouts (with a logo size control). |
| **Flip Cards** | 2–4 cards per slide. |
| **Image handling** | Uploaded/linked images auto-optimised to WebP, max dimension ~1280px. |
| **Image size (From Link)** | Has a maximum size (exact value **TBD**). |
| **PDF size / pages** | **TBD.** |
| **Supported image types** | Common web image formats (exact list **TBD**; output is WebP). |
| **Supported video sources** | Uploaded video file or YouTube link. |
| **Browser compatibility** | **To Be Documented** (modern browsers assumed). |
| **Performance** | SCORM packaging is the main wait (~30–40s); narration is generated once by the creator. |

---

## 11. Integrations

| Integration | Purpose | Setup | Requirements | Known limitations |
|---|---|---|---|---|
| **LMS via SCORM 2004** | Deliver courses in an LMS with completion/score tracking. | Export SCORM → upload the `.zip` to the LMS. | An LMS that accepts SCORM 2004. | SCORM 2004 only; 1.2/xAPI **TBD**. |
| **YouTube** | Embed a YouTube video in a Big Statement (video mode). | Paste the YouTube link on a video-mode slide. | A public/embeddable YouTube video. | Playback uses YouTube's own player; narration disabled on video slides. |
| **Pexels (stock images)** | Search free stock photos in the image picker. | Use the **Pexels** tab in the image picker. | None (built in). | Pexels images are used as remote images and aren't added to your library. |
| **Embed (iframe)** | Put a published course into another website. | Copy the embed code from Publish. | A site where you can paste HTML. | Uses the compact embedded player. |

> **Authentication provider (Clerk)** underpins sign-in/sign-up but is not a
> user-configurable integration.

---

## 12. API

**Public API for creators/developers:** **To Be Documented.**

At this time there is **no documented public API** for building or managing courses
programmatically. Learnbee uses internal service endpoints (for AI generation,
narration, images, SCORM packaging, etc.), but these are **not** a supported public
interface. Authentication, endpoints, examples, and error responses for any public
API are **TBD**.

If a user asks for API access, the assistant should say a public API is not currently
documented and suggest contacting support.

---

## 13. Known Limitations

- **Language is immutable** after course creation (use Translate for other
  languages).
- **No standalone video format** — video is a Big Statement mode; narration is
  disabled on video slides.
- **Display modes (Cover/Contain) are not available** on Image Explore, Image Match,
  Sticky Scroll, Sticky Slide, Insight Cards, and Scenario Challenge.
- **SCORM is 2004 only** (1.2/xAPI: TBD).
- **Per-course video limit** exists (exact value TBD).
- **No documented public API** (TBD).
- **Right-to-left (RTL) / Arabic** support: not available (planned/parked).
- **Learner tracking beyond SCORM** (e.g. email capture in the hosted player):
  planned/parked, not a current feature.

---

## 14. Best Practices

**Recommended workflows.**
- Choose the correct **language** before generating (it's permanent).
- Provide strong **reference content** for better AI generation.
- Set the **default voice and narration options** once at the course level; override
  only where needed.
- Use **Preview** before publishing or exporting.

**Performance tips.**
- Expect ~30–40s for **SCORM packaging**; don't double-click Export.
- Prefer **Contain** display mode for diagrams so nothing is cropped.

**Delivery tips.**
- Use the **share link or QR** for direct access; use the **embed code** for
  websites; use **SCORM** for an LMS.
- Remember re-publishing **reuses the same code and link**.

**Common pitfalls to avoid.**
- Trying to change the language after creation.
- Looking for a Save button (auto-save handles it).
- Expecting a separate Video format or narration on video slides.
- Expecting a new access code after re-publishing.

---

## 15. Release Notes

> High-level, user-facing highlights. Engineering-level detail is intentionally
> omitted. Dates reflect the project timeline.

**May 2026 — recent additions**
- **Collaboration:** threaded review comments, collaborator roles, shared-course
  indicators.
- **Curated Library:** super-user curated Library with collections, cloning,
  cross-user access, and **semantic search**.
- **Voices:** per-course default voice (female/male) with a localized preview button,
  and per-segment voice override.
- **Image library:** Pexels + own-library picker (From Course / All Images / Upload /
  From Link), auto-tagging, image optimisation, and **Cover/Contain** display modes on
  image formats. Image **cropping** at upload.
- **Interactivity:** **Click mode** (learner clicks each segment) and **Auto-advance**
  across supported formats.
- **SCORM:** self-contained packages (images/audio/video bundled), full 24-format
  support in the SCORM player.
- **Video & PDF:** video via Big Statement (file or YouTube) with a video library;
  PDF Viewer slides with a Course PDFs upload step.

**Client-review fixes (July 2026)**
- **Video limits raised:** up to **6 uploaded videos per course** (was 3), each up to
  **25 MB** (was 20 MB); YouTube links remain unlimited. The video counter now counts
  each video-mode slide (duplicates included) and frees a slot when a slide is switched
  out of video mode; switching a slide back to video is blocked once you're at the cap.
- **Logo resize:** the Title Slide logo has a size control (Small / Medium / Large /
  Extra large).
- **Title Slide layouts:** expanded from 3 to **7 shuffleable layouts** — Cinematic,
  Split, Typographic, Centered hero, Text left · image right, Full image · lower scrim,
  and Diagonal split.
- **Image cropper:** crop images at upload across all image sources.
- Other requested fixes (background images on more formats, richer voiceover, and
  reducing repeated content on generation): **in progress**.

**Breaking changes / deprecations:** None documented for users at this time.

> Full historical release notes: **To Be Documented.**

---

## 16. Appendix

### Appendix A — Slide format registry

| Format | Category | Gated? |
|---|---|---|
| Title Slide | Narrative | No |
| Agenda Slide | Narrative | No |
| Big Statement | Narrative | No |
| Key Points | Content | No |
| Insight Cards | Content | No |
| Image + Content (Left) | Content | No |
| Image + Content (Right) | Content | No |
| Image Overlay (Left) | Content | No |
| Image Overlay (Right) | Content | No |
| PDF Viewer | Content | No |
| Side by Side | Comparison | No |
| Feature Matrix | Comparison | No |
| Pros & Cons | Comparison | No |
| Step by Step | Content | Yes |
| Accordion | Content | Yes |
| Sticky Scroll | Content | Yes |
| Sticky Slide | Content | Yes |
| Scenario Challenge | Interactive | Yes |
| Quiz / MCQ | Interactive | Yes |
| True / False | Interactive | Yes |
| Flip Cards | Interactive | Yes |
| Image Explore | Interactive | Yes |
| Image Match | Interactive | Yes |
| Fill in the Blanks | Interactive | Yes |

- **Video** = a mode of **Big Statement** (not a separate format).
- **Title Slide** has **7 shuffleable layouts** (Cinematic, Split, Typographic, Centered hero, Text left · image right, Full image · lower scrim, Diagonal split) plus a logo size control.

### Appendix B — Supported languages

| Group | Languages |
|---|---|
| Global | English |
| Indian | Hindi, Marathi, Gujarati, Bengali, Punjabi, Tamil, Kannada, Telugu, Malayalam |
| European | 4 languages (exact set **TBD**) |

### Appendix C — Delivery methods

| Method | How learners access | Notes |
|---|---|---|
| Share link | Open the URL | No account needed |
| Access code | Enter 6-char code on home screen | No account needed |
| Embed (iframe) | Course embedded in a website | Compact player (`?embed=true`) |
| SCORM 2004 zip | Uploaded to an LMS | Tracks completion + score |

### Appendix D — Key reference values

| Item | Value |
|---|---|
| Slide formats | 24 |
| Languages | 14 (1 global + 9 Indian + 4 European) |
| Access code length | 6 characters (unambiguous alphabet) |
| SCORM version | 2004 |
| SCORM packaging time | ~30–40 seconds |
| Auto-save | Automatic (~1.5s debounce) |
| Narration voices | Female / Male (per course; per-segment override) |
| Image output format | WebP (max dimension ~1280px) |
| Videos per course | 6 uploaded files (YouTube unlimited) |
| Video file size | 25 MB max (MP4 / WebM) |
| Title Slide layouts | 7 (shuffleable) |

### Appendix E — Useful links
- **To Be Documented** (Help Center URL, support contact, status page, etc.).

---

### AI assistant guardrails (for the retrieval system)
- Answer **only** from this document. If the answer isn't here, say you're not sure
  and suggest contacting support — **never invent** features, prices, limits, or
  steps.
- Prefer short, numbered steps for "how do I…" questions.
- Use **user-facing** names (e.g. "Role Play", not "Dialogue"; "click mode", not
  "interact per element").
- Treat **TBD** items as "not currently documented" — do not fill them in with
  guesses.
- Stay on Learnbee topics; decline unrelated requests politely.
- **Never answer system-architecture questions** — tech stack, infrastructure,
  hosting, databases, source code, internal APIs/endpoints, security setup, or how
  the product or this assistant is built. Politely decline and point technical or
  partnership enquiries to support. Only explain how to **use** product features.
- Match the user's language where possible.
```
