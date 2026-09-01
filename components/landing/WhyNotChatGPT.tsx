"use client";

import { useEffect, useRef, useState } from "react";

export interface WhyItem {
  label: string;
  text: string;
  /* The "in a chat window" contrast line shown under the description. */
  vs: string;
}
export interface WhyGroup {
  group: string;
  items: WhyItem[];
}

/* Copy is verbatim from the approved design file — reviewed wording, edit here only. */
const GROUPS: WhyGroup[] = [
  {
    group: "Building slides",
    items: [
      {
        label: "25 slide formats",
        text: "25 editorial layouts, ready to use. Pick one and the slide is built — no design work, no template wrangling.",
        vs: "You get the words. Turning them into slides is a separate job, in a separate tool.",
      },
      {
        label: "Prompt your own format",
        text: "None of the 25 fit? Describe the layout you want and Learnbee builds it into the course.",
        vs: "It can describe a layout, or code you a one-off page. Neither is a slide format you can use again next week.",
      },
      {
        label: "Make it interactive",
        text: "Flip cards, accordions, image explores and gated reveals. Learners click through and decide things instead of skimming past.",
        vs: "The chat is interactive for you. What a learner opens is a transcript of it.",
      },
      {
        label: "Add quiz types",
        text: "MCQ, true/false, fill in the blanks, image match and scenario. Auto-graded, with feedback, counted towards completion.",
        vs: "It writes good questions. Nothing grades them, and no score is recorded anywhere.",
      },
    ],
  },
  {
    group: "Voice and words",
    items: [
      {
        label: "Write and edit narration",
        text: "Every slide carries its own narration script. Edit it inline, regenerate one slide, leave the rest untouched.",
        vs: "A script in a thread, attached to no slide. Nothing connects the words to the thing a learner sees.",
      },
      {
        label: "Add voiceover",
        text: "One click turns each script into voiceover. Change a line and only that slide's audio is re-rendered.",
        vs: "It can read to you inside the app. There is no audio file per slide to ship with a course.",
      },
      {
        label: "16 languages",
        text: "Words and voiceover regenerate together in 16 languages. One source course, every market, nothing re-authored.",
        vs: "It translates the text well. Every voiceover is then recorded again from scratch.",
      },
    ],
  },
  {
    group: "Visuals",
    items: [
      {
        label: "Stock images built in",
        text: "Search a stock library inside the editor. Pick an image and it is placed, cropped and bundled into the export.",
        vs: "It can generate an image. It can't crop it to your slide or bundle it into a package your LMS will open.",
      },
      {
        label: "Your own media library",
        text: "Upload product shots, diagrams, video and PDFs once, and reuse them across every course you build.",
        vs: "A file uploaded to a chat lives in that chat, not in a library your next course can draw on.",
      },
    ],
  },
  {
    group: "Working with others",
    items: [
      {
        label: "Review and co-edit",
        text: "Invite people to view, comment or edit the live course. Reviews happen on the real thing, not on a document.",
        vs: "A shared chat is read-only. Reviewers can't change a slide or leave a comment on one.",
      },
      {
        label: "Start from the library",
        text: "Clone a professionally authored course, make it yours, export it. Faster than starting from a blank page.",
        vs: "You can save a prompt. You can't inherit a finished course somebody else already built.",
      },
    ],
  },
  {
    group: "Shipping it",
    items: [
      {
        label: "Set a pass mark",
        text: "Choose the score that counts as a pass and which slides are gated. The same rule applies to every learner.",
        vs: "No pass mark, no gating, no idea who finished.",
      },
      {
        label: "Export as SCORM",
        text: "One self-contained SCORM 2004 zip with images and audio inside. Any LMS accepts it, and scores report back.",
        vs: "There is no export. Someone rebuilds the course in an authoring tool to get it into the LMS.",
      },
      {
        label: "Share as a link",
        text: "Publish and get a link, six-character code, QR and embed snippet. It plays as a real course, with gating and a completion screen at the end.",
        vs: "You can share a chat, and the link works. What opens is your conversation — nothing plays, nothing is scored, nothing is recorded.",
      },
      {
        label: "Works on mobile",
        text: "Every format has its own portrait layout. The same course works on a laptop at a desk or a phone on the shop floor.",
        vs: "The app is mobile-friendly. What's inside it is still a long scroll of text.",
      },
    ],
  },
];

