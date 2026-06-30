// ── Dropdown menus — click-to-open ──
const dropdownItems = document.querySelectorAll('.has-dropdown');

dropdownItems.forEach(item => {
  const btn = item.querySelector('.nav-btn');
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = item.classList.contains('open');
    dropdownItems.forEach(d => {
      d.classList.remove('open');
      d.querySelector('.nav-btn').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

document.addEventListener('click', () => {
  dropdownItems.forEach(d => {
    d.classList.remove('open');
    d.querySelector('.nav-btn').setAttribute('aria-expanded', 'false');
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    dropdownItems.forEach(d => {
      d.classList.remove('open');
      d.querySelector('.nav-btn').setAttribute('aria-expanded', 'false');
    });
  }
});

// ── Mobile nav toggle ──
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');

navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));

navLinks.querySelectorAll('.dropdown-item').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── Rotating hero word — per-letter animation ──
const rotatingWord = document.getElementById('rotating-word');
const words  = ['interactive', 'impactful',  'impressive', 'inspiring'];
const colors = ['#9333EA',     '#F0A500',     '#0EA5E9',    '#10B981'];
let wordIdx = 0;

function renderWord(el, word, color) {
  el.style.background = color;
  el.innerHTML = [...word].map((ch, i) =>
    `<span class="hero-letter" style="animation-delay:${i * 45}ms">${ch}</span>`
  ).join('');
}

if (rotatingWord) {
  renderWord(rotatingWord, words[0], colors[0]);

  setInterval(() => {
    const letters = [...rotatingWord.querySelectorAll('.hero-letter')];
    letters.forEach((s, i) => {
      s.style.animationDelay = `${i * 30}ms`;
      s.classList.add('out');
    });

    const outDuration = 200 + letters.length * 30;
    setTimeout(() => {
      wordIdx = (wordIdx + 1) % words.length;
      renderWord(rotatingWord, words[wordIdx], colors[wordIdx]);
    }, outDuration);
  }, 2800);
}

// ── Interactive hero grid glow ──
const heroEl   = document.querySelector('.hero');
const heroGlow = document.querySelector('.hero-glow');

if (heroEl && heroGlow) {
  heroEl.addEventListener('mousemove', e => {
    const r = heroEl.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  * 100).toFixed(2);
    const y = ((e.clientY - r.top)  / r.height * 100).toFixed(2);
    heroGlow.style.background =
      `radial-gradient(500px circle at ${x}% ${y}%, rgba(147,51,234,0.22), transparent 70%)`;
  });

  heroEl.addEventListener('mouseleave', () => {
    heroGlow.style.background = 'none';
  });
}

// ── Scroll reveal ──
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Wizard step rail ──
const wizData = [
  { label: 'Basics',    fields: ['Course title', 'Language — English (locked after creation)', 'Default voice · F / M'], caption: "Type a title, pick a voice — the language locks in here and can't be changed later." },
  { label: 'Content',   fields: ['Drop files: DOCX, PPTX, PDF, TXT', 'Search the internet — toggle on/off', 'Or paste text directly'], caption: "Optional. Skip it and the AI builds from scratch — or feed it a deck you already have." },
  { label: 'Media',     fields: ['Course images', 'Course videos — up to 3, 20 MB each', 'Course PDFs — up to 3, 5 MB each'], caption: "Drop in the visuals up front, or add them slide by slide later in the editor." },
  { label: 'Structure', fields: ['Number of modules', 'Duration — 5 to 60 min', 'Depth — overview / standard / deep dive'], caption: "Set the shape: how many modules, how long, how deep." },
  { label: 'Quiz',      fields: ['Number of questions (min. 5 for SCORM)', 'Difficulty — basic / intermediate / advanced', 'Placement — per module / end only'], caption: "Quiz logic and scoring, configured before a single question is written." },
  { label: 'Review',    fields: ['Full settings summary', 'One button: Generate course outline'], caption: "Everything above, recapped on one screen — then the AI takes over." },
  { label: 'Customize', fields: ['Module tree — drag to reorder modules and slides', 'Canvas — edit any of 24 slide formats inline', 'Properties panel — copy, images, narration per slide'], caption: "Every generated slide lands fully editable — rewrite copy, swap images, adjust the voice, before anyone else sees it." },
  { label: 'Export',    fields: ['Publish — access code, QR, share link, embed code', 'SCORM export — LMS-ready .zip, no publish required', 'Republish anytime — same code, same link, updated content'], caption: "Two ways out: a shareable link for anyone, or a SCORM zip for your LMS." },
];

let wizActive = 0;

function wizRightPanel(idx) {
  const panels = [
    /* 0 — Basics */
    `<div class="wrp-lbl">course title</div>
     <div class="wrp-input">Your Course Title</div>
     <div class="wrp-pills">
       <span class="wrp-pill on">F · Female</span>
       <span class="wrp-pill">M · Male</span>
     </div>
     <span class="wrp-pill locked">EN · locked</span>`,

    /* 1 — Content */
    `<div class="wrp-upload">
       <span class="wrp-upload-ico">⬆</span>
       <span class="wrp-upload-lbl">docx · pptx · pdf · txt</span>
     </div>
     <div class="wrp-toggle-row">
       <span class="wrp-toggle-lbl">search the internet</span>
       <span class="wrp-toggle"><span class="wrp-toggle-knob"></span></span>
     </div>`,

    /* 2 — Media */
    `<div class="wrp-media-row"><span class="wrp-media-ico" style="color:#F0A500">▣</span><span class="wrp-media-lbl">course images</span></div>
     <div class="wrp-media-row"><span class="wrp-media-ico" style="color:#9333EA">▶</span><span class="wrp-media-lbl">course videos</span></div>
     <div class="wrp-media-row"><span class="wrp-media-ico" style="color:rgba(255,255,255,0.45)">◧</span><span class="wrp-media-lbl">course PDFs</span></div>`,

    /* 3 — Structure */
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
     </div>`,

    /* 4 — Quiz */
    `<div class="wrp-stepper">
       <span class="wrp-step-btn">−</span>
       <span class="wrp-step-val">5</span>
       <span class="wrp-step-btn">+</span>
       <span class="wrp-step-unit">questions</span>
     </div>
     <div class="wrp-pills">
       <span class="wrp-pill">basic</span>
       <span class="wrp-pill on">intermediate</span>
       <span class="wrp-pill">advanced</span>
     </div>
     <div class="wrp-pills">
       <span class="wrp-pill on">per module</span>
       <span class="wrp-pill">end only</span>
     </div>`,

    /* 5 — Review */
    `<div class="wrp-kv"><span class="wrp-kv-key">title</span><span class="wrp-kv-val">Your Course Title</span></div>
     <div class="wrp-kv"><span class="wrp-kv-key">modules</span><span class="wrp-kv-val">1</span></div>
     <div class="wrp-kv"><span class="wrp-kv-key">duration</span><span class="wrp-kv-val">5 min</span></div>
     <div class="wrp-gen-btn">✨ generate course outline</div>`,

    /* 6 — Customize (amber) */
    `<div class="wrp-editor">
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

    /* 7 — Export (amber) */
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
  return panels[idx] || '';
}

function wizRender() {
  const stepsEl = document.getElementById('wiz-steps');
  const panelEl = document.getElementById('wiz-panel');
  if (!stepsEl || !panelEl) return;

  stepsEl.innerHTML = wizData.map((s, i) => {
    const ai      = i <= 5;
    const lineL   = i === 0 ? 'hidden' : i === 6 ? 'handoff' : '';
    const lineR   = i === 7 ? 'hidden' : i === 5 ? 'handoff' : '';
    const active  = i === wizActive ? ' is-active' : '';
    const grp     = ai ? ' is-ai' : ' is-you';
    return `<div class="wiz-step${active}${grp}" data-step="${i}">
      <div class="wiz-step-top">
        <div class="wiz-line${lineL ? ' ' + lineL : ''}"></div>
        <button class="wiz-circle" data-step="${i}" aria-label="${s.label}">${i + 1}</button>
        <div class="wiz-line${lineR ? ' ' + lineR : ''}"></div>
      </div>
      <span class="wiz-step-label">${s.label}</span>
    </div>`;
  }).join('');

  const s = wizData[wizActive];
  const amber = wizActive >= 6 ? ' is-amber' : '';
  const leftClass = wizActive >= 6 ? ' is-navy' : ' is-amber';
  panelEl.innerHTML = `
    <div class="wiz-panel-left${leftClass}">
      <div class="wiz-panel-title">${s.label}</div>
      <div class="wiz-chips">${s.fields.map(f => `<div class="wiz-chip">${f}</div>`).join('')}</div>
      <p class="wiz-panel-caption">${s.caption}</p>
    </div>
    <div class="wiz-panel-right${amber}">${wizRightPanel(wizActive)}</div>`;

}

wizRender();

// Step nav — hover + click both change the active step.
// Use event delegation on the stable #wiz-steps container so listeners survive
// innerHTML rebuilds inside wizRender.
const wizStepsEl = document.getElementById('wiz-steps');
if (wizStepsEl) {
  wizStepsEl.addEventListener('click', e => {
    const s = e.target.closest('[data-step]');
    if (s) { wizActive = Number(s.dataset.step); wizRender(); }
  });
  wizStepsEl.addEventListener('mouseover', e => {
    const s = e.target.closest('[data-step]');
    if (!s) return;
    const idx = Number(s.dataset.step);
    if (idx !== wizActive) { wizActive = idx; wizRender(); }
  });
}

// ── Feature bento + modal ──
const featData = [
  {
    icon:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/><path d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/><path d="M16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/></svg>`, ic:'#9333EA', ib:'#f3e8ff', tint:'#f5f0ff', size:'lg',
    title:'AI Course Wizard', sub:'Create training in minutes, not months',
    desc:'Tell Learnbee who you\'re training and what the goal is. A 6-step wizard turns a blank page, an uploaded document, or a raw topic into a complete, narrated course — drafted by AI.',
    checks:['Upload DOCX, PPTX, PDF, or paste text','AI drafts modules, slides, and quiz logic','Narration in 14 languages, one click','Review the outline before generating'],
    mock:`<div class="fm-wizard">
      <div class="fmw-steps"><div class="fmw-dot done"></div><div class="fmw-conn"></div><div class="fmw-dot done"></div><div class="fmw-conn"></div><div class="fmw-dot active"></div><div class="fmw-conn"></div><div class="fmw-dot"></div><div class="fmw-conn"></div><div class="fmw-dot"></div><div class="fmw-conn"></div><div class="fmw-dot"></div></div>
      <div class="fmw-field"><div class="fmw-lbl"></div><div class="fmw-inp"></div></div>
      <div class="fmw-field"><div class="fmw-lbl short"></div><div class="fmw-chip">English ▾</div></div>
      <div class="fmw-actions"><div class="fmw-btn">Generate →</div></div>
    </div>`,
  },
  {
    icon:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`, ic:'#F0A500', ib:'#fff3cc', tint:'#fffbeb', size:'lg',
    title:'24 Editorial Slide Formats', sub:'Not templates — editorial-grade layouts',
    desc:'Big Statement, Sticky Scroll, Scenario Challenge, Flip Cards, Accordion and 19 more — every format SSR\'d to SCORM and the public player, pixel-perfect across every surface.',
    checks:['Inline-editable, no separate tool needed','Click-mode gating per format','Cover or contain image modes, per slide','Consistent across editor, /play, and SCORM'],
    mock:`<div class="fm-formats">
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
    icon:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`, ic:'#0ea5e9', ib:'#e0f2fe', tint:'#f0f9ff', size:'sm',
    title:'Built-In Image Library', sub:'Search, upload, reuse — all in one picker',
    desc:'Search Pexels inline, upload your own, or pick from any past course. Every image runs through sharp — WebP, 1280px max, blur-fill thumbnail auto-generated for contain mode.',
    checks:['Pexels search, no separate account needed','Org-scoped library with course tags','Cover and contain display modes','URL import with SSRF guard'],
    mock:`<div class="fm-images">
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
    icon:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`, ic:'#10b981', ib:'#d9fbe8', tint:'#f0fdf6', size:'sm',
    title:'Click-Mode Interactivity', sub:'Learners engage, not just click Next',
    desc:'Flip cards, accordions, and step-by-step slides lock to a strict-listening gate — each element plays its narration before the learner moves on. Works in the editor, /play, and SCORM.',
    checks:['Per-slide flag, course-wide default','Forward nav locked during audio','Back nav always accessible','Works in editor, /play, and SCORM'],
    mock:`<div class="fm-interact">
      <div class="fmi-row active"><span class="fmi-num">1</span><div class="fmi-line"></div><span class="fmi-play">▶</span></div>
      <div class="fmi-row"><span class="fmi-num">2</span><div class="fmi-line w70"></div></div>
      <div class="fmi-row dim"><span class="fmi-num">3</span><div class="fmi-line w50"></div><span class="fmi-lock">🔒</span></div>
    </div>`,
  },
  {
    icon:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10c0 3.866 3.134 7 7 7s7-3.134 7-7"/><line x1="12" y1="19" x2="12" y2="17"/><line x1="9" y1="21" x2="15" y2="21"/></svg>`, ic:'#ec4899', ib:'#fce7f3', tint:'#fdf4f9', size:'sm',
    title:'AI Narration, 14 Languages', sub:'Studio-quality voiceover, one click',
    desc:'Generate voiceover per segment — English, 9 Indian languages, 4 European — male or female voice, set per course or overridden per slide.',
    checks:['OpenAI TTS for English + European','Sarvam Bulbul v3 for Indian languages','Audio cached in IndexedDB','Per-segment gender override'],
    mock:`<div class="fm-narration">
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
    icon:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/></svg>`, ic:'#7c3aed', ib:'#ede9fe', tint:'#f5f0ff', size:'sm',
    title:'Assessments That Auto-Grade', sub:'Gated, scored, and SCORM-ready',
    desc:'Quiz/MCQ, True/False, Fill in the Blanks, Scenario Challenge, Image Match — formats that gate the next slide and report lesson_status + score back to your LMS.',
    checks:['SCORM 1.2 lesson_status + score','Configurable pass mark and min questions','Per-module or end-of-course placement','Basic / intermediate / advanced difficulty'],
    mock:`<div class="fm-quiz">
      <div class="fmq-q">Which formats are gated by default?</div>
      <div class="fmq-opt"><span class="fmq-radio"></span>Title Slide</div>
      <div class="fmq-opt correct"><span class="fmq-radio sel"></span>Quiz / MCQ ✓</div>
      <div class="fmq-opt"><span class="fmq-radio"></span>Big Statement</div>
      <div class="fmq-score">Score: 1 / 1 — Passed ✓</div>
    </div>`,
  },
  {
    icon:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`, ic:'#22c55e', ib:'#dcfce7', tint:'#f0fdf4', size:'lg',
    title:'SCORM 1.2 Export', sub:'Self-contained .zip, any LMS',
    desc:'Every export packages images and audio into the zip. Drop it into Moodle, Cornerstone, SAP SuccessFactors, or Docebo — no plugin, no CDN dependency, no vendor lock-in.',
    checks:['Images bundled via sharp pipeline','React components rendered via SSR','lesson_status, score, lesson_location','No publish step required to export'],
    mock:`<div class="fm-scorm">
      <div class="fms-file"><span class="fms-ico">📦</span><div><div class="fms-name">course_export.zip</div><div class="fms-meta">Images + audio bundled</div></div></div>
      <div class="fms-prog"><div class="fms-bar"></div></div>
      <div class="fms-tags"><span>Moodle</span><span>Cornerstone</span><span>SAP SF</span></div>
    </div>`,
  },
  {
    icon:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`, ic:'#f97316', ib:'#ffe4e0', tint:'#fff7f5', size:'lg',
    title:'Publish & Share', sub:'6-char code, QR, embed — live instantly',
    desc:'Hit publish and get an access code, QR, share link, and embed code in one step. Republish anytime — same code, same link, updated content.',
    checks:['No LMS required to share a course','QR code downloads as PNG','Embed code for any website or portal','Republish — same code, updated content'],
    mock:`<div class="fm-publish">
      <div class="fmp-code">GXH26L</div>
      <div class="fmp-hint">share link · embed code · QR</div>
      <div class="fmp-row"><div class="fmp-qr">⊞</div><div class="fmp-links"><div class="fmp-lnk"></div><div class="fmp-lnk s"></div></div></div>
    </div>`,
  },
];

// 12-col grid: row1=[Wizard(6),Formats(6)], row2=[ImgLib(3),Click(3),Narration(6)], row3=[Assess(4),SCORM(4),Publish(4)]
const featureLayout = [
  { col: '1 / 7',  row: '1' },
  { col: '7 / 13', row: '1' },
  { col: '1 / 4',  row: '2' },
  { col: '4 / 7',  row: '2' },
  { col: '7 / 13', row: '2' },
  { col: '1 / 5',  row: '3' },
  { col: '5 / 9',  row: '3' },
  { col: '9 / 13', row: '3' },
];

function renderFeatBento() {
  const bento = document.getElementById('feat-bento');
  if (!bento) return;
  bento.innerHTML = featData.map((f, i) => {
    const l = featureLayout[i];
    return `<div class="feat-card" data-feat="${i}" style="--ft:${f.tint};--fc:${f.ic};--fb:${f.ic}40;grid-column:${l.col};grid-row:${l.row}">
      <button class="feat-expand" data-feat="${i}" aria-label="Expand">↗</button>
      <div class="feat-icon" style="background:linear-gradient(135deg,${f.ib} 0%,${f.ic}33 100%);color:${f.ic}">${f.icon}</div>
      <h3 class="feat-title">${f.title}</h3>
      <p class="feat-sub">${f.sub}</p>
      <div class="feat-mock">${f.mock}</div>
    </div>`;
  }).join('');
  bento.querySelectorAll('[data-feat]').forEach(el => {
    el.addEventListener('click', e => { e.stopPropagation(); openFeat(+el.dataset.feat); });
  });
  bento.querySelectorAll('.feat-card').forEach(el => revealObserver.observe(el));
}

function openFeat(i) {
  const f = featData[i];
  const inner = document.getElementById('feat-modal-inner');
  if (!inner) return;
  inner.innerHTML = `
    <div class="fmod-head">
      <div class="fmod-icon" style="background:linear-gradient(135deg,${f.ib} 0%,${f.ic}33 100%);color:${f.ic}">${f.icon}</div>
      <div class="fmod-head-text">
        <h3 class="fmod-title">${f.title}</h3>
        <p class="fmod-sub">${f.sub}</p>
      </div>
    </div>
    <hr class="fmod-divider">
    <div class="fmod-illus" style="--ft:${f.tint}">
      <div class="feat-mock feat-mock-lg">${f.mock}</div>
    </div>
    <p class="fmod-illus-label">Illustrative</p>
    <ul class="fmod-bullets">
      ${f.checks.map(c => `<li style="--fc:${f.ic}">${c}</li>`).join('')}
    </ul>
    <a href="https://creator.learnbee.ai/sign-in" class="btn btn-accent fmod-cta">Get Started</a>`;
  const ov = document.getElementById('feat-overlay');
  ov.classList.add('open'); ov.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
}

function closeFeat() {
  const ov = document.getElementById('feat-overlay');
  if (!ov) return;
  ov.classList.remove('open'); ov.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}

renderFeatBento();
document.getElementById('feat-close')?.addEventListener('click', closeFeat);
document.getElementById('feat-overlay')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeFeat(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeFeat(); });

// ── Stat counters — scroll-triggered, ease-out cubic ──
function animateCount(el, target, duration) {
  const startTime = performance.now();
  const tick = timestamp => {
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  requestAnimationFrame(tick);
}

const statEls = document.querySelectorAll('.stat-num[data-target]');
let statsAnimated = false;

const statsObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !statsAnimated) {
    statsAnimated = true;
    statEls.forEach(el => animateCount(el, parseInt(el.dataset.target, 10), 1400));
    statsObserver.disconnect();
  }
}, { threshold: 0.3 });

