"use client";

import { useCallback, useRef, useState } from "react";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

/* Shared plumbing for the two places the assistant appears: the search-style
   chat in the help hero (HelpChat) and the floating panel (AskAiPanel). Only
   the presentation differs — the endpoint, the streaming and the history
   contract are the same, so they live here rather than in either component. */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  /* Epoch ms, for the relative timestamps the panel shows. */
  at: number;
}

/* Short pills for the help hero, where the first row is laid out nowrap and
   long questions would overflow the search box. */
export const SUGGESTED = [
  "How do I create a course?",
  "How do I export to SCORM?",
  "Can I change the course language?",
  "How does narration work?",
  "Do learners need an account?",
  "How do I invite collaborators?",
];

/* The panel's chips scroll sideways, so they can be full questions. */
export const PANEL_PROMPTS = [
  "How do I export SCORM 2004 for my LMS?",
  "How do I translate a course into 16 languages?",
  "How does AI narration work?",
  "What slide formats can I use?",
];

// Markdown → HTML for the streamed answer. Sync so it re-renders on each chunk.
// remark-rehype drops raw HTML by default, so AI output can't inject markup.
const mdProcessor = remark().use(remarkGfm).use(remarkRehype).use(rehypeStringify);

export function renderMarkdown(src: string): string {
  try {
    return String(mdProcessor.processSync(src));
  } catch {
    return src;
  }
}

export function useAskAi() {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const ask = useCallback(
    async (question: string) => {
      if (!question.trim() || streaming) return;
      setError("");

      const at = Date.now();
      setHistory((h) => [
        ...h,
        { role: "user", content: question, at },
        { role: "assistant", content: "", at },
      ]);
      setStreaming(true);

      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const res = await fetch("/api/help/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: question,
            // The turns before this one — the new pair is not part of the prompt.
            history: history.map((m) => ({ role: m.role, content: m.content })),
          }),
          signal: ctrl.signal,
        });

        if (!res.ok) throw new Error(await res.text());

        const reader = res.body!.getReader();
        const dec = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = dec.decode(value, { stream: true });
          setHistory((h) => {
            const next = [...h];
            next[next.length - 1] = {
              ...next[next.length - 1],
              content: next[next.length - 1].content + chunk,
            };
            return next;
          });
        }
      } catch (e: unknown) {
        if ((e as { name?: string }).name === "AbortError") return;
        setError("Something went wrong. Please try again.");
        setHistory((h) => h.slice(0, -2));
      } finally {
        setStreaming(false);
      }
    },
    [history, streaming]
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setHistory([]);
    setError("");
    setStreaming(false);
  }, []);

  return { history, streaming, error, ask, stop, reset };
}

/** "Just now" for the first minute, then coarse relative time. */
export function timeAgo(at: number): string {
  const secs = Math.max(0, Math.round((Date.now() - at) / 1000));
  if (secs < 60) return "Just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs} h ago`;
}
