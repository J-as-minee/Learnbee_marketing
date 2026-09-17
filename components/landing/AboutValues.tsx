"use client";

import { useEffect, useRef, useState } from "react";
import { MousePointerClick, Scale, Handshake, Lightbulb } from "lucide-react";

/* Bsharp's four core values, as published on bsharpcorp.com/about-us. */
const VALUES = [
  {
    title: "Action",
    color: "#159a6b",
    tint: "#dcf5ea",
    icon: <MousePointerClick size={24} strokeWidth={2} />,
    body:
      "We believe in rapid iteration and learning through doing. We encourage the team to test possibilities openly, even when they may not translate directly into immediate commercial offerings.",
  },
  {
    title: "Ethics",
    color: "#9333ea",
    tint: "#ede9fe",
    icon: <Scale size={24} strokeWidth={2} />,
    body:
      "We act with integrity in all our interactions. For our customers, this also means taking responsibility for how we use technology and AI, with a strong focus on privacy, security, and responsible AI practices.",
  },
  {
    title: "Customer success",
    color: "#1d6fb8",
    tint: "#dbeafe",
    icon: <Handshake size={24} strokeWidth={2} />,
    body:
      "We take the time to understand the business metrics that matter to our customers. We work continuously on enhancements that help accelerate and improve those outcomes.",
  },
  {
    title: "Curiosity",
    color: "#e08700",
    tint: "#fdf0cf",
    icon: <Lightbulb size={24} strokeWidth={2} />,
    body:
      "We actively scan emerging ideas and technologies to understand their impact. We build and experiment with prototypes to learn, validate, and deepen our understanding.",
  },
];

/**
 * The cards travel sideways while the section is pinned: scrolling down through
 * the section's extra height moves the track from 0 to `maxShift`. The pin then
 * releases and the page scrolls on normally.
 *
 * This runs at every width, phones included. Where the travel ends depends on
 * how much fits: it centres the largest trailing group of cards — three, then
 * two, then one — that fits the stage. Desktop finishes on the last three;
 * a phone finishes with the last card centred.
 */
export default function AboutValues() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);
  const maxShiftRef = useRef(0);

  useEffect(() => {
    /* How far the track may travel. Distances between elements inside the track
       don't change as the track is translated, so this only needs recomputing
       when the layout itself changes. Rect deltas rather than offsetLeft, for the
       same reason — they stay right whatever the current transform is. */
    const measure = () => {
      const stage = stageRef.current;
      const track = trackRef.current;
      if (!stage || !track) return;

      const cards = Array.from(track.querySelectorAll<HTMLElement>(".ab-vcard"));
      if (cards.length === 0) {
        maxShiftRef.current = 0;
        return;
      }
      const trackLeft = track.getBoundingClientRect().left;
      const available = stage.clientWidth;

      for (let k = Math.min(3, cards.length); k >= 1; k--) {
        const group = cards.slice(-k);
        const first = group[0].getBoundingClientRect();
        const last = group[group.length - 1].getBoundingClientRect();
        const width = last.right - first.left;
        // A lone card is always used, even if it's wider than the stage.
        if (width <= available || k === 1) {
          const pad = Math.max(0, (available - width) / 2);
          maxShiftRef.current = Math.max(0, first.left - trackLeft - pad);
          return;
        }
      }
    };

    const update = () => {
      const section = sectionRef.current;
      const stage = stageRef.current;
      if (!section || !stage) return;
      // How far we are through the section's own scroll distance, 0 → 1.
      const travel = section.offsetHeight - stage.clientHeight;
      const passed = window.scrollY - section.offsetTop;
      const progress = travel > 0 ? Math.min(1, Math.max(0, passed / travel)) : 0;
      setShift(maxShiftRef.current * progress);
    };

    const remeasure = () => {
      measure();
      update();
    };

    remeasure();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", remeasure);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", remeasure);
    };
  }, []);

  return (
    /* The section's extra height — the scroll distance the travel consumes — is
       set in company.css, taller on phones where the cards travel further. */
    <section className="ab-values" ref={sectionRef} aria-labelledby="ab-values-title">
      <div className="ab-values-stage" ref={stageRef}>
        <div className="ab-values-head">
          <span className="section-label">Our core values</span>
          <h2 id="ab-values-title">What we believe in</h2>
          <p className="ab-values-sub">
            Scroll through four values — trust and thoughtfulness follow just below.
          </p>
        </div>

        <div
          className="ab-values-track"
          ref={trackRef}
          style={{ transform: `translate3d(${-shift}px, 0, 0)` }}
        >
          {VALUES.map((v) => (
            <article
              key={v.title}
              className="ab-vcard"
              style={{ ["--vc" as string]: v.color, ["--vc-bg" as string]: v.tint }}
            >
              <span className="ab-vicon" aria-hidden="true">{v.icon}</span>
              <h3>{v.title}</h3>
              <p>{v.body}</p>
            </article>
          ))}
        </div>

        <div className="ab-scroll-hint" aria-hidden="true">Scroll</div>
      </div>
    </section>
  );
}
