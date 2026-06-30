/* Landing-page data — ported verbatim from the original experiment.js.
   HTML/SVG fragments are kept as strings and rendered via dangerouslySetInnerHTML
   so the markup (and therefore the CSS hooks) stays pixel-identical. */

/* ── Rotating hero word ── */
export const ROTATING_WORDS = ["interactive", "impactful", "impressive", "inspiring"];
export const ROTATING_COLORS = ["#9333EA", "#F0A500", "#0EA5E9", "#10B981"];

/* ── Process wizard (4 steps) ── */
export interface WizStep {
  label: string;
  fields: string[];
  caption: string;
}

export const wizData: WizStep[] = [
  { label: "Brief",     fields: ["Course title · language · default voice", "Drop files — DOCX, PPTX, PDF, TXT", "Search the web or paste text — optional"], caption: "Name it, pick a voice and language, then feed it a document or topic — or let the AI build from scratch." },
  { label: "Blueprint", fields: ["Course images, videos & PDFs", "Modules · duration · depth", "Quiz — questions, difficulty, placement"], caption: "Set the shape — visuals, how many modules, how long, how deep, and the quiz logic — before a single word is written." },
  { label: "Customize", fields: ["Generate the full outline in one click", "Edit any of 24 slide formats inline", "Tune copy, images & narration per slide"], caption: "The AI hands you a complete, narrated course — every slide fully editable before anyone else sees it." },
  { label: "Share",     fields: ["Publish — access code, QR, share link, embed", "SCORM export — LMS-ready .zip", "Republish anytime — same link, updated content"], caption: "Two ways out: a shareable link for anyone, or a SCORM zip for your LMS." },
];

export function wizRightPanel(idx: number): string {
  const panels = [
    /* 0 — Brief */
    `<div class="wrp-lbl">course title</div>
     <div class="wrp-input">Your Course Title</div>
     <div class="wrp-pills">
       <span class="wrp-pill on">F · Female</span>
       <span class="wrp-pill">M · Male</span>
       <span class="wrp-pill locked">EN · locked</span>
     </div>
     <div class="wrp-upload">
       <span class="wrp-upload-ico">⬆</span>
       <span class="wrp-upload-lbl">docx · pptx · pdf · txt</span>
     </div>`,
    /* 1 — Blueprint */
    `<div class="wrp-stepper">
       <span class="wrp-step-btn">−</span>
       <span class="wrp-step-val">1</span>
       <span class="wrp-step-btn">+</span>
       <span class="wrp-step-unit">module</span>
     </div>
     <div class="wrp-pills">
       <span class="wrp-pill on">5 min</span>
       <span class="wrp-pill">15 min</span>
       <span class="wrp-pill">60 min</span>
     </div>
     <div class="wrp-pills">
       <span class="wrp-pill">overview</span>
       <span class="wrp-pill on">standard</span>
       <span class="wrp-pill">deep dive</span>
     </div>
     <div class="wrp-pills">
       <span class="wrp-pill on">5 questions</span>
       <span class="wrp-pill">intermediate</span>
       <span class="wrp-pill">per module</span>
     </div>`,
    /* 2 — Customize */
    `<div class="wrp-gen-btn">✨ generate course outline</div>
     <div class="wrp-editor">
       <div class="wrp-ed-tree">
         <div class="wrp-slide-row active">title slide</div>
         <div class="wrp-slide-row">key points</div>
         <div class="wrp-slide-row">quiz</div>
       </div>
       <div class="wrp-ed-canvas">
         <div class="wrp-canvas-card">
           <div class="wrp-canvas-h"></div>
           <div class="wrp-canvas-b"></div>
           <div class="wrp-canvas-b w60"></div>
         </div>
       </div>
       <div class="wrp-ed-props">
         <div class="wrp-prop-bar"></div>
         <div class="wrp-prop-bar"></div>
         <div class="wrp-narr-chip">🎙 narration</div>
       </div>
     </div>`,
    /* 3 — Share */
    `<div class="wrp-export-lbl">share &amp; export</div>
     <div class="wrp-export-row">
       <span class="wrp-export-ico">🌐</span>
       <span class="wrp-export-row-lbl">publish to get a link</span>
     </div>
     <div class="wrp-export-row">
       <span class="wrp-export-ico">⬇</span>
       <span class="wrp-export-row-lbl">export SCORM</span>
     </div>`,
  ];
  return panels[idx] || "";
}

/* ── Feature bento + modal ── */
export interface Feature {
  icon: string;
  ic: string;
  ib: string;
  tint: string;
  size: string;
  title: string;
  sub: string;
  desc: string;
  checks: string[];
  mock: string;
}

