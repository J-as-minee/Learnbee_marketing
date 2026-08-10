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
> **Last reviewed:** 2026-08-10 · **Applies to:** Learnbee (web app)

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
- **25 slide formats** — from narrative and content to interactive/quiz layouts, plus an AI Custom Slide.
- **Multi-format delivery** — the same course plays in the editor preview, the
  hosted `/play` player, and inside a SCORM package.
- **Self-contained SCORM** — images, audio and video are bundled into the export.

---

## 2. Terminology & Glossary

| Term | Definition |
|---|---|
| **Course** | The top-level unit a creator builds and publishes. Contains modules and slides. |
| **Module** | A named section of a course; contains an ordered list of slides. |
| **Slide** | A single screen in a course, using one of the 25 slide **formats**. |
| **Format** | The layout/type of a slide (e.g. Title Slide, Quiz / MCQ). See the [format registry](#appendix-a--slide-format-registry). |
| **Wizard / Course Wizard** | The 6-step guided flow for creating a new course. |
| **Narration / Voiceover** | AI-generated spoken audio for slides, in the course language. |
| **Segment** | One narration unit within a slide (usually one per section/element). |
| **Click mode** | A narration mode where the learner clicks each element to hear its segment, instead of it auto-playing. Internally "interact per element / per segment". |
| **Auto-advance** | Option to move to the next slide automatically after narration ends. Not available on question slides or PDF Viewer — those wait for the learner. |
| **Gated slide** | An interactive slide the learner must complete before proceeding. |
| **Access code** | A 6-character code a learner enters to open a published course. |
| **Publish** | Make a course available online with a link, QR code, and embed code. |
| **SCORM package** | A downloadable `.zip` of the course for uploading to an LMS. |
| **Display mode** | For image slides: **Cover** (fills, may crop) or **Contain** (whole image + blurred backdrop). |
| **Library / Curated Library** | A curated collection of ready-made courses to browse, copy, and adapt. |
| **Translation family** | A set of the same course translated into multiple languages, linked together. |
| **Course PDF** | A PDF document embedded via the PDF Viewer slide. |
| **Template** | A curated **AI Custom Slide** design (hero, comparison, timeline, etc.) you insert from the Add-slide picker. Inserting a template creates a pre-filled Custom Slide. Only super users can save new templates. |
| **AI Custom Slide** | A slide format (category "AI") where AI generates a custom slide from your prompt. One of the 25 formats. |
| **Big Play** | The label shown in the module tree for a **Big Statement** slide set to **video mode** — the same format, not a separate one. |
| **Reference content / Reference PDF** | Source material you provide so the AI can generate the course. |

### Acronyms

| Acronym | Expansion / meaning |
|---|---|
| **AI** | Artificial Intelligence — powers outline generation, narration scripts, translation, and the AI Custom Slide. |
| **LMS** | Learning Management System — where a SCORM package is uploaded and played. |
| **SCORM** | Sharable Content Object Reference Model — the e-learning package standard Learnbee exports (**SCORM 2004 4th Edition**). |
| **MCQ** | Multiple-Choice Question — the Quiz / MCQ format. |
| **PDF** | Portable Document Format — used by the PDF Viewer slide, reference PDFs, and Course PDFs. |
| **QR** | Quick Response code — the scannable code produced in the Publish dialog. |
| **TTS** | Text-to-Speech — the technology behind AI narration. |
| **VO** | Voiceover — the generated narration audio. |
| **F / M** | Female / Male — narration voice options. |
| **RTL** | Right-to-Left text (e.g. Arabic) — not currently supported. |
| **OAuth** | Open Authorization — a sign-in method (e.g. Google; planned). |
| **RAG** | Retrieval-Augmented Generation — how this document is consumed by the Help assistant. |

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

**Keywords.** create course, new course, wizard, generate course, AI course, build a
course, start a course, course generator, make a course.

---

### 4.2 Languages

**Purpose.** Produce a course and its narration in a chosen language.

**When to use.** When you need the course content and voiceover in a specific language.

**How it works.** Learnbee supports **16 languages**:
- **English** and **English (India)**.
- **9 Indian languages:** Hindi, Bengali, Marathi, Gujarati, Punjabi, Tamil, Kannada,
  Malayalam, Telugu.
- **4 European:** Spanish, French, Portuguese, German.
- **Japanese.**

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

**Keywords.** language, languages, Hindi, Tamil, Spanish, Japanese, multilingual,
change language, course language, supported languages.

---

### 4.3 The editor

**Purpose.** Build and edit a course.

**When to use.** Throughout building, refining, and reviewing a course.

**How it works.** Three-zone layout:
- **Module Tree (left)** — modules and slides; each slide shows its title (primary)
  and format (secondary), plus a voice-ready indicator.
- **Canvas (middle)** — the slide you're editing; all 25 formats are editable inline.
- **Properties Panel (right)** — settings for the selected slide.

**Auto-save.** Work saves automatically as you edit (debounced, ~1.5 seconds). There
is **no manual save button**.

**Preview.** Click **Preview** to play the course as a learner would.

**Course styling.** A course-level **font style** setting controls the typography used
across the course's slides.

**Best practices.** Give slides clear titles (used in the module tree and elsewhere).

**Common mistakes.** Waiting for a "Save" button — saving is automatic.

**Related.** [Slide formats](#44-slide-formats), [Narration](#45-narration-ai-voiceover).

**Keywords.** editor, edit course, module tree, canvas, properties panel, autosave,
save, rearrange slides, font style.

---

### 4.4 Slide formats

**Purpose.** Present content in the most effective layout for each idea.

**When to use.** When adding a slide or changing a slide's layout/type.

**How it works.** There are **25 formats** across 6 categories, shown in the
Add-slide picker. Several interactive and step-revealed formats act as **gates**
(must be completed before the learner can proceed). See the full table in
[Appendix A](#appendix-a--slide-format-registry).

**Categories (as shown in the picker).**
- **Opening:** Title Slide, Agenda.
- **Content:** Big Statement, Image + Content (Left/Right), Image + Overlay
  (Left/Right), Step by Step, PDF Viewer.
- **Interactive:** Key Points, Insight Cards, Accordion, Sticky Scroll, Sticky Slide,
  Flip Cards, Image Explore, Scenario Challenge.
- **Quiz:** Quiz / MCQ, True / False, Fill in the Blanks, Image Match.
- **Comparison:** Side by Side, Feature Matrix, Pros & Cons.
- **AI:** AI Custom Slide.

**Notes.**
- **Video** is a **mode of Big Statement**, not a separate format (see
  [Videos](#47-videos)). In the module tree a video-mode slide is labelled **"Big
  Play"**.
- **PDF Viewer** embeds a paged PDF (see [PDFs](#48-pdfs)).
- **AI Custom Slide** generates a bespoke slide from a prompt (category "AI"; see
  [AI Custom Slide](#416-ai-custom-slide)).
- **Templates** are ready-made **AI Custom Slide** designs you can insert (see
  [Templates](#415-templates)).

**Best practices.** Match the format to the content (e.g. use Comparison formats for
before/after; use Interactive formats to check understanding).

**Related.** [Videos](#47-videos), [PDFs](#48-pdfs), [Quizzes & interactive slides](#49-quizzes--interactive-slides).

**Keywords.** slide formats, slide types, layouts, add slide, format list, kinds of
slides, categories, 25 formats.

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
- A course-level **narration-length** setting controls how long/detailed the
  generated narration scripts are.

**Per-slide narration options** (each with a course-wide default in Course
Settings):
- **Learner can skip** — lets the learner skip the narration.
- **Learner clicks on each segment** (**click mode**) — the learner clicks each
  element to hear its narration one segment at a time.
- **Auto-advance** — when narration ends, the course advances to the next slide after
  a short, cancellable countdown (about 2 seconds). The learner can press **Cancel**
  on the countdown to stay on the slide.
  - **Where it does not apply.** Six slide types always wait for the learner, whatever
    the course default or the per-slide setting says: **Quiz/MCQ**, **True/False**,
    **Fill in the Blanks**, **Image Match**, **Scenario Challenge** and **PDF Viewer**.
    On those slides the narration is a short instruction that finishes well before the
    learner has answered or finished reading, so advancing would either skip the
    question or pull them off the document. The Narration drawer shows
    *"not available — this slide waits for the learner"* instead of the toggle.
  - So an auto-advancing course plays itself and pauses exactly where the learner has
    something to do; they answer, then click **Next** to resume.
  - **Video slides** (Big Statement in video mode) advance when the video finishes,
    rather than when narration ends — video slides have no narration. Slides using a
    **YouTube** embed are the exception and stay manual.

**Steps.**
1. Open a slide's **Narration** controls / drawer.
2. Generate or edit the narration script.
3. Choose voice (course default or per-segment override) and options.

**Options.** Voice gender (F/M), per-segment voice override, skip, click mode,
auto-advance, narration length.

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

**Keywords.** narration, voiceover, voice, TTS, audio, read aloud, male voice, female
voice, skip, click mode, auto-advance, narration length.

---

### 4.6 Images

**Purpose.** Add and manage images in slides.

**When to use.** When a slide needs a photo, illustration, or background image.

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

**Keywords.** image, photo, picture, Pexels, upload image, stock photo, background
image, crop, cover, contain, from link, image library.

---

### 4.7 Videos

**Purpose.** Add full-screen video to a course.

**When to use.** When you want a video to play full-screen on a slide.

**How it works.** There is **no standalone video format**. Video is a **mode of the
Big Statement slide**. A video slide plays full-screen and supports either:
- An **uploaded video file**, or
- A **YouTube** video (paste the link; plays via YouTube's player).

**Important behavior.**
- Narration is **disabled** on video slides — the video provides its own audio.
- An uploaded video **autoplays when the learner reaches the slide**.
- In the editor's **module tree**, a video-mode slide is labelled **"Big Play"** — it
  is the same Big Statement format, not a separate slide type.

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

**Keywords.** video, YouTube, upload video, big play, video slide, embed video, mp4,
webm, video limit, autoplay.

---

### 4.8 PDFs

**Purpose.** Embed a PDF document inside a course.

**When to use.** When learners need to read a multi-page document inside the course.

**How it works.** The **PDF Viewer** slide displays a paged PDF. Add PDFs in the
wizard's **Media** step, or via the PDF picker in the editor.

**Steps.** Add a **PDF Viewer** slide → choose a PDF from your Course PDFs, or upload
one.

**Limitations.** Supported PDF size limits and page limits: **TBD**.

**Related.** [Creating a course (Media step)](#41-creating-a-course-the-course-wizard).

**Keywords.** PDF, document, PDF viewer, embed PDF, course PDF, attach document, paged
PDF.

---

### 4.9 Quizzes & interactive slides

**Purpose.** Check understanding and let learners explore.

**When to use.** When you want to test knowledge or add hands-on interactivity.

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

**Keywords.** quiz, MCQ, question, true false, fill in the blanks, image match,
assessment, pass mark, scoring, interactive, gated.

---

### 4.10 Publishing & sharing

**Purpose.** Make a course available online.

**When to use.** When the course is ready to share via link, QR code, embed, or access code.

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

**Sharing extras.**
- You can send a colleague a **course link that reopens the Share panel**; after they
  sign in, they can pull the SCORM zip themselves.
- **Copied links paste as the course name** (a titled hyperlink) in tools like Teams,
  Outlook and Slack, and shared links show a **social preview image**.

**Best practices.** Share the link or QR for direct access; use the embed code for
websites/intranets.

**Common mistakes.** Expecting a new code after re-publishing — the code and link
stay the same.

**Related.** [Access code entry](#3-getting-started), [SCORM export](#411-scorm-export).

**Keywords.** publish, share, link, QR code, embed, access code, iframe, republish,
share course, online player.

---

### 4.11 SCORM export

**Purpose.** Deliver a course through an LMS.

**When to use.** When you need to host the course in a Learning Management System.

**How it works.** Export any course as a **SCORM 2004** package (a `.zip`). Key
points:
- **Always available** — you do **not** need to publish first.
- The file is **date-stamped** (e.g. `coursename_YYYY-MM-DD_scorm.zip`).
- The package is **self-contained** — images, audio, and video are bundled inside, so
  it doesn't depend on external hosting.
- It tracks **lesson status/completion, score, session time**, and resume location.
- It plays the same 25 formats as the online player.

**Steps.** Use the **Export SCORM** action. Packaging takes about **30–40 seconds**
and shows a live **"Packaging… X%"** progress indicator while it builds; then the
`.zip` downloads.

**Best practices.** Upload the `.zip` to your LMS as a SCORM 2004 course.

**Common mistakes.** Double-clicking Export during packaging (the button is disabled
while building).

**Limitations.** SCORM 2004 4th Edition (not xAPI) — other standards are **TBD**.

**Related.** [Publishing & sharing](#410-publishing--sharing),
[Integrations](#11-integrations).

**Keywords.** SCORM, LMS, export, download package, SCORM 2004, upload to LMS, zip,
packaging, completion tracking.

---

### 4.12 Translate

**Purpose.** Produce the same course in another language.

**When to use.** When you need an existing course in one or more additional languages.

**How it works.** Translate copies a course into a new **child course** in a target
language as a **background job**. It translates slide **text** and **narration
scripts**, and **regenerates the voiceover audio** using the source course's voice
settings (only if the source course was voiced). Versions are linked as a
**translation family** and appear as **stacked decks** in the Library, each with its
own status, narration coverage, Share, Export SCORM, and Translate.

**Steps.** From a course, choose **Translate** → pick the target language → the job
runs in the background (progress shows in the notification bell, see
[Background jobs & notifications](#417-background-jobs--notifications)).

**Limitations.** One target language per run; a duplicate-language version is blocked.

**Related.** [Languages](#42-languages).

**Keywords.** translate, translation, another language, multilingual, localize, language
version, convert language.

---

### 4.13 Collaboration

**Purpose.** Invite others to review or co-edit a course.

**When to use.** When more than one person needs to build, review, or approve a course.

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

**Steps.** Open the course → **invite** a collaborator by email and pick a role → they
open the **join link**, sign in, and are added → leave **comments** on the course or a
slide → the author resolves feedback (optionally via **AI-Assist**) and **deletes**
threads when done.

**Configuration options.** Role per collaborator (owner / admin / editor / reviewer /
viewer); comment scope (course-level or per-slide).

**Example.** An instructional designer (editor) drafts the course; a subject-matter
expert (reviewer) leaves per-slide comments; the designer applies them and deletes the
threads.

**Best practices.** Give reviewers the **reviewer** role (comment-only) so they can't
accidentally change content; keep threads focused on one slide.

**Common mistakes.** Expecting a "resolve" button — there isn't one; **delete** the
thread instead. Inviting with the wrong email (invites are keyed to the exact address).

**Limitations.** Maximum **6 collaborators** per course (plus the owner). Reviewer and
viewer roles are read-only.

**Related.** [Permissions & Roles](#9-permissions--roles),
[Curated Library](#414-curated-library).

**Keywords.** collaborate, invite, share with team, co-edit, reviewer, comments,
feedback, review, join link, shared course, roles.

---

### 4.14 Curated Library

**Purpose.** Start from ready-made courses instead of a blank course.

**When to use.** When a curated course is close to what you need and you'd rather adapt
than build from scratch.

**How it works.** The **Library** is a curated set of official/ready-made courses
organized into **collections**. You can **browse, copy (clone), and adapt** them as
your own starting point. Cloning ("Use this course") runs as a **background job**
(progress in the notification bell), always clones the course's **original language**,
and regenerates its narration audio. **Semantic search** (search by meaning, not just
keywords) is available in the Library and on the **Home** screen across your courses
and collections, with filters (content type, draft/published, language).

**Steps.** Open **Library** → browse a collection (or **search**) → open a course →
**Preview** it → **Use this course** to clone → edit your copy in the editor.

**Configuration options.** Search filters: content type, draft/published, language.

**Example.** Search "onboarding", preview a match, click **Use this course**, and edit
the clone with your company's details.

**Best practices.** Preview before cloning; clone in the **original language** and then
**Translate** if you need another language.

**Common mistakes.** Expecting edits to a Library course to change the original — you
always edit your **own clone**, not the source.

**Limitations.** Only **super users** can create/curate collections; cloning always
uses the course's original language.

**Related.** [Creating a course](#41-creating-a-course-the-course-wizard),
[Translate](#412-translate),
[Background jobs & notifications](#417-background-jobs--notifications).

**Keywords.** library, templates library, ready-made courses, sample courses, clone,
use this course, copy course, collections, semantic search, browse courses.

---

### 4.15 Templates

**Purpose.** Start an **AI Custom Slide** from a ready-made design instead of a blank
one.

**When to use.** When you want a polished custom-slide layout (hero, comparison,
timeline, etc.) and would rather adapt a proven design than build it from scratch.

**How it works.** Templates are **curated AI Custom Slide designs** — pre-built layouts
(with image slots and narration) that Learnbee's super users have published to a shared
library. Picking a template inserts an **AI Custom Slide** pre-filled with that design,
which you then edit. Templates are grouped into **kinds** you can filter by: **Hero,
Comparison, Timeline, Process, Grid, Stat, Quote, List, Other**.

**Steps (add a template slide).**
1. In the editor, click **Add slide** to open the format picker.
2. Either **search by name** (one search box covers both formats and templates) or open
   the **Templates** view and **filter by kind**.
3. **Click a template** — it inserts a Custom Slide pre-filled with that design.
4. Edit the inserted slide's text, images, and narration.

**Configuration options.** Filter templates by **kind** (Hero / Comparison / Timeline /
Process / Grid / Stat / Quote / List / Other), or search by name/description.

**Example.** Search "timeline", pick a Timeline template, then replace its placeholder
milestones with your own content.

**Best practices.** Use a template as a starting layout, then replace all placeholder
text and images before publishing.

**Common mistakes.** Expecting templates for **every** format — templates are
specifically **Custom Slide** designs; the other 24 formats are added directly from the
picker.

**Limitations.** **Only super users (admins) can save new templates.** A regular creator
can insert templates but cannot save their own — the "Save as template" action appears on
a custom slide only for super users.

**Related.** [AI Custom Slide](#416-ai-custom-slide), [Slide formats](#44-slide-formats),
[The editor](#43-the-editor).

**Keywords.** template, templates, custom slide template, preset, pre-filled slide, add
slide, insert slide, save as template, hero, comparison, timeline, process, grid, stat,
quote, list, layout.

---

### 4.16 AI Custom Slide

**Purpose.** Generate a bespoke slide when none of the standard formats fit.

**When to use.** When none of the other standard formats fit and you want AI to build a
one-off layout from a description.

**How it works.** **AI Custom Slide** is a slide **format** (category **AI**) — one of
the 25 formats — where AI builds a custom slide layout and content from your prompt.

**Steps.** Add a slide → choose **AI Custom Slide** → provide your prompt/content.

**Configuration options.** Your prompt/content describes what the slide should contain.
Further options: **TBD**.

**Example.** "Create a slide showing our 3 support tiers as coloured cards with a price
and one benefit each."

**Best practices.** Give a clear, specific prompt; review the generated slide before
publishing.

**Common mistakes.** Confusing it with the standard formats — reach for AI Custom Slide
only when the built-in formats don't fit.

**Limitations.** Detailed behaviour and any per-surface caveats: **TBD**.

**Related.** [Slide formats](#44-slide-formats), [Templates](#415-templates).

**Keywords.** custom slide, AI custom slide, AI slide, custom layout, bespoke slide,
generate slide.

---

### 4.17 Background jobs & notifications

**Purpose.** Track long-running actions without blocking your work.

**When to use.** Automatically — any time you start a job that runs in the background
(Translate, or "Use this course" cloning).

**How it works.** Some actions run as **background jobs** — notably **Translate** and
**"Use this course" (clone)**. Progress appears in a **notification bell** in the
header (with an unread count) plus short **toast** messages. You can keep working while
a job runs.

**Steps.** Start a background action (e.g. **Translate**) → watch progress in the
**bell** / toasts → open the result when the job finishes.

**Configuration options.** None — notifications appear automatically.

**Example.** You start translating a course to Japanese; the bell shows progress while
you keep editing another course.

**Best practices.** Let a job finish before starting many more at once; check the bell
if a result doesn't appear immediately.

**Common mistakes.** Assuming a job failed because the page didn't change — background
jobs continue while you work elsewhere; check the bell.

**Limitations.** Notifications are session-based (header bell + 3-second toasts); a full
persistent history is **TBD**.

**Related.** [Translate](#412-translate), [Curated Library](#414-curated-library).

**Keywords.** notification, notifications, bell, toast, background job, progress,
translating, cloning, job status.

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

**Q: How do I insert a ready-made (template) slide?**
A: When adding a slide, **search** or open the **Templates** view in the Add-slide picker,
filter by kind (Hero, Comparison, Timeline, …), and pick one — it inserts a pre-filled
**AI Custom Slide** you can edit. See [4.15](#415-templates).

**Q: Can I save my own template?**
A: Only **super users (admins)** can save new templates. A regular creator can insert
existing templates but won't see a "Save as template" option. See [4.15](#415-templates).

**Q: What is a "Big Play" slide?**
A: It's the module-tree label for a **Big Statement** slide in **video mode** — the
same format, not a separate one. See [4.7](#47-videos).

**Q: How many slide formats are there?**
A: **25** (including AI Custom Slide). See [Appendix A](#appendix-a--slide-format-registry).

**Q: How many languages does Learnbee support?**
A: **16** — English and English (India); 9 Indian languages (Hindi, Bengali, Marathi,
Gujarati, Punjabi, Tamil, Kannada, Malayalam, Telugu); Spanish, French, Portuguese,
German; and Japanese. See [4.2](#42-languages).

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
- **Symptoms:** Export button shows "Packaging… X%" and is disabled.
- **Cause:** Packaging bundles images/audio/video and takes ~30–40 seconds; the
  percentage advances as it works.
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
| **Languages supported** | 16 (English, English (India), 9 Indian languages, Spanish, French, Portuguese, German, Japanese). |
| **Slide formats** | 25 (see [Appendix A](#appendix-a--slide-format-registry)). |
| **Narration voices** | Female or male per course; per-segment override available. |
| **Access code** | 6 characters, unambiguous alphabet. |
| **SCORM** | SCORM **2004 (4th Edition)**; packaging ~30–40 seconds (shows "Packaging… X%"); self-contained zip. |
| **Videos per course** | Up to **6 uploaded video files**. YouTube links are unlimited and don't count. |
| **Video file size** | **25 MB** max per uploaded file (MP4 or WebM). |
| **Title Slide layouts** | **7** shuffleable layouts (with a logo size control). |
| **Flip Cards** | 2–4 cards per slide. |
| **Image handling** | Uploaded/linked images auto-optimised to WebP, max dimension ~1280px. |
| **Image size (From Link)** | Has a maximum size (exact value **TBD**). |
| **PDF size / pages** | **TBD.** |
| **Supported image types** | Common web image formats (exact list **TBD**; output is WebP). |
| **Supported video sources** | Uploaded video file or YouTube link. |
| **Devices / browsers** | Plays on modern desktop and mobile browsers, including mobile-landscape and iOS fullscreen. Exact browser matrix: **TBD**. |
| **Performance** | SCORM packaging is the main wait (~30–40s); narration is generated once by the creator. |

---

## 11. Integrations

| Integration | Purpose | Setup | Requirements | Known limitations |
|---|---|---|---|---|
| **LMS via SCORM 2004** | Deliver courses in an LMS with completion/score tracking. | Export SCORM → upload the `.zip` to the LMS. | An LMS that accepts SCORM 2004. | SCORM 2004 4th Edition; xAPI **TBD**. |
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
- **SCORM is 2004 4th Edition** (xAPI: TBD).
- **Per-course video limit:** 6 uploaded files (25 MB each); YouTube links are
  unlimited and don't count.
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

**August 2026 — recent additions**
- **Auto-advance released to production** — narrated slides/segments can auto-advance;
  six question/PDF formats always wait for the learner.
- **Templates** — insert curated, pre-filled slides from the Add-slide picker (browse
  by category or search by name).
- **AI Custom Slide** — a new AI slide format (**25 formats** total).
- **Narration-length** setting and **course font style** setting.
- **SCORM packaging progress** — export shows a live "Packaging… X%" indicator, and the
  package is **SCORM 2004 4th Edition**.
- **Shareable course link** that reopens the Share panel; **titled-hyperlink** copy and
  fixed **social preview images** for shared links.
- Mobile-landscape and iOS fullscreen playback improvements.

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
- **SCORM:** self-contained packages (images/audio/video bundled), full format
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

There are **25 formats**. Names and categories below match the Add-slide picker.

| # | Format (name) | Internal id | Category | Gated? |
|---|---|---|---|---|
| 1 | Title Slide | `title-slide` | Opening | No |
| 2 | Agenda | `agenda-slide` | Opening | No |
| 3 | Big Statement | `big-statement` | Content | No |
| 4 | Image + Content (Left) | `image-content-left` | Content | No |
| 5 | Image + Content (Right) | `image-content-right` | Content | No |
| 6 | Image + Overlay (Left) | `image-overlay-left` | Content | No |
| 7 | Image + Overlay (Right) | `image-overlay-right` | Content | No |
| 8 | Step by Step | `step-by-step` | Content | Yes |
| 9 | PDF Viewer | `pdf-viewer` | Content | No |
| 10 | Key Points | `key-points` | Interactive | No |
| 11 | Insight Cards | `insight-cards` | Interactive | No |
| 12 | Accordion | `accordion` | Interactive | Yes |
| 13 | Sticky Scroll | `sticky-scroll` | Interactive | Yes |
| 14 | Sticky Slide | `sticky-slide` | Interactive | Yes |
| 15 | Flip Cards | `flip-cards` | Interactive | Yes |
| 16 | Image Explore | `image-explore` | Interactive | Yes |
| 17 | Scenario Challenge | `scenario-challenge` | Interactive | Yes |
| 18 | Quiz / MCQ | `quiz-mcq` | Quiz | Yes |
| 19 | True / False | `true-false` | Quiz | Yes |
| 20 | Fill in the Blanks | `fill-blanks` | Quiz | Yes |
| 21 | Image Match | `image-match` | Quiz | Yes |
| 22 | Side by Side | `comparison-side-by-side` | Comparison | No |
| 23 | Feature Matrix | `comparison-matrix` | Comparison | No |
| 24 | Pros & Cons | `comparison-pros-cons` | Comparison | No |
| 25 | AI Custom Slide | `custom-slide` | AI | No |

- **Video** = the **video mode** of **Big Statement** (not a separate format); labelled
  **"Big Play"** in the module tree.
- **Title Slide** has **7 shuffleable layouts** (Cinematic, Split, Typographic, Centered hero, Text left · image right, Full image · lower scrim, Diagonal split) plus a logo size control.
- **Gated formats (11):** Step by Step, Accordion, Sticky Scroll, Sticky Slide, Flip Cards, Image Explore, Scenario Challenge, Quiz / MCQ, True / False, Fill in the Blanks, Image Match.

### Appendix B — Supported languages

**16 languages total** (the course language is immutable once created).

| Group | Languages |
|---|---|
| English (2) | English, English (India) |
| Indian (9) | Hindi, Bengali, Marathi, Gujarati, Punjabi, Tamil, Kannada, Malayalam, Telugu |
| European (4) | Spanish, French, Portuguese, German |
| East Asian (1) | Japanese |

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
| Slide formats | 25 (incl. AI Custom Slide) |
| Languages | 16 (English, English (India), 9 Indian, Spanish, French, Portuguese, German, Japanese) |
| Access code length | 6 characters (unambiguous alphabet) |
| SCORM version | 2004 (4th Edition) |
| SCORM packaging time | ~30–40 seconds (shows "Packaging… X%") |
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
- Match the user's language where possible.
```
