"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QuickCreate from "@/components/create/QuickCreate";
import "@/app/create/create.css";

/**
 * Quick Create, embedded on the home page.
 *
 * Hidden until a "Get Started for Free" button asks for it. Mounting it only
 * on that click is deliberate: QuickCreate fires `quickcreate_opened` on mount,
 * and a section sitting in the DOM on every home page load would report a
 * funnel opening for every visitor who never touched it.
 *
 * The buttons stay real links to /create, and this intercepts the click — so
 * the flow still works with JavaScript off, it just lands on the page version.
 */
export default function HomeQuickCreate() {
  const [open, setOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const reveal = useCallback(() => {
    setOpen(true);
    // Next frame: the section has to exist before it can be scrolled to.
    requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      sectionRef.current?.focus({ preventScroll: true });
    });
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // Let modified clicks do what the browser would: open /create in a tab.
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const cta = (e.target as HTMLElement | null)?.closest("[data-open-create]");
      if (!cta) return;
      e.preventDefault();
      reveal();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [reveal]);

  return (
    <section
      id="create"
      ref={sectionRef}
      tabIndex={-1}
      aria-label="Build your course"
      className="home-create"
      hidden={!open}
    >
      {open && <QuickCreate variant="inline" />}
    </section>
  );
}