const proofSection = document.getElementById('proof');
if (proofSection) statsObserver.observe(proofSection);

// ── FAQ section ──
const faqData = [
  {
    q: 'Do I need instructional-design experience?',
    a: "No — the wizard turns a title, audience, and objective into a structured course; you're editing and approving, not building from scratch.",
  },
  {
    q: "What if I don't have source content yet?",
    a: "Skip it — the AI can generate from just your topic and objective, or you can paste text, upload a doc/PDF, or let it search the web.",
  },
  {
    q: 'Can I rewrite or restructure what it generates?',
    a: 'Yes, all of it — copy, images, narration, slide order, and format choice are editable per slide.',
  },
  {
    q: 'If I update a course after publishing, do learners see the change?',
    a: 'Yes on the share-link version — republishing reuses the same code/link. SCORM packages already loaded into an LMS would need re-export and re-upload.',
  },
  {
    q: 'Can I share a course without an LMS?',
    a: 'Yes — a public link/access code (with QR and embed code), no learner login required.',
  },
];

function renderFaqList() {
  const list = document.getElementById('faq-list');
  if (!list) return;
  list.innerHTML = faqData.map((item, i) => `<div class="faq-item" data-faq="${i}">
    <div class="faq-q">
      <span>${item.q}</span>
      <span class="faq-arrow">→</span>
    </div>
    <div class="faq-a">${item.a}</div>
  </div>`).join('');
}

