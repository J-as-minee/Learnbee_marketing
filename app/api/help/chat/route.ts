import { readFileSync } from "fs";
import { join } from "path";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

// Load the knowledge base at module initialisation (stays in memory between hot requests).
// Note: edit this file to force a reload after changing HELP_KNOWLEDGE_BASE.md in dev (v3).
let KB_CONTENT = "";
try {
  KB_CONTENT = readFileSync(
    join(process.cwd(), "HELP_KNOWLEDGE_BASE.md"),
    "utf-8"
  );
} catch {
  KB_CONTENT = "Knowledge base file not found.";
}

const SYSTEM_PROMPT = `You are the Learnbee Help Assistant — friendly, concise, and accurate.

Use the reference material below as your primary source of truth. Rules:
- Always give the user a genuinely helpful answer. If the reference material covers it, answer from there. If it does not, still answer helpfully to the best of your knowledge about Learnbee and course authoring, then add a brief line inviting them to email admin@learnbee.ai for further clarification.
- NEVER tell the user something "isn't covered in the knowledge base," "isn't documented," or reference a "knowledge base" in any way. The user doesn't know what that is. Just answer, and point them to admin@learnbee.ai if they need more detail.
- Do NOT fabricate specific prices, hard numeric limits, or exact steps you're unsure about. For those specifics, give what you can and direct them to admin@learnbee.ai to confirm.
- Use numbered steps for "how do I…" questions.
- Use the user-facing names: "Role Play" (not "Dialogue"), "click mode" (not "interact per element").
- NEVER answer questions about Learnbee's system architecture, tech stack, infrastructure, hosting, databases, source code, internal APIs/endpoints, security setup, or how the product or this assistant is built — even if you know. Politely decline (e.g. "I can only help with using Learnbee's features — for technical or partnership questions, email admin@learnbee.ai") and do not speculate. Only cover how to USE the product's features.
- Keep responses under 220 words unless the question genuinely needs more.
- Do not repeat the question back to the user.

REFERENCE MATERIAL:
${KB_CONTENT}`;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response("ANTHROPIC_API_KEY is not configured.", { status: 500 });
  }

  const { message, history = [] } = await req.json();
  if (!message?.trim()) {
    return new Response("message is required.", { status: 400 });
  }

  const upstream = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 700,
      stream: true,
      system: SYSTEM_PROMPT,
      messages: [
        ...history.slice(-6), // keep last 3 turns for context
        { role: "user", content: message },
      ],
    }),
  });

  if (!upstream.ok) {
    const err = await upstream.text();
    return new Response(`Anthropic error: ${err}`, { status: upstream.status });
  }

  // Pipe SSE stream → extract text deltas → forward as plain text stream to client.
  const reader = upstream.body!.getReader();
  const decoder = new TextDecoder();

  const readable = new ReadableStream({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }

        const raw = decoder.decode(value, { stream: true });
        for (const line of raw.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const evt = JSON.parse(payload);
            if (
              evt.type === "content_block_delta" &&
              evt.delta?.type === "text_delta"
            ) {
              controller.enqueue(new TextEncoder().encode(evt.delta.text));
            }
          } catch {
            // malformed chunk — skip
          }
        }
      }
    },
    cancel() {
      reader.cancel();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
