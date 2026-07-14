"use client";

import { useEffect, useRef } from "react";
import { ROTATING_WORDS, ROTATING_COLORS } from "./data";

const SIGN_IN = "https://creator.learnbee.ai/sign-in";

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);

  /* Rotating hero word — per-letter animation */
  useEffect(() => {
    const el = wordRef.current;
    if (!el) return;
    let wordIdx = 0;
    let outTimer: ReturnType<typeof setTimeout> | undefined;

    function renderWord(word: string, color: string) {
      el!.style.background = color;
      el!.innerHTML = [...word]
        .map((ch, i) => `<span class="hero-letter" style="animation-delay:${i * 45}ms">${ch}</span>`)
        .join("");
    }

    renderWord(ROTATING_WORDS[0], ROTATING_COLORS[0]);

    const interval = setInterval(() => {
      const letters = [...el!.querySelectorAll<HTMLElement>(".hero-letter")];
      letters.forEach((s, i) => {
        s.style.animationDelay = `${i * 30}ms`;
        s.classList.add("out");
      });
      const outDuration = 200 + letters.length * 30;
      outTimer = setTimeout(() => {
        wordIdx = (wordIdx + 1) % ROTATING_WORDS.length;
        renderWord(ROTATING_WORDS[wordIdx], ROTATING_COLORS[wordIdx]);
      }, outDuration);
    }, 2800);

    return () => {
      clearInterval(interval);
      if (outTimer) clearTimeout(outTimer);
    };
  }, []);

  /* Interactive hero grid glow */
  useEffect(() => {
    const hero = heroRef.current;
    const glow = glowRef.current;
    if (!hero || !glow) return;

    const onMove = (e: MouseEvent) => {
      const r = hero.getBoundingClientRect();
      const x = (((e.clientX - r.left) / r.width) * 100).toFixed(2);
      const y = (((e.clientY - r.top) / r.height) * 100).toFixed(2);
      glow.style.background = `radial-gradient(500px circle at ${x}% ${y}%, rgba(147,51,234,0.22), transparent 70%)`;
    };
    const onLeave = () => {
      glow.style.background = "none";
    };

    hero.addEventListener("mousemove", onMove);
    hero.addEventListener("mouseleave", onLeave);
    return () => {
      hero.removeEventListener("mousemove", onMove);
      hero.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section className="hero" ref={heroRef}>
      <div className="hero-grid" aria-hidden="true"></div>
      <div className="hero-glow" aria-hidden="true" ref={glowRef}></div>
      <div className="container hero-inner">
        <span className="section-label on-dark reveal">BUILT FOR L&amp;D TEAMS</span>
        <h1 className="reveal reveal-d1">
          Create <span className="hero-pill" id="rotating-word" ref={wordRef}>interactive</span> training effortlessly.
        </h1>
        <p className="reveal reveal-d2">
          Most platforms stop at generating slides. Learnbee turns a document or topic into a
          narrated course — in any of 12+ languages — then exports it anywhere, no LMS required.
        </p>
        <div className="hero-actions reveal reveal-d3">
          <a href={SIGN_IN} className="btn btn-white btn-lg">Get Started for Free</a>
          <a href="#philosophy" className="btn btn-outline-light btn-lg">See How It Works</a>
        </div>
      </div>
    </section>
  );
}
