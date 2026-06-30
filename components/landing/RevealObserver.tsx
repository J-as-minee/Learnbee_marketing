"use client";

import { useEffect } from "react";

/* Scroll-reveal: adds `.revealed` to every `.reveal` element as it enters view.
   Ported from experiment.js. Re-scans shortly after mount so dynamically-sized
   sections (the live demo iframe) are picked up. */
export default function RevealObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    const observeAll = () =>
      document.querySelectorAll(".reveal:not(.revealed)").forEach((el) => observer.observe(el));

    observeAll();
    const t = setTimeout(observeAll, 200);

    return () => {
      clearTimeout(t);
      observer.disconnect();
    };
  }, []);

  return null;
}
