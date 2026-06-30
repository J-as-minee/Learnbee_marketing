"use client";

import { useEffect } from "react";

/* Background colour that morphs as you scroll between sections.
   Ported from experiment.js (bg-morph IIFE). */
export default function BgMorph() {
  useEffect(() => {
    const morph = document.getElementById("bg-morph");
    if (!morph) return;

    const DEFS = [
      { sel: ".hero", rgb: [15, 23, 41] },
      { sel: ".demo-section", rgb: [248, 247, 251] },
      { sel: ".value-section", rgb: [15, 23, 41] },
      { sel: "#philosophy", rgb: [248, 247, 251] },
      { sel: ".features", rgb: [248, 247, 251] },
      { sel: "#faq", rgb: [248, 247, 251] },
    ];

    const secs = DEFS.map((d) => ({ rgb: d.rgb, el: document.querySelector(d.sel) })).filter(
      (s): s is { rgb: number[]; el: Element } => !!s.el
    );

    const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);

    function update() {
      const scrollY = window.scrollY;
      const focal = scrollY + window.innerHeight * 0.45;

      const pts = secs.map((s) => ({
        rgb: s.rgb,
        top: s.el.getBoundingClientRect().top + scrollY,
      }));

      let idx = 0;
      for (let i = 0; i < pts.length; i++) {
        if (focal >= pts[i].top) idx = i;
      }

      const cur = pts[idx];
      const nxt = pts[idx + 1];
      const ZONE = idx === 0 ? 220 : 0;

      let r: number, g: number, b: number;
      if (!nxt || !ZONE || focal < nxt.top - ZONE) {
        [r, g, b] = cur.rgb;
      } else if (focal > nxt.top + ZONE) {
        [r, g, b] = nxt.rgb;
      } else {
        const t = (focal - (nxt.top - ZONE)) / (ZONE * 2);
        r = lerp(cur.rgb[0], nxt.rgb[0], t);
        g = lerp(cur.rgb[1], nxt.rgb[1], t);
        b = lerp(cur.rgb[2], nxt.rgb[2], t);
      }

      morph.style.backgroundColor = `rgb(${r},${g},${b})`;
    }

    window.addEventListener("scroll", update, { passive: true });
    update();

    return () => window.removeEventListener("scroll", update);
  }, []);

  return <div id="bg-morph" />;
}
