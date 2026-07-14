# Learnbee — project context (compact brief)

## What it is
Learnbee is a training content authoring tool that replaces Articulate Rise 360. It turns a document, a topic, or a blank page into an editorial-quality, animated, narrated course — with SCORM export and a shareable online player. The core bet: most corporate training looks like 2005 PowerPoint; Learnbee courses should feel like NYT interactive editorials — alive, readable, memorable.

## Who it's for
L&D teams and corporate trainers who need finished, narrated, multilingual training fast, without instructional-design or production expertise.

## How a course gets made — the AI Wizard (`/wizard`)
Six steps:
1. **Basics** — title, audience, objective, language (14 languages, locked after creation), default voice (F/M)
2. **Content** — paste reference text, upload a reference PDF, or toggle web search
3. **Media** — drag-drop images, videos, and course PDFs (auto-tagged to the course)
4. **Structure** — module count, duration, depth
5. **Quiz** — quiz count, difficulty, distribution
6. **Review** — review, then Generate

AI (Claude) generates the full outline from there; the learner lands in the editor with a complete draft course.

## The editor
Three-zone layout: Module Tree | Canvas | Properties Panel. Autosaves continuously. 24 slide formats across four categories:
- **Narrative** — title slide, agenda slide, big statement
- **Content** — key points, insight cards, image + content, image overlay, PDF viewer, step-by-step, accordion, sticky scroll, sticky slide
- **Comparison** — side-by-side, feature matrix, pros & cons
- **Interactive** — scenario challenge, quiz/MCQ, true/false, flip cards, image explore, image match, fill in the blanks

Video lives as a mode of "big statement" (uploaded file or YouTube embed), not a separate format.

## Narration & voice
AI writes one short narration segment per section, in the course's own language. Voice is routed to OpenAI TTS (English/European) or Sarvam Bulbul v3 (Indian languages) — F/M choice set at course level, overridable per segment. Audio is generated once by the creator and cached, so it's free to replay for every learner afterward.

## Images
Built-in library: Pexels search + the team's own uploaded images, tag-based (one image can belong to many courses). Uploads are auto-optimized to WebP. Most image-bearing formats support "cover" (fills the frame) or "contain" (shows the whole image with a blurred backdrop) display.

## Interactivity
Two control modes a course author can set per slide (or as a course-wide default):
- **Click mode** — on flip-cards, accordion, insight-cards, step-by-step, sticky-scroll, sticky-slide: each click plays one narration segment; "next" is locked until that segment finishes (a "strict-listening" gate)
- **Auto-advance** — after narration ends on a slide, a short countdown auto-advances to the next slide (cancellable)

## Publishing & export
Two ways to get a course in front of learners:
- **SCORM 2004 export** — a self-contained zip (images and audio bundled in) that drops into any LMS — Moodle, Cornerstone, SAP SuccessFactors, etc.
- **Publish & share** — instant hosted link with a 6-character access code, QR code, and embeddable iframe — no LMS required. Republishing reuses the same code/link.

## Brand
Primary purple `#9333EA`, primary amber `#F0A500`, dark navy backgrounds (`#1A1A2E` / `#0F1729`). Wordmark is a loose, handwritten script "learnbee."

## Why teams switch (value pillars)
1. **Hours, not weeks** — blank page to finished course in one sitting
2. **Built to be finished** — interactive formats and quizzes keep learners clicking, not skimming
3. **Professional polish** — AI handles narration and visuals, no production team needed
4. **Any language, any LMS** — 10+ languages, SCORM export, one course works in every market
