"use client";

import { useEffect, useRef } from "react";

const W = 680;
const H = 320;
/* Top of the visible window. The highest crest — the top layer at full hover
   swell — reaches about y=171, so everything above is empty headroom that shows
   up as a gap under the copy. Cropping it off leaves ~10 units of clearance. */
const VIEW_TOP = 160;

/* A filled sine band: baseline at `baseY`, flooded down to the bottom edge. */
function buildPath(amplitude: number, wavelength: number, phase: number, baseY: number) {
  let d = `M0 ${H} L0 ${(baseY + amplitude * Math.sin(phase)).toFixed(1)}`;
  for (let x = 0; x <= W; x += 20) {
    const y = baseY + amplitude * Math.sin(x / wavelength + phase);
    d += ` L${x} ${y.toFixed(1)}`;
  }
  return `${d} L${W} ${H} Z`;
}

const LAYERS = [
  { amp: 14, wavelength: 140, speed: 1.0, offset: 0, baseY: 250, rest: 0.9, hover: 1 },
  { amp: 18, wavelength: 170, speed: 0.75, offset: 1.4, baseY: 220, rest: 0.38, hover: 0.55 },
  { amp: 11, wavelength: 110, speed: 1.15, offset: 2.6, baseY: 190, rest: 0.2, hover: 0.34 },
];

/**
 * Animated brand wave along the bottom of a WaveCta. Hovering the CTA speeds the
 * motion up and swells the amplitude; both eased rather than switched, so it
 * accelerates into the new state.
 *
 * The listeners go on the enclosing section, because this layer is
 * pointer-events:none — it must not intercept clicks meant for the CTA buttons.
 */
export default function PartnerWave() {
  const hostRef = useRef<HTMLDivElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    const paths = pathRefs.current;
    if (paths.some((p) => !p)) return;

    const draw = (amp: number, t: number) => {
      LAYERS.forEach((l, i) => {
        paths[i]!.setAttribute(
          "d",
          buildPath(l.amp * amp, l.wavelength, t * l.speed + l.offset, l.baseY)
        );
      });
    };

    // Reduced motion: one static frame, no loop, no hover response.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) {
      draw(1, 0);
      return;
    }

    let speed = 1;
    let ampMult = 1;
    let targetSpeed = 1;
    let targetAmp = 1;
    let t = 0;
    let frame = 0;

    // Bound to the whole section, not the band this layer now sits in, so
    // hovering the copy or the buttons still drives the wave.
    const card =
      hostRef.current?.closest<HTMLElement>(".cp") ?? hostRef.current?.parentElement ?? null;
    const enter = () => {
      targetSpeed = 3.2;
      targetAmp = 1.7;
      LAYERS.forEach((l, i) => paths[i]!.style.setProperty("opacity", String(l.hover)));
    };
    const leave = () => {
      targetSpeed = 1;
      targetAmp = 1;
      LAYERS.forEach((l, i) => paths[i]!.style.setProperty("opacity", String(l.rest)));
    };
    card?.addEventListener("mouseenter", enter);
    card?.addEventListener("mouseleave", leave);

    const animate = () => {
      speed += (targetSpeed - speed) * 0.04;
      ampMult += (targetAmp - ampMult) * 0.04;
      t += 0.0035 * speed;
      draw(ampMult, t);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      card?.removeEventListener("mouseenter", enter);
      card?.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <div className="cp-wave" ref={hostRef} aria-hidden="true">
      <svg viewBox={`0 ${VIEW_TOP} ${W} ${H - VIEW_TOP}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="cpw1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ede9fe" />
            <stop offset="100%" stopColor="#fdecc8" />
          </linearGradient>
          <linearGradient id="cpw2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#F0A500" />
          </linearGradient>
          <linearGradient id="cpw3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#F0A500" />
          </linearGradient>
        </defs>
        {LAYERS.map((l, i) => (
          <path
            key={i}
            ref={(el) => {
              pathRefs.current[i] = el;
            }}
            fill={`url(#cpw${i + 1})`}
            style={{ opacity: l.rest, transition: "opacity 0.6s ease" }}
          />
        ))}
      </svg>
    </div>
  );
}
