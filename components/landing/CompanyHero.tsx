"use client";

import { useEffect, useRef, type ReactNode } from "react";

/* Dark hero for the company pages (About, Contact). Same language as the Help
   hero: hex pattern, and a purple glow that follows the pointer. */
export default function CompanyHero({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  body: ReactNode;
  children?: ReactNode;
}) {
  const heroRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const glow = glowRef.current;
    if (!hero || !glow) return;
    const rest = "radial-gradient(620px circle at 50% 0%, rgba(147,51,234,0.28), transparent 70%)";
    const onMove = (e: MouseEvent) => {
      const r = hero.getBoundingClientRect();
      const x = (((e.clientX - r.left) / r.width) * 100).toFixed(2);
      const y = (((e.clientY - r.top) / r.height) * 100).toFixed(2);
      glow.style.background = `radial-gradient(560px circle at ${x}% ${y}%, rgba(147,51,234,0.3), transparent 70%)`;
    };
    const onLeave = () => {
      glow.style.background = rest;
    };
    hero.addEventListener("mousemove", onMove);
    hero.addEventListener("mouseleave", onLeave);
    return () => {
      hero.removeEventListener("mousemove", onMove);
      hero.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section className="co-hero" ref={heroRef}>
      <div className="co-grid" aria-hidden="true" />
      <div className="co-glow" aria-hidden="true" ref={glowRef} />
      <div className="co-hero-inner">
        <span className="co-eyebrow reveal">{eyebrow}</span>
        <h1 className="reveal reveal-d1">{title}</h1>
        <p className="co-hero-body reveal reveal-d2">{body}</p>
        {children && <div className="co-hero-actions reveal reveal-d3">{children}</div>}
      </div>
    </section>
  );
}
