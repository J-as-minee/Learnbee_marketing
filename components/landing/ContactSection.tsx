"use client";

import { useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

const EMAIL = "admin@learnbee.ai";
/* What a first conversation covers — the reasons to fill the form in. */
const POINTS = [
  "Personalized walkthrough of Learnbee features",
  "Full onboarding support from day one",
  "Course creation guidance tailored to your team",
];

type Fields = { name: string; email: string; phone: string; company: string; message: string };
const EMPTY: Fields = { name: "", email: "", phone: "", company: "", message: "" };
type Status = "idle" | "sending" | "sent" | "error";

/* Contact page middle section: heading and contact tiles on the left, message
   form on the right. On success the form body stays in the layout (hidden) and
   the success panel overlays it, so the card keeps exactly the same size. */
export default function ContactSection() {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const sent = status === "sent";
  const sending = status === "sending";

  const update = (key: keyof Fields) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, website, page_path: window.location.pathname }),
      });
      if (res.status === 200) {
        setFields(EMPTY);
        setStatus("sent");
        requestAnimationFrame(() => successRef.current?.focus());
        return;
      }
      const body = await res.json().catch(() => null);
      setError(body?.error || `We couldn't send your message. Please try again, or email ${EMAIL}.`);
      setStatus("error");
    } catch {
      setError(`We couldn't reach the server. Check your connection and try again, or email ${EMAIL}.`);
      setStatus("error");
    }
  }

  function sendAnother() {
    setStatus("idle");
    setError(null);
    requestAnimationFrame(() => nameRef.current?.focus());
  }

  return (
    <section className="cs" id="message" aria-labelledby={id("title")}>
      {/* Brand wave from the very top of the page (the floating nav sits over it). The form
          card is allowed to overlap it. Same asset as the About hero. */}
      <div className="cs-wave" aria-hidden="true" />
      <div className="cs-inner">
        <div className="cs-head">
          <h1 id={id("title")} className="cs-title">
            Get in touch with the <br />
            <span>Learnbee</span> team
          </h1>
          <p className="cs-intro">
            Whether you&apos;re evaluating Learnbee or already building courses, we&apos;re here to help. Reach us
            however&apos;s easiest.
          </p>

          <ul className="cs-points">
            {POINTS.map((point) => (
              <li key={point}>
                <span className="cs-point-icon" aria-hidden="true">
                  <Check size={13} strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="cs-form-card">
          <div className={`cs-form-body${sent ? " is-hidden" : ""}`} aria-hidden={sent} inert={sent}>
            <h2 className="cs-form-title">Send us a message</h2>
            <p className="cs-form-sub">We respond within one business day.</p>

            <form onSubmit={onSubmit} noValidate={false}>
              <div className="cs-row">
                <div className="cs-field">
                  <label htmlFor={id("name")}>
                    Full name <span className="cs-req" aria-hidden="true">*</span>
                  </label>
                  <input
                    ref={nameRef}
                    id={id("name")}
                    className="cs-input"
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={120}
                    value={fields.name}
                    onChange={update("name")}
                    placeholder="Your name"
                  />
                </div>
                <div className="cs-field">
                  <label htmlFor={id("email")}>
                    Email <span className="cs-req" aria-hidden="true">*</span>
                  </label>
                  <input
                    id={id("email")}
                    className="cs-input"
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    maxLength={320}
                    value={fields.email}
                    onChange={update("email")}
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div className="cs-row">
                <div className="cs-field">
                  <label htmlFor={id("phone")}>Phone</label>
                  <input
                    id={id("phone")}
                    className="cs-input"
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    maxLength={40}
                    value={fields.phone}
                    onChange={update("phone")}
                    placeholder="+91"
                  />
                </div>
                <div className="cs-field">
                  <label htmlFor={id("company")}>Company</label>
                  <input
                    id={id("company")}
                    className="cs-input"
                    name="company"
                    autoComplete="organization"
                    maxLength={160}
                    value={fields.company}
                    onChange={update("company")}
                    placeholder="Company name"
                  />
                </div>
              </div>

              <div className="cs-field">
                <label htmlFor={id("message")}>
                  Message <span className="cs-req" aria-hidden="true">*</span>
                </label>
                <textarea
                  id={id("message")}
                  className="cs-input"
                  name="message"
                  required
                  maxLength={5000}
                  value={fields.message}
                  onChange={update("message")}
                  placeholder="How can we help?"
                />
              </div>

              {/* Honeypot: hidden from people and assistive tech. */}
              <div className="cs-honeypot" aria-hidden="true">
                <label htmlFor={id("website")}>Website</label>
                <input
                  id={id("website")}
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <button type="submit" className="cs-submit" disabled={sending}>
                {sending ? (
                  <>
                    <Loader2 size={18} className="cs-spin" aria-hidden="true" /> Sending…
                  </>
                ) : (
                  <>
                    Submit your form <ArrowRight size={18} className="cs-arrow" aria-hidden="true" />
                  </>
                )}
              </button>

              <div aria-live="polite">
                {error && (
                  <p className="cs-error" role="alert">
                    {error}
                  </p>
                )}
              </div>
            </form>
          </div>

          {sent && (
            <div className="cs-success" role="status">
              <div className="cs-success-icon" aria-hidden="true">
                <Check size={34} strokeWidth={2.5} />
              </div>
              <h3 ref={successRef} tabIndex={-1}>
                Message received.
              </h3>
              <p>One of our team members will be in touch within one business day.</p>
              <button type="button" className="cs-again" onClick={sendAnother}>
                Send another message <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