export const featData: Feature[] = [
  {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/><path d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/><path d="M16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/></svg>`, ic: "#9333EA", ib: "#f3e8ff", tint: "#f5f0ff", size: "lg",
    title: "AI Course Wizard", sub: "Create training in minutes, not months",
    desc: "Tell Learnbee who you're training and what the goal is. A 6-step wizard turns a blank page, an uploaded document, or a raw topic into a complete, narrated course — drafted by AI.",
    checks: ["Upload DOCX, PPTX, PDF, or paste text", "AI drafts modules, slides, and quiz logic", "Narration in 14 languages, one click", "Review the outline before generating"],
    mock: `<div class="fm-wizard">
      <div class="fmw-steps"><div class="fmw-dot done"></div><div class="fmw-conn"></div><div class="fmw-dot done"></div><div class="fmw-conn"></div><div class="fmw-dot active"></div><div class="fmw-conn"></div><div class="fmw-dot"></div><div class="fmw-conn"></div><div class="fmw-dot"></div><div class="fmw-conn"></div><div class="fmw-dot"></div></div>
      <div class="fmw-field"><div class="fmw-lbl"></div><div class="fmw-inp"></div></div>
      <div class="fmw-field"><div class="fmw-lbl short"></div><div class="fmw-chip">English ▾</div></div>
      <div class="fmw-actions"><div class="fmw-btn">Generate →</div></div>
    </div>`,
  },
  {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`, ic: "#F0A500", ib: "#fff3cc", tint: "#fffbeb", size: "lg",
    title: "24 Editorial Slide Formats", sub: "Not templates — editorial-grade layouts",
    desc: "Big Statement, Sticky Scroll, Scenario Challenge, Flip Cards, Accordion and 19 more — every format SSR'd to SCORM and the public player, pixel-perfect across every surface.",
    checks: ["Inline-editable, no separate tool needed", "Click-mode gating per format", "Cover or contain image modes, per slide", "Consistent across editor, /play, and SCORM"],
    mock: `<div class="fm-formats">
      <div class="fmf-row">
        <div class="fmf-thumb" style="background:#ede9fe"><div class="fmf-tline" style="background:#9333EA"></div><div class="fmf-tbar"></div><div class="fmf-tbar fmf-w60"></div></div>
        <div class="fmf-thumb" style="background:#fef3c7"><div class="fmf-tline" style="background:#F0A500"></div><div class="fmf-tbar"></div><div class="fmf-tbar fmf-w75"></div></div>
        <div class="fmf-thumb" style="background:#fce7f3"><div class="fmf-tline" style="background:#ec4899"></div><div class="fmf-tbar"></div><div class="fmf-tbar fmf-w50"></div></div>
        <div class="fmf-thumb" style="background:#d1fae5"><div class="fmf-tline" style="background:#10b981"></div><div class="fmf-tbar"></div><div class="fmf-tbar fmf-w60"></div></div>
      </div>
      <div class="fmf-chips"><span class="fmf-chip">Sticky Scroll</span><span class="fmf-chip hi">Scenario ✓</span><span class="fmf-chip">Flip Cards</span><span class="fmf-chip">Accordion</span></div>
    </div>`,
  },
  {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`, ic: "#0ea5e9", ib: "#e0f2fe", tint: "#f0f9ff", size: "sm",
    title: "Built-In Image Library", sub: "Search, upload, reuse — all in one picker",
    desc: "Search Pexels inline, upload your own, or pick from any past course. Every image runs through sharp — WebP, 1280px max, blur-fill thumbnail auto-generated for contain mode.",
    checks: ["Pexels search, no separate account needed", "Org-scoped library with course tags", "Cover and contain display modes", "URL import with SSRF guard"],
    mock: `<div class="fm-images">
      <div class="fmimg-tabs"><span class="on">Pexels</span><span>My Library</span><span>Upload</span></div>
      <div class="fmimg-grid">
        <div class="fmimg-photo" style="background:linear-gradient(135deg,#c4b5fd,#a78bfa)"></div>
        <div class="fmimg-photo" style="background:linear-gradient(135deg,#fde68a,#fbbf24)"></div>
        <div class="fmimg-photo" style="background:linear-gradient(135deg,#6ee7b7,#10b981)"></div>
        <div class="fmimg-photo" style="background:linear-gradient(135deg,#bfdbfe,#60a5fa)"></div>
        <div class="fmimg-photo" style="background:linear-gradient(135deg,#fecaca,#f87171)"></div>
        <div class="fmimg-photo fmimg-sel" style="background:linear-gradient(135deg,#ddd6fe,#7c3aed)"><div class="fmimg-chk">✓</div></div>
      </div>
    </div>`,
  },
  {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`, ic: "#10b981", ib: "#d9fbe8", tint: "#f0fdf6", size: "sm",
    title: "Click-Mode Interactivity", sub: "Learners engage, not just click Next",
    desc: "Flip cards, accordions, and step-by-step slides lock to a strict-listening gate — each element plays its narration before the learner moves on. Works in the editor, /play, and SCORM.",
    checks: ["Per-slide flag, course-wide default", "Forward nav locked during audio", "Back nav always accessible", "Works in editor, /play, and SCORM"],
    mock: `<div class="fm-interact">
      <div class="fmi-row active"><span class="fmi-num">1</span><div class="fmi-line"></div><span class="fmi-play">▶</span></div>
      <div class="fmi-row"><span class="fmi-num">2</span><div class="fmi-line w70"></div></div>
      <div class="fmi-row dim"><span class="fmi-num">3</span><div class="fmi-line w50"></div><span class="fmi-lock">🔒</span></div>
    </div>`,
  },
  {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10c0 3.866 3.134 7 7 7s7-3.134 7-7"/><line x1="12" y1="19" x2="12" y2="17"/><line x1="9" y1="21" x2="15" y2="21"/></svg>`, ic: "#ec4899", ib: "#fce7f3", tint: "#fdf4f9", size: "sm",
    title: "AI Narration, 14 Languages", sub: "Studio-quality voiceover, one click",
    desc: "Generate voiceover per segment — English, 9 Indian languages, 4 European — male or female voice, set per course or overridden per slide.",
    checks: ["OpenAI TTS for English + European", "Sarvam Bulbul v3 for Indian languages", "Audio cached in IndexedDB", "Per-segment gender override"],
    mock: `<div class="fm-narration">
      <div class="fmn-lang-grid">
        <span class="fmn-ltag" style="background:#dbeafe;color:#3b82f6">🇬🇧 English</span>
        <span class="fmn-ltag" style="background:#fce7f3;color:#ec4899">🇮🇳 Hindi</span>
        <span class="fmn-ltag" style="background:#ede9fe;color:#9333ea">🇮🇳 Tamil</span>
        <span class="fmn-ltag" style="background:#fef3c7;color:#d97706">🇮🇳 Telugu</span>
        <span class="fmn-ltag" style="background:#dcfce7;color:#16a34a">🇫🇷 French</span>
        <span class="fmn-ltag" style="background:#e0f2fe;color:#0369a1">🇩🇪 German</span>
        <span class="fmn-ltag" style="background:#fee2e2;color:#dc2626">🇪🇸 Spanish</span>
        <span class="fmn-ltag" style="background:#fef9c3;color:#ca8a04">🇮🇳 Bengali</span>
        <span class="fmn-ltag" style="background:#ffe4e0;color:#ea580c">🇮🇳 Kannada</span>
        <span class="fmn-ltag" style="background:#d9fbe8;color:#059669">🇮🇳 Gujarati</span>
        <span class="fmn-ltag" style="background:#fdf4ff;color:#a21caf">🇵🇹 Portuguese</span>
        <span class="fmn-ltag" style="background:#ede9fe;color:#7c3aed">🇮🇳 Marathi</span>
      </div>
      <div class="fmn-wave"><div class="fmn-bar" style="height:6px"></div><div class="fmn-bar" style="height:14px"></div><div class="fmn-bar" style="height:20px"></div><div class="fmn-bar" style="height:10px"></div><div class="fmn-bar" style="height:22px"></div><div class="fmn-bar" style="height:16px"></div><div class="fmn-bar" style="height:8px"></div><div class="fmn-bar" style="height:18px"></div></div>
      <div class="fmn-tag">▶ Narrating…</div>
    </div>`,
  },
  {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/></svg>`, ic: "#7c3aed", ib: "#ede9fe", tint: "#f5f0ff", size: "sm",
    title: "Assessments That Auto-Grade", sub: "Gated, scored, and SCORM-ready",
    desc: "Quiz/MCQ, True/False, Fill in the Blanks, Scenario Challenge, Image Match — formats that gate the next slide and report lesson_status + score back to your LMS.",
    checks: ["SCORM 1.2 lesson_status + score", "Configurable pass mark and min questions", "Per-module or end-of-course placement", "Basic / intermediate / advanced difficulty"],
    mock: `<div class="fm-quiz">
      <div class="fmq-q">Which formats are gated by default?</div>
      <div class="fmq-opt"><span class="fmq-radio"></span>Title Slide</div>
      <div class="fmq-opt correct"><span class="fmq-radio sel"></span>Quiz / MCQ ✓</div>
      <div class="fmq-opt"><span class="fmq-radio"></span>Big Statement</div>
      <div class="fmq-score">Score: 1 / 1 — Passed ✓</div>
    </div>`,
  },
  {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`, ic: "#22c55e", ib: "#dcfce7", tint: "#f0fdf4", size: "lg",
    title: "SCORM 1.2 Export", sub: "Self-contained .zip, any LMS",
    desc: "Every export packages images and audio into the zip. Drop it into Moodle, Cornerstone, SAP SuccessFactors, or Docebo — no plugin, no CDN dependency, no vendor lock-in.",
    checks: ["Images bundled via sharp pipeline", "React components rendered via SSR", "lesson_status, score, lesson_location", "No publish step required to export"],
    mock: `<div class="fm-scorm">
      <div class="fms-file"><span class="fms-ico">📦</span><div><div class="fms-name">course_export.zip</div><div class="fms-meta">Images + audio bundled</div></div></div>
      <div class="fms-prog"><div class="fms-bar"></div></div>
      <div class="fms-tags"><span>Moodle</span><span>Cornerstone</span><span>SAP SF</span></div>
    </div>`,
  },
  {
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`, ic: "#f97316", ib: "#ffe4e0", tint: "#fff7f5", size: "lg",
    title: "Publish & Share", sub: "6-char code, QR, embed — live instantly",
    desc: "Hit publish and get an access code, QR, share link, and embed code in one step. Republish anytime — same code, same link, updated content.",
    checks: ["No LMS required to share a course", "QR code downloads as PNG", "Embed code for any website or portal", "Republish — same code, updated content"],
    mock: `<div class="fm-publish">
      <div class="fmp-code">GXH26L</div>
      <div class="fmp-hint">share link · embed code · QR</div>
      <div class="fmp-row"><div class="fmp-qr">⊞</div><div class="fmp-links"><div class="fmp-lnk"></div><div class="fmp-lnk s"></div></div></div>
    </div>`,
  },
];

// 12-col grid: row1=[Wizard(6),Formats(6)], row2=[ImgLib(3),Click(3),Narration(6)], row3=[Assess(4),SCORM(4),Publish(4)]
export const featureLayout = [
  { col: "1 / 7",  row: "1" },
  { col: "7 / 13", row: "1" },
  { col: "1 / 4",  row: "2" },
  { col: "4 / 7",  row: "2" },
  { col: "7 / 13", row: "2" },
  { col: "1 / 5",  row: "3" },
  { col: "5 / 9",  row: "3" },
  { col: "9 / 13", row: "3" },
];

/* ── FAQ ── */
export const faqData = [
  { q: "Do I need instructional-design experience?", a: "No — the wizard turns a title, audience, and objective into a structured course; you're editing and approving, not building from scratch." },
  { q: "What if I don't have source content yet?", a: "Skip it — the AI can generate from just your topic and objective, or you can paste text, upload a doc/PDF, or let it search the web." },
  { q: "Can I rewrite or restructure what it generates?", a: "Yes, all of it — copy, images, narration, slide order, and format choice are editable per slide." },
  { q: "If I update a course after publishing, do learners see the change?", a: "Yes on the share-link version — republishing reuses the same code/link. SCORM packages already loaded into an LMS would need re-export and re-upload." },
  { q: "Can I share a course without an LMS?", a: "Yes — a public link/access code (with QR and embed code), no learner login required." },
];

/* ── Value cards ── */
export const valueCards = [
  {
    icon: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    title: "Hours, not weeks",
    desc: "From a blank page to a finished course in one sitting",
    tags: ["AI Assist", "Knowledge Base"],
    details: ["Create slides with AI Assist", "Pulls structure straight from your content"],
  },
  {
    icon: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    title: "Built to be finished",
    desc: "Interactive formats keep learners clicking, not skimming",
    tags: ["24 Formats", "Quizzes"],
    details: ["Formats matched to the content, not generic templates", "Quizzes and interactive checks built in"],
  },
  {
    icon: '<rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10c0 3.866 3.134 7 7 7s7-3.134 7-7"/><line x1="12" y1="19" x2="12" y2="17"/><line x1="9" y1="21" x2="15" y2="21"/>',
    title: "Professional polish",
    desc: "AI handles narration and visuals — skip the voice actor and the design team",
    tags: ["AI Narration", "Image Library"],
    details: ["AI narration and voiceover, no recording booth", "Add product shots or pull from the shared image library"],
  },
  {
    icon: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    title: "Any language, any LMS",
    desc: "One course, every market, no rebuild required",
    tags: ["10+ Languages", "SCORM Export"],
    details: ["Export to SCORM — works in any LMS", "Translate to 10+ languages without re-authoring"],
  },
];

export function valSvg(path: string, sz = 16): string {
  return `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

export const valCheck = '<polyline points="20 6 9 17 4 12"/>';