renderFaqList();

// ── Value section — four outcome cards ──
const valueCards = [
  {
    icon: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    title: 'Hours, not weeks',
    desc: 'From a blank page to a finished course in one sitting',
    tags: ['AI Assist', 'Knowledge Base'],
    details: ['Create slides with AI Assist', 'Pulls structure straight from your content'],
  },
  {
    icon: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    title: 'Built to be finished',
    desc: 'Interactive formats keep learners clicking, not skimming',
    tags: ['24 Formats', 'Quizzes'],
    details: ['Formats matched to the content, not generic templates', 'Quizzes and interactive checks built in'],
  },
  {
    icon: '<rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10c0 3.866 3.134 7 7 7s7-3.134 7-7"/><line x1="12" y1="19" x2="12" y2="17"/><line x1="9" y1="21" x2="15" y2="21"/>',
    title: 'Professional polish',
    desc: 'AI handles narration and visuals — skip the voice actor and the design team',
    tags: ['AI Narration', 'Image Library'],
    details: ['AI narration and voiceover, no recording booth', 'Add product shots or pull from the shared image library'],
  },
  {
    icon: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    title: 'Any language, any LMS',
    desc: 'One course, every market, no rebuild required',
    tags: ['10+ Languages', 'SCORM Export'],
    details: ['Export to SCORM — works in any LMS', 'Translate to 10+ languages without re-authoring'],
  },
];

