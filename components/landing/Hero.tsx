"use client";

import { useEffect, useRef } from "react";
import { ROTATING_WORDS, ROTATING_COLORS } from "./data";
import {
  ContainerScroll,
  ContainerSticky,
  GalleryCol,
  GalleryContainer,
} from "@/components/blocks/animated-gallery";

// Real slides from "Birds: Masters of Survival", a course generated with Learnbee.
// Column order mirrors the reference layout; `no` is the slide's number in the
// source course, shown in the hover label.
interface Slide {
  src: string;
  no: string;
  label: string;
}

const COL_1: Slide[] = [
  { src: "/gallery/bird-01-intro.webp", no: "01", label: "Title Slide" },
  { src: "/gallery/bird-05-flip-cards.webp", no: "04", label: "Flip Cards" },
  { src: "/gallery/bird-06-mcq.webp", no: "07", label: "Quiz / MCQ" },
  { src: "/gallery/bird-fill-blanks.webp", no: "15", label: "Fill in the Blanks" },
];
const COL_2: Slide[] = [
  { src: "/gallery/bird-agenda.webp", no: "02", label: "Agenda" },
  { src: "/gallery/bird-content-left.webp", no: "05", label: "Image + Content" },
  { src: "/gallery/bird-true-false.webp", no: "08", label: "True / False" },
  { src: "/gallery/bird-03-insight.webp", no: "11", label: "Insight Cards" },
];
const COL_3: Slide[] = [
  { src: "/gallery/bird-09-image-explore.webp", no: "03", label: "Image Explore" },
  { src: "/gallery/bird-02-comparison.webp", no: "06", label: "Feature Matrix" },
  { src: "/gallery/bird-overlay-left.webp", no: "09", label: "Image Overlay" },
  { src: "/gallery/bird-10-sticky-scroll.webp", no: "10", label: "Sticky Scroll" },
];

/* Card + hover treatment: a dark scrim fades in over the whole image with the
   slide number and format name in the lower-left. */
function SlideCard({ slide }: { slide: Slide }) {
  return (
    <div className="group relative overflow-hidden rounded-md">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="aspect-video block h-auto max-h-full w-full rounded-md object-cover shadow"
        src={slide.src}
        alt={slide.label}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="pointer-events-none absolute bottom-3 left-4 translate-y-1 text-base font-semibold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        {slide.no} · {slide.label}
      </span>
    </div>
  );
}

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
      // Feeds the radial mask on .hero-grid-glow so the hex pattern brightens
      // under the cursor along with the glow.
      hero.style.setProperty("--gx", `${x}%`);
      hero.style.setProperty("--gy", `${y}%`);
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
        <span className="section-label reveal">BUILT FOR L&amp;D TEAMS</span>
        <h1 className="reveal reveal-d1">
          Create <span className="hero-pill" id="rotating-word" ref={wordRef}>interactive</span> training effortlessly.
        </h1>
        <p className="reveal reveal-d2">
          Most platforms stop at generating slides. Learnbee turns a document or topic into a
          narrated course — in any of 16 languages — then exports it anywhere, no LMS required.
        </p>
        <div className="hero-actions reveal reveal-d3">
          <a href="/create" data-open-create className="btn btn-white btn-lg">Get Started for Free</a>
          <a href="#features" className="btn btn-outline-light btn-lg">See How It Works</a>
        </div>
      </div>

      {/* Gallery is desktop-only: the 3-column fan needs width to read, and its
          350vh scroll length is a lot of dead swiping on a phone. */}
      <ContainerScroll className="relative z-[2] hidden h-[350vh] md:block">
        {/* Gutter lives OUTSIDE ContainerSticky: that element has overflow-hidden,
            which clips at its padding edge, so padding within it can't hold the
            scaled (1.2x) grid back from the viewport edges. */}
        <div className="h-full px-6">
        <ContainerSticky className="top-[var(--nav-h)] h-[calc(100svh-var(--nav-h))]">
          <GalleryContainer style={{ padding: "0px 8px" }}>
            <GalleryCol yRange={["-10%", "2%"]} className="-mt-2">
              {COL_1.map((slide, index) => (
                <SlideCard key={index} slide={slide} />
              ))}
            </GalleryCol>
            <GalleryCol className="mt-[-50%]" yRange={["15%", "5%"]}>
              {COL_2.map((slide, index) => (
                <SlideCard key={index} slide={slide} />
              ))}
            </GalleryCol>
            <GalleryCol yRange={["-10%", "2%"]} className="-mt-2">
              {COL_3.map((slide, index) => (
                <SlideCard key={index} slide={slide} />
              ))}
            </GalleryCol>
          </GalleryContainer>
        </ContainerSticky>
        </div>
      </ContainerScroll>
    </section>
  );
}
