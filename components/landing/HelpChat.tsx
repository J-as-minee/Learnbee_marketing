"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { SUGGESTED, renderMarkdown, useAskAi } from "./askAi";
import "@/app/help-chat.css";

export default function HelpChat() {
  /* Streaming, history and the endpoint contract are shared with the floating
     assistant panel; only this search-bar presentation is local. */
  const { history, streaming, error, ask, stop, reset: resetChat } = useAskAi();
  const [input, setInput] = useState("");
  const responseRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll response into view when it appears
  useEffect(() => {
    if (history.length > 0 && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [history.length]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = input;
    setInput("");
    ask(q);
  }

  function reset() {
    resetChat();
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const lastPair =
    history.length >= 2
      ? { q: history[history.length - 2].content, a: history[history.length - 1].content }
      : null;

  return (
    <div className="help-chat-wrap">
      {/* Search bar */}
      <form className="help-search-form" onSubmit={handleSubmit} autoComplete="off">
        <div className="help-search-box">
          <svg className="help-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            className="help-search-input"
            type="text"
            placeholder="Ask anything about Learnbee…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={streaming}
            aria-label="Ask a question"
          />
          {streaming ? (
            <button type="button" className="help-search-btn stop" onClick={stop}>
              Stop
            </button>
          ) : (
            <button type="submit" className="help-search-btn" disabled={!input.trim()}>
              Ask
            </button>
          )}
        </div>
      </form>

      {/* Suggested questions — hide once there's a conversation */}
      {history.length === 0 && (
        <div className="help-suggestions">
          <div className="help-suggestions-row">
            {SUGGESTED.slice(0, 4).map((q) => (
              <button key={q} className="help-suggestion-pill" onClick={() => ask(q)} disabled={streaming}>
                {q}
              </button>
            ))}
          </div>
          <div className="help-suggestions-row">
            {SUGGESTED.slice(4).map((q) => (
              <button key={q} className="help-suggestion-pill" onClick={() => ask(q)} disabled={streaming}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && <p className="help-chat-error">{error}</p>}

      {/* Response */}
      {lastPair && (
        <div className="help-response-wrap" ref={responseRef}>
          <div className="help-response-q">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            {lastPair.q}
          </div>
          <div className="help-response-body">
            <div className="help-response-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2L4.5 13.5H11l-1 8.5L19.5 10H13l0-8z"/></svg>
              Learnbee AI
            </div>
            {lastPair.a ? (
              <div
                className="help-response-text"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(lastPair.a) }}
              />
            ) : (
              <div className="help-response-text">
                <span className="help-typing">
                  <span className="help-typing-dot"></span>
                  <span className="help-typing-dot"></span>
                  <span className="help-typing-dot"></span>
                </span>
              </div>
            )}
            {!streaming && lastPair.a && (
              <div className="help-response-actions">
                <button className="help-followup-btn" onClick={() => inputRef.current?.focus()}>
                  Ask a follow-up
                </button>
                <button className="help-reset-btn" onClick={reset}>
                  Start over
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
