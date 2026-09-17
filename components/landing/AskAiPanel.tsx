"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Lightbulb, Send, Square } from "lucide-react";
import { ChatMessage, PANEL_PROMPTS, renderMarkdown, timeAgo, useAskAi } from "./askAi";

const GREETING =
  "👋 Hi! I'm Learnbee AI, your authoring assistant. Ask me anything about creating courses, SCORM 2004 export, AI narration, slide formats, or translation.";

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`ask-msg${isUser ? " user" : ""}`}>
      <div className="ask-bubble">
        {isUser ? (
          <p className="ask-bubble-text">{message.content}</p>
        ) : message.content ? (
          <div
            className="ask-bubble-text"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
          />
        ) : (
          <span className="ask-typing" aria-label="Thinking">
            <span className="ask-typing-dot" />
            <span className="ask-typing-dot" />
            <span className="ask-typing-dot" />
          </span>
        )}
        <span className="ask-time">{timeAgo(message.at)}</span>
      </div>
    </div>
  );
}

/** The conversation panel shown inside the floating assistant dialog. */
export default function AskAiPanel() {
  const { history, streaming, error, ask, stop } = useAskAi();
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the newest message in view as it streams in.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function submit(e: FormEvent) {
    e.preventDefault();
    const q = input;
    setInput("");
    ask(q);
  }

  return (
    <div className="ask-panel">
      <div className="ask-log">
        <div className="ask-msg">
          <div className="ask-bubble">
            <p className="ask-bubble-text">{GREETING}</p>
            <span className="ask-time">Just now</span>
          </div>
        </div>

        {history.map((m, i) => (
          <Bubble key={i} message={m} />
        ))}

        {error && <p className="ask-error">{error}</p>}
        <div ref={endRef} />
      </div>

      {/* Starter questions, until the visitor has asked something of their own. */}
      {history.length === 0 && (
        <div className="ask-chips">
          {PANEL_PROMPTS.map((q) => (
            <button key={q} type="button" className="ask-chip" onClick={() => ask(q)}>
              <Lightbulb size={13} strokeWidth={2.4} aria-hidden="true" />
              {q}
            </button>
          ))}
        </div>
      )}

      <form className="ask-composer" onSubmit={submit} autoComplete="off">
        <input
          ref={inputRef}
          className="ask-input"
          type="text"
          placeholder="Ask Learnbee AI a question…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={streaming}
          aria-label="Ask Learnbee AI a question"
        />
        {streaming ? (
          <button type="button" className="ask-send stop" onClick={stop} aria-label="Stop">
            <Square size={14} strokeWidth={3} aria-hidden="true" />
          </button>
        ) : (
          <button type="submit" className="ask-send" disabled={!input.trim()} aria-label="Send">
            <Send size={16} strokeWidth={2.2} aria-hidden="true" />
          </button>
        )}
      </form>
    </div>
  );
}
