"use client";

import { useEffect, useState } from "react";
import { featData, featureLayout, type Feature } from "./data";

function modalInner(f: Feature): string {
  return `
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
      ${f.checks.map((c) => `<li style="--fc:${f.ic}">${c}</li>`).join("")}
    </ul>
    <a href="https://creator.learnbee.ai/sign-in" class="btn btn-accent fmod-cta">Get Started</a>`;
}

export default function FeaturesSection() {
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

  return (
    <section id="features" className="features">
      <div className="container">
        <span className="section-label reveal">PLATFORM FEATURES</span>
        <h2 className="reveal reveal-d1">Built for training that actually gets finished.</h2>
        <p className="section-sub reveal reveal-d2">
          Eight integrated capabilities that work together to close the gap between writing a course
          and shipping one that works.
        </p>
        <div className="feat-bento" id="feat-bento">
          {featData.map((f, i) => {
            const l = featureLayout[i];
            const cardStyle = {
              ["--ft"]: f.tint,
              ["--fc"]: f.ic,
              ["--fb"]: f.ic + "40",
              gridColumn: l.col,
              gridRow: l.row,
            } as React.CSSProperties;
            return (
              <div
                key={i}
                className="feat-card"
                data-feat={i}
                style={cardStyle}
                onClick={() => setOpen(i)}
              >
                <button
                  className="feat-expand"
                  aria-label="Expand"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(i);
                  }}
                >
                  ↗
                </button>
                <div
                  className="feat-icon"
                  style={{
                    background: `linear-gradient(135deg,${f.ib} 0%,${f.ic}33 100%)`,
                    color: f.ic,
                  }}
                  dangerouslySetInnerHTML={{ __html: f.icon }}
                />
                <h3 className="feat-title">{f.title}</h3>
                <p className="feat-sub">{f.sub}</p>
                <div className="feat-mock" dangerouslySetInnerHTML={{ __html: f.mock }} />
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={`feat-overlay${open !== null ? " open" : ""}`}
        id="feat-overlay"
        aria-hidden={open === null}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(null);
        }}
      >
        <div className="feat-modal" id="feat-modal" role="dialog" aria-modal="true">
          <div className="feat-handle"></div>
          <button className="feat-close" id="feat-close" aria-label="Close" onClick={() => setOpen(null)}>
            ✕
          </button>
          <div
            id="feat-modal-inner"
            dangerouslySetInnerHTML={{ __html: open !== null ? modalInner(featData[open]) : "" }}
          />
        </div>
      </div>
    </section>
  );
}
