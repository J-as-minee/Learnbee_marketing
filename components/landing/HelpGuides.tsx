"use client";

import { useEffect, useState } from "react";

interface Guide {
  title: string;
  teaser: string;
  icon: string;
  steps: string[];
}

const ICONS: Record<string, string> = {
  rocket: "M13 2L4.5 13.5H11l-1 8.5L19.5 10H13V2z",
  package:
    "M16.5 9.4L7.55 4.24M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12",
  link: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  globe:
    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
};

function GuideIcon({ icon, size = 20 }: { icon: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[icon]} />
    </svg>
  );
}

const GUIDES: Guide[] = [
  {
    title: "Build your first course",
    teaser: "From a blank page to a narrated course in one sitting.",
    icon: "rocket",
    steps: [
      "Sign in, then click New on the Home screen to launch the 6-step Course Wizard.",
      "Fill in Basics (title, audience, objective, language + voice), add reference content or a topic, upload any media, then set structure and quiz options.",
      "Click Generate — the AI drafts a complete, narrated outline and drops you into the editor.",
      "Refine any of the 24 slide formats inline, tune narration per slide, then preview it as a learner.",
    ],
  },
  {
    title: "Export to your LMS with SCORM",
    teaser: "Package a self-contained course for any LMS.",
    icon: "package",
    steps: [
      "Open the finished course in the editor — you don't need to publish it first.",
      "Click Export SCORM; a Packaging spinner runs ~30–40s while images, audio, and video are bundled into one .zip.",
      "Download the .zip when it's ready — don't click Export again while it's building.",
      "Upload the .zip to your LMS as a SCORM 2004 course. It reports completion, score, session time, and resume location.",
    ],
  },
  {
    title: "Publish & share a course",
    teaser: "Get a link learners can open with no account.",
    icon: "link",
    steps: [
      "Open the Publish dialog from the editor toolbar.",
      "Learnbee generates a 6-character access code, a shareable link, a downloadable QR code, and an embed iframe.",
      "Share the link or code — learners open the course directly, no sign-in required.",
      "Edit and Republish anytime; the same code and link update in place with your new content.",
    ],
  },
  {
    title: "Translate to another language",
    teaser: "Reach a new audience without re-authoring.",
    icon: "globe",
    steps: [
      "Open the course and choose Translate.",
      "Pick a target language from the 15 supported (English, 9 Indian languages, and 5 others).",
      "Learnbee creates a linked copy in that language, translating both slide text and narration.",
      "The original course stays untouched — the translation is a separate, linked version.",
    ],
  },
];

export default function HelpGuides() {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    document.body.style.overflow = open !== null ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const g = open !== null ? GUIDES[open] : null;

  return (
    <section className="help-guides-section">
      <div className="container">
        <div className="help-guides-header">
          <span className="section-label">QUICK GUIDES</span>
          <h2 className="help-guides-headline">Not sure where to start?</h2>
          <p className="help-guides-sub">
            Pick a common journey and open it for a full, step-by-step walkthrough.
          </p>
        </div>

        <div className="help-guides-grid">
          {GUIDES.map((guide, i) => (
            <button key={guide.title} className="help-guide-card" onClick={() => setOpen(i)}>
              <span className="help-guide-expand" aria-hidden="true">↗</span>
              <span className="help-guide-icon" aria-hidden="true">
                <GuideIcon icon={guide.icon} />
              </span>
              <h3 className="help-guide-title">{guide.title}</h3>
              <p className="help-guide-teaser">{guide.teaser}</p>
              <span className="help-guide-count">{guide.steps.length} steps →</span>
            </button>
          ))}
        </div>
      </div>

      {/* Detail modal — same shell as the homepage feature cards */}
      <div
        className={`feat-overlay${open !== null ? " open" : ""}`}
        aria-hidden={open === null}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(null);
        }}
      >
        <div className="feat-modal" role="dialog" aria-modal="true">
          <div className="feat-handle" />
          <button className="feat-close" aria-label="Close" onClick={() => setOpen(null)}>
            ✕
          </button>
          {g && (
            <div className="help-guide-modal-inner">
              <div className="fmod-head">
                <div className="fmod-icon" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                  <GuideIcon icon={g.icon} size={26} />
                </div>
                <div className="fmod-head-text">
                  <h3 className="fmod-title">{g.title}</h3>
                  <p className="fmod-sub">{g.teaser}</p>
                </div>
              </div>
              <hr className="fmod-divider" />
              <ol className="help-guide-steps">
                {g.steps.map((s, j) => (
                  <li key={j}>{s}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
