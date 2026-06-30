"use client";

import { useState } from "react";
import { wizData, wizRightPanel } from "./data";

export default function ProcessSection() {
  const [active, setActive] = useState(0);

  const s = wizData[active];
  const amber = active >= 2 ? " is-amber" : "";
  const leftClass = active >= 2 ? " is-navy" : " is-amber";

  return (
    <section id="philosophy" className="philosophy">
      <div className="container">
        <span className="section-label reveal">THE LEARNBEE PROCESS</span>
        <h2 className="reveal reveal-d1" style={{ whiteSpace: "nowrap", maxWidth: "none" }}>
          Generate it. Then make it yours.
        </h2>
        <p className="section-sub reveal reveal-d2">
          Learnbee hands you a complete course, not just a starting point. Tweak every slide to your
          liking, then export when you think it&apos;s ready.
        </p>

        <div className="wiz-card reveal reveal-d3">
          <div className="wiz-chrome-bar" aria-hidden="true">
            <span className="wiz-dot"></span>
            <span className="wiz-dot"></span>
            <span className="wiz-dot"></span>
          </div>
          <div className="wiz-body">
            <div className="wiz-rail-outer">
              <div className="wiz-steps-row" id="wiz-steps">
                {wizData.map((step, i) => {
                  const ai = i <= 1;
                  const lineL = i === 0 ? "hidden" : i === 2 ? "handoff" : "";
                  const lineR = i === 3 ? "hidden" : i === 1 ? "handoff" : "";
                  const isActive = i === active ? " is-active" : "";
                  const grp = ai ? " is-ai" : " is-you";
                  return (
                    <div
                      key={i}
                      className={`wiz-step${isActive}${grp}`}
                      data-step={i}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => setActive(i)}
                    >
                      <div className="wiz-step-top">
                        <div className={`wiz-line${lineL ? " " + lineL : ""}`}></div>
                        <button className="wiz-circle" aria-label={step.label}>{i + 1}</button>
                        <div className={`wiz-line${lineR ? " " + lineR : ""}`}></div>
                      </div>
                      <span className="wiz-step-label">{step.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="wiz-groups-row">
                <div className="wiz-grp wiz-grp-ai">
                  <div className="wiz-grp-line"></div>
                  <span className="wiz-grp-label">the AI Wizard</span>
                </div>
                <div className="wiz-grp wiz-grp-you">
                  <div className="wiz-grp-line"></div>
                  <span className="wiz-grp-label">your editor, your call</span>
                </div>
              </div>
            </div>

            <div className="wiz-panel" id="wiz-panel">
              <div className={`wiz-panel-left${leftClass}`}>
                <div className="wiz-panel-title">{s.label}</div>
                <div className="wiz-chips">
                  {s.fields.map((f, j) => (
                    <div className="wiz-chip" key={j}>{f}</div>
                  ))}
                </div>
                <p className="wiz-panel-caption">{s.caption}</p>
              </div>
              <div
                className={`wiz-panel-right${amber}`}
                dangerouslySetInnerHTML={{ __html: wizRightPanel(active) }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