/* Flattened once so selection is a single index and arrow keys can rove across
   group boundaries without special-casing the last chip in a row. */
const FLAT = GROUPS.flatMap((g) => g.items.map((item) => ({ ...item, group: g.group })));

/* Index of each group's first chip, so the nested render can map back to FLAT. */
const OFFSETS = GROUPS.reduce<number[]>((acc, _g, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + GROUPS[i - 1].items.length);
  return acc;
}, []);

export default function WhyNotChatGPT() {
  const [sel, setSel] = useState(0);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  /* Hover-to-select would misfire on touch, where a tap emits a synthetic
     mouseenter. Resolved on mount because matchMedia needs the browser. */
  const fineHover = useRef(false);

  useEffect(() => {
    fineHover.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }, []);

  function focusChip(i: number) {
    setSel(i);
    chipRefs.current[i]?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    const last = FLAT.length - 1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      focusChip(i === last ? 0 : i + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      focusChip(i === 0 ? last : i - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusChip(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusChip(last);
    }
  }

  const active = FLAT[sel];

  return (
    <section className="wnc" id="why-not-chatgpt">
      <div className="container">
        <div className="wnc-head">
          <div>
            <span className="section-label reveal">How is it different?</span>
            <h2 className="reveal reveal-d1">Why can&apos;t I just use ChatGPT?</h2>
          </div>
          <p className="wnc-lede reveal reveal-d2">
            You can, for the first draft. What comes back is writing — not a course anyone can be
            assigned, complete, or be scored on.
          </p>
        </div>

        <div className="wnc-layout">
          <div className="wnc-groups" role="tablist" aria-label="What Learnbee does beyond a first draft">
            {GROUPS.map((g, gi) => {
              const start = OFFSETS[gi];
              const groupActive = sel >= start && sel < start + g.items.length;
              return (
                <div className="wnc-group" key={g.group}>
                  <h3 className={groupActive ? "wnc-rail is-active" : "wnc-rail"}>{g.group}</h3>
                  <div className="wnc-chips">
                    {g.items.map((item, ii) => {
                      const i = start + ii;
                      const selected = i === sel;
                      return (
                        <button
                          key={item.label}
                          ref={(el) => {
                            chipRefs.current[i] = el;
                          }}
                          type="button"
                          role="tab"
                          id={`wnc-tab-${i}`}
                          aria-selected={selected}
                          aria-controls="wnc-panel"
                          tabIndex={selected ? 0 : -1}
                          className="wnc-chip"
                          onClick={() => setSel(i)}
                          onFocus={() => setSel(i)}
                          onMouseEnter={() => {
                            if (fineHover.current) setSel(i);
                          }}
                          onKeyDown={(e) => onKeyDown(e, i)}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="wnc-aside">
            <div
              className="wnc-card"
              id="wnc-panel"
              role="tabpanel"
              aria-live="polite"
              aria-labelledby={`wnc-tab-${sel}`}
            >
              {/* Keyed on the selection so the stagger remounts and replays —
                  the React equivalent of the reference's remove/reflow/re-add. */}
              <div className="wnc-card-in" key={sel}>
                <div className="wnc-c-head">
                  <span className="wnc-c-label">{active.group}</span>
                  <span className="wnc-rule" aria-hidden="true" />
                </div>
                <p className="wnc-c-title">{active.label}</p>
                <p className="wnc-c-text">{active.text}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
