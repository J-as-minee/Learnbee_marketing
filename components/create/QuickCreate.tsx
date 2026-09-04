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
const STEPS = ["Basics", "Source", "Review"];
const AUDIENCES = ["New hires", "Managers", "Customers", "Support agents", "Sales team", "Everyone"];

const SOURCES: { type: DraftSourceType; title: string; sub: string; icon: React.JSX.Element }[] = [
  { type: "idea", title: "Just my idea", sub: "We write it from your topic and objective.",
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

function Icon({ children }: { children: React.JSX.Element }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export default function QuickCreate() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  // Basics
  const [topic, setTopic] = useState("");
  const [objective, setObjective] = useState("");
  const [audience, setAudience] = useState("");

  // Source
  const [source, setSource] = useState<DraftSourceType | null>(null);
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

  const go = useCallback((next: number, direction: 1 | -1) => {
    setDir(direction);
    setStep(next);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const canLeaveBasics =
    topic.trim().length > 0 && objective.trim().length > 0 && audience.trim().length > 0;
  const canLeaveSource =
    source === null ||
    (source === "paste" ? pasteText.trim().length > 0 : source === "upload" ? !!file : true);

  function nextFromBasics() {
    if (!canLeaveBasics) return;
    track("basics_completed");
    go(1, 1);
  }
  function nextFromSource() {
    if (!canLeaveSource) return;
    track("source_completed", { source: source ?? "idea" });
    track("review_reached");
    go(2, 1);
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

    const resolved: DraftSourceType = source ?? "idea";

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
    className: "qc-slide",
    style: { ["--qc-enter" as string]: enterAnim } as React.CSSProperties,
  };

  return (
    <div className="qc">
      <div className="qc-shell">
        <header className="qc-head">
          <a className="qc-logo" href="/" aria-label="Learnbee home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Learnbee" />
          </a>
          <a className="qc-login" href={SIGN_IN}>Log in</a>
        </header>

        <main className="qc-stage">
          <h1 className="qc-title">
            <Sparkle />
            Build your course with AI
          </h1>
          <p className="qc-tagline">
            Slides, interactives, and narration — in the language of your learners.
          </p>

          <div className="qc-steps" role="list" aria-label="Progress">
            {STEPS.map((label, i) => (
              <div key={label} style={{ display: "contents" }}>
                {i > 0 && (
                  <span className={`qc-step-sep${i <= step ? " is-filled" : ""}`} aria-hidden="true" />
                )}
                <div role="listitem"
                     className={`qc-step${i === step ? " is-active" : ""}${i < step ? " is-done" : ""}`}
                     aria-current={i === step ? "step" : undefined}>
                  <span className="qc-num" aria-hidden="true">
                    {i < step ? (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                           strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : i + 1}
                  </span>
                  <span className="qc-step-label">{label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* key= forces a remount so the entrance animation replays each slide */}
          <div key={step} {...slideProps}>
            {step === 0 && (
              <>
                <span className="qc-eyebrow">Course basics</span>
                <h2 className="qc-h1">What are we <span className="qc-grad">building?</span></h2>
                <p className="qc-sub">
                  Three things, then we start. The wizard needs all of them.
                </p>

                <div className="qc-field">
                  <input
                    className="qc-input qc-input-lg" value={topic} autoFocus
                    maxLength={DRAFT_LIMITS.topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") nextFromBasics(); }}
                    placeholder="Workplace safety essentials"
                    aria-label="Course title"
                  />
                  <div className="qc-caption">
                    <span>Course title</span>
                    <span className="qc-count">{topic.length}/{DRAFT_LIMITS.topic}</span>
                  </div>
                </div>

                <div className="qc-field">
                  <input
                    className="qc-input" value={objective} maxLength={DRAFT_LIMITS.objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="What should learners be able to do afterwards?"
                    aria-label="Learning objective"
                  />
                  <div className="qc-caption"><span>Learning objective</span></div>
                </div>

                <div className="qc-field">
                  <input
                    className="qc-input" value={audience} maxLength={DRAFT_LIMITS.audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="Who is it for?"
                    aria-label="Audience"
                  />
                  <div className="qc-caption"><span>Audience</span></div>
                  <div className="qc-chips">
                    {AUDIENCES.map((a) => (
                      <button key={a} type="button" className="qc-chip"
                              aria-pressed={audience === a}
                              onClick={() => setAudience(audience === a ? "" : a)}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="qc-actions">
                  <button className="qc-btn qc-btn-primary" onClick={nextFromBasics} disabled={!canLeaveBasics}>
                    Continue
                  </button>
                  {!canLeaveBasics && <span className="qc-note" style={{ margin: 0 }}>All three are needed to continue.</span>}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <span className="qc-eyebrow">Source material</span>
                <h2 className="qc-h1">What should we <span className="qc-grad">build it from?</span></h2>
                <p className="qc-sub">Optional — skip this and we&apos;ll write it from your idea.</p>

                <div className="qc-cards">
                  {SOURCES.map((s) => (
                    <button key={s.type} type="button" className="qc-card"
                            aria-pressed={source === s.type}
                            onClick={() => setSource(source === s.type ? null : s.type)}>
                      <span className="qc-tile"><Icon>{s.icon}</Icon></span>
                      <span>
                        <span className="qc-card-t" style={{ display: "block" }}>{s.title}</span>
                        <span className="qc-card-s">{s.sub}</span>
                      </span>
                    </button>
                  ))}
                </div>

                {source === "paste" && (
                  <div className="qc-field">
                    <textarea
                      className="qc-textarea" value={pasteText} autoFocus maxLength={DRAFT_LIMITS.text}
                      onChange={(e) => setPasteText(e.target.value)}
                      placeholder="Paste notes, a policy, a transcript…"
                      aria-label="Pasted content"
                    />
                    <div className="qc-caption">
                      <span>Your content</span>
                      <span className="qc-count">{pasteText.length}/{DRAFT_LIMITS.text}</span>
                    </div>
                  </div>
                )}

                {source === "upload" && (
                  <div
                    className={`qc-drop${dragging ? " is-over" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files?.[0] ?? null); }}
                  >
                    <p className="qc-drop-t">Drop a file here</p>
                    <p className="qc-drop-s">PDF, DOCX or PPTX · up to 20 MB</p>
                    <label className="qc-file" style={{ cursor: "pointer" }}>
                      Choose a file
                      <input type="file" accept={UPLOAD_ACCEPT} style={{ display: "none" }}
                             onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
                    </label>
                    {file && (
                      <div><span className="qc-file">{file.name}
                        <button type="button" aria-label="Remove file" onClick={() => setFile(null)}>×</button>
                      </span></div>
                    )}
                    {fileMsg && <p className="qc-drop-s" style={{ color: "#B91C1C" }}>{fileMsg}</p>}
                  </div>
                )}

                <div className="qc-actions">
                  <button className="qc-btn qc-btn-primary" onClick={nextFromSource} disabled={!canLeaveSource}>
                    Continue
                  </button>
                  {source === null && <button className="qc-skip" onClick={nextFromSource}>Skip — just my idea</button>}
                  <button className="qc-back" onClick={() => go(0, -1)}>← Back</button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <span className="qc-eyebrow">Review</span>
                <h2 className="qc-h1">Ready to <span className="qc-grad">generate.</span></h2>
                <p className="qc-sub">Everything below carries into the editor.</p>

                <dl className="qc-review">
                  <div className="qc-row"><dt>Topic</dt><dd>{topic}</dd></div>
                  <div className="qc-row"><dt>Objective</dt>
<dd>{objective}</dd></div>
                  <div className="qc-row"><dt>Audience</dt>
<dd>{audience}</dd></div>
                  <div className="qc-row"><dt>Source</dt>
                    <dd>
                      {source === "upload" ? `Upload — ${file?.name ?? "no file"}`
                        : source === "paste" ? `Pasted content — ${pasteText.trim().length} characters`
                        : "Just my idea"}
                    </dd></div>
                </dl>

                <div className="qc-defaults">
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
                  <button className="qc-btn qc-btn-quiet"
                          style={{ padding: "9px 17px", fontSize: "0.855rem", display: "inline-flex", alignItems: "center", gap: 8 }}
                          onClick={() => openGate("customize")}>
                    <Lock /> Customize structure &amp; quiz
                  </button>
                </div>

                <div className="qc-actions" style={{ display: "block" }}>
                  <button className="qc-btn qc-btn-primary qc-btn-block" onClick={() => openGate("generate")}>
                    <Sparkle size={17} /> Generate my course
                  </button>
                  <p className="qc-foot-note">Free account to generate — your draft is saved.</p>
                </div>
                <div className="qc-actions">
                  <button className="qc-back" onClick={() => go(1, -1)}>← Back</button>
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

            <div className="qc-draft-chip">
              <b>{topic || "Untitled course"}</b><span>·</span><span>{audience}</span>
            </div>

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
