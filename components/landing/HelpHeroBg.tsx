"use client";

import { useEffect, useRef } from "react";

/* Interactive hero background for the Help page — mouse-follow purple glow,
   mirroring the homepage Hero. Renders the grid + glow layers and wires the
   pointer tracking on the parent `.help-hero` section. */
export default function HelpHeroBg() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    const hero = glow?.closest(".help-hero") as HTMLElement | null;
    if (!glow || !hero) return;

    const onMove = (e: MouseEvent) => {
      const r = hero.getBoundingClientRect();
      const x = (((e.clientX - r.left) / r.width) * 100).toFixed(2);
      const y = (((e.clientY - r.top) / r.height) * 100).toFixed(2);
      glow.style.background = `radial-gradient(560px circle at ${x}% ${y}%, rgba(147,51,234,0.24), transparent 70%)`;
    };
    const onLeave = () => {
      // Clear the inline style → reverts to the default CSS top-centre glow.
      glow.style.background = "";
    };

    hero.addEventListener("mousemove", onMove);
    hero.addEventListener("mouseleave", onLeave);
    return () => {
      hero.removeEventListener("mousemove", onMove);
      hero.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <>
      <div className="help-grid" aria-hidden="true" />
      <div className="help-glow" aria-hidden="true" ref={glowRef} />
    </>
  );
}
