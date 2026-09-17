"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, X } from "lucide-react";
import AskAiPanel from "./AskAiPanel";
import { track } from "@/lib/analytics";
import "@/app/ask-fab.css";

/* /create is left out: a floating button would fight a flow deliberately built
   to fit one screen. */
const HIDDEN_ON = ["/create"];

/**
 * Floating "Ask Learnbee AI" button, mounted once in the root layout.
 *
 * The popup is a native <dialog> opened with showModal(), which gives focus
 * trapping, Escape-to-close and inertness of the page behind it without any of
 * that being hand-rolled.
 */
export default function AskAiFab() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const hidden = HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      track("ask_ai_opened", { path: pathname });
    } else if (!open && el.open) {
      el.close();
    }
  }, [open, pathname]);

  /* showModal makes the page inert but does not reliably stop it scrolling
     behind the dialog, so the body is pinned for as long as it is open. */
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Navigating away closes it rather than carrying the popup to the next page.
  useEffect(() => setOpen(false), [pathname]);

  if (hidden) return null;

  return (
    <>
      <button
        type="button"
        className="ask-fab"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="Ask Learnbee AI"
      >
        <Sparkles size={24} strokeWidth={2.2} aria-hidden="true" />
      </button>

      <dialog
        ref={dialogRef}
        className="ask-dialog"
        aria-labelledby="ask-dialog-title"
        onClose={close}
        onCancel={close}
        /* A click only lands on the dialog element itself when it hits the
           backdrop — anything inside is caught by a child. */
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
      >
        <div className="ask-dialog-inner">
          <div className="ask-dialog-head">
            <span className="ask-head-icon" aria-hidden="true">
              <Sparkles size={18} strokeWidth={2.4} />
            </span>
            <div className="ask-head-text">
              <h2 className="ask-dialog-title" id="ask-dialog-title">
                Ask Learnbee AI
              </h2>
              <p className="ask-head-sub">Instant AI guidance for Learnbee authoring</p>
            </div>
            <button
              type="button"
              className="ask-dialog-close"
              onClick={close}
              aria-label="Close"
            >
              <X size={17} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </div>
          {/* Mounted only while open: a fresh conversation each time, and the
              chat's effects don't run behind a closed dialog. */}
          {open && <AskAiPanel />}
        </div>
      </dialog>
    </>
  );
}