function valSvg(path, sz = 16) {
  return `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

const valCheck = '<polyline points="20 6 9 17 4 12"/>';

function renderValueGrid() {
  const grid = document.getElementById('value-grid');
  if (!grid) return;
  grid.innerHTML = valueCards.map((c, i) => `<div class="value-card reveal" data-val="${i}" style="transition-delay:${i * 0.1}s">
    <div class="value-card-inner">
      <div class="value-card-front">
        <div class="value-card-top">
          <span class="value-card-icon">${valSvg(c.icon, 18)}</span>
          <span class="value-card-flip-hint">hover to flip</span>
        </div>
        <div class="value-card-title">${c.title}</div>
        <div class="value-card-desc">${c.desc}</div>
        <div class="value-card-tag-row">
          ${c.tags.map(t => `<span class="value-tag-pill">${t}</span>`).join('')}
        </div>
      </div>
      <div class="value-card-back">
        <div class="value-back-title">${c.title}</div>
        <div class="value-card-detail-inner">
          ${c.details.map(d => `<div class="value-detail-row">
            <span class="value-detail-icon">${valSvg(valCheck, 13)}</span>
            <span>${d}</span>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </div>`).join('');
  grid.querySelectorAll('.value-card.reveal').forEach(el => revealObserver.observe(el));
}

renderValueGrid();

// ── Background morph on scroll ────────────────────────────────────
(function () {
  const morph = document.getElementById('bg-morph');
  if (!morph) return;

  const DEFS = [
    { sel: '.hero',          rgb: [15, 23, 41]    },  // --dark   #0F1729
    { sel: '.demo-section',  rgb: [248, 247, 251] },  // --bg-muted
    { sel: '.value-section', rgb: [15, 23, 41]    },  // --dark
    { sel: '#philosophy',    rgb: [248, 247, 251] },  // --bg-muted
    { sel: '.features',      rgb: [248, 247, 251] },  // --bg-muted
    { sel: '#faq',           rgb: [248, 247, 251] },  // --bg-muted
  ];

  const secs = DEFS
    .map(d => ({ rgb: d.rgb, el: document.querySelector(d.sel) }))
    .filter(s => s.el);

  function lerp(a, b, t) { return Math.round(a + (b - a) * t); }

  function update() {
    const scrollY = window.scrollY;
    const focal   = scrollY + window.innerHeight * 0.45;

    const pts = secs.map(s => ({
      rgb: s.rgb,
      top: s.el.getBoundingClientRect().top + scrollY,
    }));

    let idx = 0;
    for (let i = 0; i < pts.length; i++) {
      if (focal >= pts[i].top) idx = i;
    }

    const cur  = pts[idx];
    const nxt  = pts[idx + 1];
    // Blend only at hero→demo boundary; all other transitions snap instantly
    const ZONE = idx === 0 ? 220 : 0;

    let r, g, b;
    if (!nxt || !ZONE || focal < nxt.top - ZONE) {
      [r, g, b] = cur.rgb;
    } else if (focal > nxt.top + ZONE) {
      [r, g, b] = nxt.rgb;
    } else {
      const t = (focal - (nxt.top - ZONE)) / (ZONE * 2);
      r = lerp(cur.rgb[0], nxt.rgb[0], t);
      g = lerp(cur.rgb[1], nxt.rgb[1], t);
      b = lerp(cur.rgb[2], nxt.rgb[2], t);
    }

    morph.style.backgroundColor = `rgb(${r},${g},${b})`;
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}());
