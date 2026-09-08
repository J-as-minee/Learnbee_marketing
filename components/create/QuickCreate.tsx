"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULTS_DISPLAY, DRAFT_CONTRACT_VERSION, DRAFT_LIMITS, RESUME_STEP, UPLOAD_ACCEPT,
  type DraftPayload, type DraftSourceType, type DraftUtm, type GateReason,
  DraftContractError, DraftError, fileError, getAnonId, handoffUrl,
  postDraft, readUtm,
} from "@/lib/draft";
import { initAnalytics, track } from "@/lib/analytics";

/* Slide transition. Swap for "vertical" or "fade" — keyframes for all three
   live in create.css, so nothing else changes. */
type TransitionKind = "horizontal" | "vertical" | "fade";
const TRANSITION: TransitionKind = "horizontal";
const ENTER: Record<TransitionKind, [string, string]> = {
  horizontal: ["qcInRight", "qcInLeft"],
  vertical: ["qcInUp", "qcInDown"],
  fade: ["qcInFade", "qcInFade"],
};

const SIGN_IN = "https://creator.learnbee.ai/sign-in";

const SOURCES: { type: DraftSourceType; title: string; sub: string; icon: React.JSX.Element }[] = [
  { type: "internet", title: "Internet", sub: "We research the topic as we build.",
    icon: <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z" /> },
  { type: "upload", title: "Upload a file", sub: "PDF, DOCX or PPTX, up to 5 MB.",
    icon: <path d="M12 16V4m0 0L8 8m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /> },
  { type: "paste", title: "Paste content", sub: "Drop in notes, a policy, a transcript.",
    icon: <path d="M9 3h6v3H9zM8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 12h6M9 16h4" /> },
];

function Sparkle({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.6 13.5 8 19 9.5 13.5 11 12 16.4 10.5 11 5 9.5 10.5 8 12 2.6Z" />
      <path d="M18.6 14.4 19.4 17l2.6.8-2.6.8-.8 2.6-.8-2.6L15.2 18l2.6-.8.8-2.8Z" opacity=".65" />
    </svg>
  );
}

function Lock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

/* One line, ellipsis, full text on hover. The tooltip is rendered only when the
   text really is clipped — a bubble that repeats a fully visible value is noise.
   It sits on the wrapper, not the clipped span, whose overflow:hidden would eat
   it. tabIndex on the clipped span gives keyboard users the same reveal. */
function ClipValue({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [clipped, setClipped] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setClipped(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  return (
    <span className="qc-val">
      <span ref={ref} className="qc-clip" tabIndex={clipped ? 0 : undefined}>{text}</span>
      {/* The full string is already in the DOM above, so the bubble is decoration. */}
      {clipped && <span className="qc-tip" aria-hidden="true">{text}</span>}
    </span>
  );
}

function Stroke({ d, size = 17 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
const ArrowRight = () => <Stroke d="M5 12h13m-5-6 6 6-6 6" />;
const ArrowLeft = () => <Stroke d="M19 12H6m5 6-6-6 6-6" />;
const HomeIcon = () => <Stroke d="M3.5 10.5 12 3.5l8.5 7M5.5 9.5V20h13V9.5" />;

function Icon({ children }: { children: React.JSX.Element }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

/**
 * `page` is /create — its own screen, with the site header and a full-viewport
 * wash. `inline` is the section on the home page: no header, no 100svh, and
 * the wash contained to the section rather than fixed over the whole document.
 */
export default function QuickCreate({ variant = "page" }: { variant?: "page" | "inline" }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  // Basics
  const [topic, setTopic] = useState("");
  const [objective, setObjective] = useState("");
  const [audience, setAudience] = useState("");

  // Source
  /* Always one selection — "internet" is what an untouched draft sends. */
  const [source, setSource] = useState<DraftSourceType>("internet");
  const [pasteText, setPasteText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileMsg, setFileMsg] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // Gate + handoff
  const [gate, setGate] = useState<GateReason | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [anonId, setAnonId] = useState("");
  const utmRef = useRef<DraftUtm>({});
  const honeypot = useRef<HTMLInputElement>(null);
  const turnstileToken = useRef<string | null>(null);
  const turnstileBox = useRef<HTMLDivElement>(null);

  /* anonId doubles as the analytics distinct_id and rides through the redirect. */
  useEffect(() => {
    const id = getAnonId();
    setAnonId(id);
    utmRef.current = readUtm();
    initAnalytics(id);
    track("quickcreate_opened");
  }, []);

  /* Turnstile renders inside the gate modal, where the POST actually happens. */
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!gate || !siteKey || !turnstileBox.current) return;
    const w = window as unknown as { turnstile?: { render: (el: HTMLElement, o: object) => void } };
    const render = () => {
      if (!turnstileBox.current || !w.turnstile) return;
      turnstileBox.current.innerHTML = "";
      w.turnstile.render(turnstileBox.current, {
        sitekey: siteKey,
        callback: (t: string) => { turnstileToken.current = t; },
        "error-callback": () => { turnstileToken.current = null; },
        theme: "light",
      });
    };
    if (w.turnstile) { render(); return; }
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = render;
    document.head.appendChild(s);
  }, [gate]);

  /* Inline, jumping the window to the top would throw the visitor back up to
     the hero mid-flow; the section's own top is what they need to see. */
  const go = useCallback((next: number, direction: 1 | -1) => {
    setDir(direction);
    setStep(next);
    if (variant === "page") window.scrollTo({ top: 0, behavior: "auto" });
    else rootRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
  }, [variant]);

  /* A source is a choice, not a default: leaving it unpicked used to fall
     through to "internet" silently at submit time. */
  const sourceReady =
    source === "paste" ? pasteText.trim().length > 0
      : source === "upload" ? !!file
      : source === "internet";
  const canContinue =
    topic.trim().length > 0 &&
    objective.trim().length > 0 &&
    audience.trim().length > 0 &&
    sourceReady;

  function toReview() {
    if (!canContinue) return;
    track("basics_completed");
    track("source_completed", { source });
    track("review_reached");
    go(1, 1);
  }

  function openGate(reason: GateReason) {
    track("gate_shown", { reason });
    setError(null);
    setGate(reason);
  }

  function pickFile(f: File | null) {
    if (!f) return;
    const err = fileError(f);
    if (err) { setFileMsg(err); setFile(null); return; }
    setFileMsg(null);
    setFile(f);
  }

  /* The one backend call the website makes, then straight to the app. */
  async function submit() {
    if (!gate) return;
    // Honeypot: a real person never fills a field they cannot see.
    if (honeypot.current?.value) return;

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (siteKey && !turnstileToken.current) {
      setError("Please complete the verification check just above, then try again.");
      return;
    }

    setBusy(true);
    setError(null);
    track("create_account_clicked", { reason: gate });

    const resolved: DraftSourceType = source;

    try {
      const payload: DraftPayload = {
        version: DRAFT_CONTRACT_VERSION,
        topic: topic.trim().slice(0, DRAFT_LIMITS.topic),
        objective: objective.trim().slice(0, DRAFT_LIMITS.objective),
        audience: audience.trim().slice(0, DRAFT_LIMITS.audience),
        /* No fileRef for uploads — api/draft mints the key from the token it
           generates and refuses one supplied by the caller. */
        source: {
          type: resolved,
          ...(resolved === "paste" ? { text: pasteText.trim().slice(0, DRAFT_LIMITS.text) } : {}),
        },
        /* Not step 1 — they resume where they were gated. */
        resumeStep: RESUME_STEP[gate],
        anonId,
        ...(Object.keys(utmRef.current).length ? { utm: utmRef.current } : {}),
      };

      // postDraft validates against the contract before anything leaves.
      const token = await postDraft(payload, resolved === "upload" ? file : null, turnstileToken.current);
      window.location.href = handoffUrl(token, anonId);
    } catch (e) {
      // Everything the visitor typed is still in state — the retry re-sends it.
      if (e instanceof DraftContractError) {
        setError(`Draft rejected on "${e.field}": ${e.message}`);
      } else {
        setError(e instanceof DraftError ? e.message : "Something went wrong saving your draft.");
      }
      setBusy(false);
    }
  }

  const enterAnim = ENTER[TRANSITION][dir === 1 ? 0 : 1];
  const slideProps = {
    className: `qc-slide${step === 1 ? " qc-slide--review" : ""}`,
    style: { ["--qc-enter" as string]: enterAnim } as React.CSSProperties,
  };

  return (
    <div className={`qc${variant === "inline" ? " qc--inline" : ""}`} ref={rootRef}>
      <div className="qc-shell">
        {/* The home page already has a header; a second logo under it reads as
            a mistake. */}
        {variant === "page" && (
          <header className="qc-head">
            <a className="qc-logo" href="/" aria-label="Learnbee home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Learnbee" />
            </a>
            <a className="qc-login" href={SIGN_IN}>Log in</a>
          </header>
        )}

        <main className="qc-stage">
          {/* key= forces a remount so the entrance animation replays each slide */}
          <div key={step} {...slideProps}>
            {step === 0 && (
              <>
                <span className="qc-eyebrow">Create your first course</span>
                <h2 className="qc-h1">Describe your <span className="qc-grad">course.</span></h2>

                <div className="qc-field">
                  <label className="qc-label" htmlFor="qc-topic">Course title <span className="qc-req" aria-hidden="true">*</span></label>
                  <input
                    id="qc-topic" className="qc-input" value={topic} autoFocus aria-required="true"
                    maxLength={DRAFT_LIMITS.topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Product Onboarding for Sales Reps"
                  />
                </div>

                <div className="qc-field">
                  <label className="qc-label" htmlFor="qc-audience">Target audience <span className="qc-req" aria-hidden="true">*</span></label>
                  <input
                    id="qc-audience" className="qc-input" value={audience} aria-required="true"
                    maxLength={DRAFT_LIMITS.audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="e.g. New sales hires in their first 30 days"
                  />
                </div>

                <div className="qc-field">
                  <label className="qc-label" htmlFor="qc-objective">Learning objective <span className="qc-req" aria-hidden="true">*</span></label>
                  <textarea
                    id="qc-objective" className="qc-textarea" value={objective} aria-required="true"
                    maxLength={DRAFT_LIMITS.objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="e.g. Understand the core value propositions and handle common objections confidently"
                  />
                </div>

                <div className="qc-field qc-field--section">
                  <label className="qc-label">Where should the content come from?</label>
                  <div className="qc-cards">
                    {SOURCES.map((sc) => (
                      <button key={sc.type} type="button" className="qc-card"
                              aria-pressed={source === sc.type}
                              onClick={() => setSource(sc.type)}>
                        <span className="qc-tile"><Icon>{sc.icon}</Icon></span>
                        <span>
                          <span className="qc-card-t">{sc.title}</span>
                          <span className="qc-card-s">{sc.sub}</span>
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* The panel's space is held whether or not one is open, so
                      picking a source never moves the Continue row. */}
                  <div className="qc-source-slot">
                  {source === "paste" && (
                    <textarea
                      className="qc-textarea" style={{ marginTop: 12 }} autoFocus
                      value={pasteText} maxLength={DRAFT_LIMITS.text}
                      onChange={(e) => setPasteText(e.target.value)}
                      placeholder="Paste notes, a policy, a transcript…"
                      aria-label="Pasted content"
                    />
                  )}

                  {source === "upload" && (
                    <div
                      className={`qc-drop${dragging ? " is-over" : ""}`}
                      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files?.[0] ?? null); }}
                    >
                      {file ? (
                        <span className="qc-file">{file.name}
                          <button type="button" aria-label="Remove file" onClick={() => setFile(null)}>×</button>
                        </span>
                      ) : (
                        <label style={{ cursor: "pointer", display: "block" }}>
                          <span className="qc-drop-t">Drop a file or click to upload</span>
                          <span className="qc-drop-s">PDF · DOCX · PPTX — up to 5 MB</span>
                          <input type="file" accept={UPLOAD_ACCEPT} style={{ display: "none" }}
                                 onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
                        </label>
                      )}
                      {fileMsg && <p className="qc-drop-s" style={{ color: "#B91C1C" }}>{fileMsg}</p>}
                    </div>
                  )}
                  </div>
                </div>

                <div className="qc-actions">
                  {/* Inline, "Home" points at the page you are already on. */}
                  {variant === "page"
                    ? <a className="qc-ghost" href="/"><HomeIcon /> Home</a>
                    : <span />}
                  {/* A disabled button with no reason is a dead end. */}
                  {!canContinue && (
                    <span className="qc-note">
                      {!topic.trim() || !audience.trim() || !objective.trim()
                        ? "Title, audience and objective are all needed."
                        : source === "paste" ? "Paste your content to continue."
                        : "Add a file to continue."}
                    </span>
                  )}
                  <button className="qc-btn qc-btn-solid" onClick={toReview} disabled={!canContinue}>
                    Continue <ArrowRight />
                  </button>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <span className="qc-eyebrow">Review</span>
                <h2 className="qc-h1">Ready to <span className="qc-grad">generate.</span></h2>

                <div className="qc-panel qc-panel--rows">
                  <dl className="qc-review">
                    <div className="qc-row"><dt>Title</dt><dd><ClipValue text={topic} /></dd></div>
                    <div className="qc-row"><dt>Objective</dt><dd><ClipValue text={objective} /></dd></div>
                    <div className="qc-row"><dt>Audience</dt><dd><ClipValue text={audience} /></dd></div>
                    <div className="qc-row"><dt>Language</dt><dd><ClipValue text="English" /></dd></div>
                    <div className="qc-row"><dt>Source</dt>
                      <dd>
                        <ClipValue text={
                          source === "upload" ? file?.name ?? "Upload"
                            : source === "paste" ? `Pasted content · ${pasteText.trim().length} characters`
                            : "Internet"
                        } />
                      </dd></div>
                  </dl>
                </div>

                {/* Its own card, not five more rows in the panel above: these are
                    settings the visitor never chose, and burying them among the
                    ones they did made the panel hard to read. */}
                <div className="qc-panel qc-defaults">
                  <div className="qc-defaults-h">
                    <span className="qc-defaults-t">Structure &amp; quiz</span>
                    <span className="qc-pill"><Sparkle size={12} /> Smart defaults</span>
                  </div>
                  <div className="qc-def-grid">
                    {DEFAULTS_DISPLAY.map(([k, v]) => (
                      <div key={k}>
                        <div className="qc-def-k">{k}</div>
                        <div className="qc-def-v">{v}</div>
                      </div>
                    ))}
                  </div>
                  <button className="qc-unlock" onClick={() => openGate("customize")}>
                    <span className="qc-unlock-ico"><Lock /></span>
                    Customize structure &amp; quiz
                    <span className="qc-unlock-arrow" aria-hidden="true">→</span>
                  </button>
                </div>

                {/* Same row shape as step 1, so the pair never shifts between steps. */}
                <div className="qc-actions">
                  <button className="qc-ghost" onClick={() => go(0, -1)}>
                    <ArrowLeft /> Back
                  </button>
                  <button className="qc-btn qc-btn-primary" onClick={() => openGate("generate")}>
                    <Sparkle size={17} /> Generate my course <ArrowRight />
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {gate && (
        <div className="qc-scrim" role="dialog" aria-modal="true" aria-labelledby="qc-gate-h"
             onClick={(e) => { if (e.target === e.currentTarget && !busy) setGate(null); }}>
          <div className="qc-modal">
            <span className="qc-saved">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Draft saved
            </span>

            {gate === "generate" ? (
              <>
                <h2 id="qc-gate-h">Almost there.</h2>
                <p>Create an account to generate your course — your draft&apos;s saved, so nothing you&apos;ve entered is lost.</p>
              </>
            ) : (
              <>
                <h2 id="qc-gate-h">Fine-tune it with an account.</h2>
                <p>We&apos;ll open the editor with everything you&apos;ve entered, ready to adjust.</p>
              </>
            )}

            {/* Verification runs before the draft is posted. */}
            <div ref={turnstileBox} style={{ marginBottom: 14 }} />

            {/* Honeypot — hidden from people and assistive tech alike. */}
            <input ref={honeypot} className="qc-hp" tabIndex={-1} autoComplete="off"
                   aria-hidden="true" name="company_website" />

            <button className="qc-btn qc-btn-primary" onClick={submit} disabled={busy}>
              {busy ? <><span className="qc-spinner" />Saving your draft…</> : "Create your account"}
            </button>

            {error && (
              <div className="qc-error" role="alert">
                <span>
                  {error}{" "}
                  <button
                    type="button"
                    onClick={submit}
                    disabled={busy}
                    style={{ all: "unset", cursor: "pointer", fontWeight: 700, textDecoration: "underline" }}
                  >
                    Try again
                  </button>
                </span>
              </div>
            )}

            <p className="qc-signin">
              Already have one?{" "}
              <button onClick={submit} disabled={busy}>Sign in</button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
