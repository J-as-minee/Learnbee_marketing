/**
 * Draft Contract v1 — MIRROR of the platform's api/_lib/draftContract.ts.
 *
 * This file is a copy. The platform owns the original; the two repos cannot
 * import across each other, so the shape lives twice and must be kept in sync
 * by hand. If the platform bumps DRAFT_CONTRACT_VERSION or changes a field,
 * this file changes with it — a silent drift shows up as an empty wizard for
 * real users, days later, with nothing in the logs.
 *
 * Only the types, VERSION, DEFAULTS, LIMITS and validateDraft are mirrored.
 * Everything below the "site-side" divider is this repo's own.
 */

export const DRAFT_CONTRACT_VERSION = "1";

/** No URL option: the wizard has a web-search toggle, not a scraper, so a URL
 *  had nowhere honest to land.
 *
 *  `internet` was called `idea` until 7 Sep 2026. The platform still accepts
 *  the old name on input and normalises it, so the two repos could deploy
 *  independently — this side simply stopped sending it. */
export type DraftSourceType = "internet" | "upload" | "paste";

export interface DraftSource {
  type: DraftSourceType;
  /** `paste` only — the text itself. */
  text?: string;
  /** `upload` only — storage key under drafts/{token}/. */
  fileRef?: string;
}

/** Wizard steps: 1 Basics · 2 Content · 3 Media · 4 Structure · 5 Quiz · 6 Review/Generate. */
export type DraftResumeStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface DraftUtm {
  source?: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
}

export interface DraftPayload {
  version: string;
  topic: string;
  /** The wizard hard-gates step 1 on this, so a draft without it strands the
   *  visitor on a screen that looks complete. Required. */
  objective: string;
  audience: string;
  source: DraftSource;
  resumeStep: DraftResumeStep;
  anonId: string;
  utm?: DraftUtm;
}

/** Structure and quiz settings applied to every website-originated draft.
 *  The site renders these; it must not invent its own numbers. */
export const DRAFT_DEFAULTS = {
  language: "en",
  moduleCount: 1,
  duration: 5,
  depth: "standard",
  quizCount: 5,
  quizDifficulty: "intermediate",
  quizDistribution: "per-module",
} as const;

export const DRAFT_LIMITS = {
  topic: 200,
  objective: 600,
  audience: 300,
  text: 20_000,
  fileBytes: 5 * 1024 * 1024,
} as const;

export class DraftContractError extends Error {
  field: string;
  constructor(field: string, message: string) {
    super(message);
    this.field = field;
    this.name = "DraftContractError";
  }
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Same validation the platform runs, executed before we POST so a mismatch
 *  fails here — with the field name — instead of as an opaque 400. */
export function validateDraft(input: unknown): DraftPayload {
  const o = (input ?? {}) as Record<string, unknown>;

  if (str(o.version) !== DRAFT_CONTRACT_VERSION) {
    throw new DraftContractError(
      "version",
      `Draft contract mismatch: this site speaks v${DRAFT_CONTRACT_VERSION}, payload claims v${str(o.version) || "none"}.`
    );
  }

  const topic = str(o.topic);
  const objective = str(o.objective);
  const audience = str(o.audience);
  if (!topic) throw new DraftContractError("topic", "topic is required");
  if (!objective) throw new DraftContractError("objective", "objective is required");
  if (!audience) throw new DraftContractError("audience", "audience is required");
  if (topic.length > DRAFT_LIMITS.topic) throw new DraftContractError("topic", "topic is too long");
  if (objective.length > DRAFT_LIMITS.objective) throw new DraftContractError("objective", "objective is too long");
  if (audience.length > DRAFT_LIMITS.audience) throw new DraftContractError("audience", "audience is too long");

  const rawSource = (o.source ?? {}) as Record<string, unknown>;
  const type = str(rawSource.type) as DraftSourceType;
  if (!["internet", "upload", "paste"].includes(type)) {
    throw new DraftContractError("source.type", "source.type must be internet, upload or paste");
  }
  const source: DraftSource = { type };
  if (type === "paste") {
    const text = str(rawSource.text);
    if (!text) throw new DraftContractError("source.text", "source.text is required when type is paste");
    if (text.length > DRAFT_LIMITS.text) throw new DraftContractError("source.text", "source.text is too long");
    source.text = text;
  }
  if (type === "upload") {
    const fileRef = str(rawSource.fileRef);
    if (!fileRef) throw new DraftContractError("source.fileRef", "source.fileRef is required when type is upload");
    if (!/^drafts\/[0-9a-f-]{36}\/[\w.\- ]{1,200}$/i.test(fileRef)) {
      throw new DraftContractError("source.fileRef", "source.fileRef is not a draft storage key");
    }
    source.fileRef = fileRef;
  }

  const resumeStep = Number(o.resumeStep);
  if (!Number.isInteger(resumeStep) || resumeStep < 1 || resumeStep > 6) {
    throw new DraftContractError("resumeStep", "resumeStep must be a wizard step, 1 to 6");
  }

  const anonId = str(o.anonId);
  if (!/^[0-9a-f-]{36}$/i.test(anonId)) {
    throw new DraftContractError("anonId", "anonId must be a uuid");
  }

  const rawUtm = (o.utm ?? {}) as Record<string, unknown>;
  const utm: DraftUtm = {};
  for (const k of ["source", "medium", "campaign", "referrer"] as const) {
    const v = str(rawUtm[k]);
    if (v) utm[k] = v.slice(0, 200);
  }

  return {
    version: DRAFT_CONTRACT_VERSION,
    topic, objective, audience,
    source,
    resumeStep: resumeStep as DraftResumeStep,
    anonId,
    ...(Object.keys(utm).length ? { utm } : {}),
  };
}

/* ═══════════════ site-side — not part of the mirror ═══════════════ */

/** The gate the visitor hit, expressed as the wizard step to resume at.
 *  Customize = they tried to change structure (step 4); Generate = step 6. */
export const RESUME_STEP: Record<"customize" | "generate", DraftResumeStep> = {
  customize: 4,
  generate: 6,
};
export type GateReason = keyof typeof RESUME_STEP;

/** Rendered on the review slide. Derived from DRAFT_DEFAULTS so the site can
 *  never advertise numbers the platform has stopped using. */
export const DEFAULTS_DISPLAY: [string, string][] = [
  ["Modules", String(DRAFT_DEFAULTS.moduleCount)],
  ["Duration", `${DRAFT_DEFAULTS.duration} min`],
  ["Depth", "Standard"],
  ["Quiz", `${DRAFT_DEFAULTS.quizCount} questions`],
  ["Difficulty", "Intermediate"],
  ["Placement", "Per module"],
];

export const UPLOAD_ACCEPT = ".pdf,.docx,.pptx";
const UPLOAD_EXTS = [".pdf", ".docx", ".pptx"];

export function fileError(file: File): string | null {
  const name = file.name.toLowerCase();
  if (!UPLOAD_EXTS.some((e) => name.endsWith(e))) return "Use a PDF, DOCX or PPTX file.";
  if (file.size > DRAFT_LIMITS.fileBytes) return "That file is over 5 MB. Try a smaller one.";
  return null;
}

/* anonId doubles as the analytics distinct_id and rides through the redirect,
   so it lives in localStorage: a per-tab id would split one person's funnel. */
const ANON_KEY = "lb_anon_id";

export function getAnonId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.localStorage.getItem(ANON_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    window.localStorage.setItem(ANON_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function readUtm(): DraftUtm {
  if (typeof window === "undefined") return {};
  const q = new URLSearchParams(window.location.search);
  const utm: DraftUtm = {};
  const source = q.get("utm_source");
  const medium = q.get("utm_medium");
  const campaign = q.get("utm_campaign");
  if (source) utm.source = source;
  if (medium) utm.medium = medium;
  if (campaign) utm.campaign = campaign;
  if (document.referrer) utm.referrer = document.referrer;
  return utm;
}

const API_BASE = process.env.NEXT_PUBLIC_PLATFORM_API_URL || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://creator.learnbee.ai";

export class DraftError extends Error {}

function apiUrl(path: string): string {
  if (!API_BASE) {
    throw new DraftError("The draft service is not configured yet. Set NEXT_PUBLIC_PLATFORM_API_URL.");
  }
  return `${API_BASE.replace(/\/$/, "")}${path}`;
}

/* The platform's CORS layer allows the `content-type` header only, so the
   Turnstile token travels in the body. Note that api/draft has no Turnstile
   verification today — its real abuse controls are per-IP and global rate
   limits plus the busboy file cap — so this is forward-wiring, not a gate. */

/** Placeholder matching the server's own key shape. The real fileRef is minted
 *  by api/draft ("written by us, never accepted from the caller"), so we only
 *  need something that satisfies the mirror's check before we send. */
const FILEREF_PLACEHOLDER = "drafts/00000000-0000-0000-0000-000000000000/upload.pdf";

function describeFailure(status: number, body: Record<string, unknown> | null): string {
  const code = typeof body?.error === "string" ? body.error : "";
  if (code === "rate_limited") return "Too many drafts from your network just now. Try again shortly — nothing you typed is lost.";
  if (code === "file_too_large") return "That file is over 5 MB. Try a smaller one.";
  if (code === "contract") return `Draft rejected on "${String(body?.field ?? "?")}": ${String(body?.detail ?? "")}`;
  if (code === "upload_failed") return "Your file could not be stored. Try again, or continue without it.";
  if (status >= 500) return "The draft service had a problem. Try again in a moment.";
  return `Could not save your draft (${status}).`;
}

/**
 * POST /api/draft → 201 { token }.
 *
 * One endpoint for both shapes: JSON, or multipart when a file is attached —
 * the `payload` field then carries the same JSON. The file is NOT uploaded
 * separately and source.fileRef is NOT sent; the server mints the key from the
 * token it generates and injects it before validating.
 */
export async function postDraft(
  payload: DraftPayload,
  file: File | null,
  turnstileToken: string | null
): Promise<string> {
  /* Validate what the server will actually see. For an upload that means the
     payload plus the fileRef it is about to write. */
  validateDraft(
    file ? { ...payload, source: { type: "upload", fileRef: FILEREF_PLACEHOLDER } } : payload
  );

  const wire = { ...payload, ...(turnstileToken ? { turnstileToken } : {}) };

  let res: Response;
  if (file) {
    const form = new FormData();
    form.append("payload", JSON.stringify(wire));
    form.append("file", file);
    // No Content-Type: the browser sets the multipart boundary.
    res = await fetch(apiUrl("/draft"), { method: "POST", body: form });
  } else {
    res = await fetch(apiUrl("/draft"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(wire),
    });
  }

  if (!res.ok) {
    let body: Record<string, unknown> | null = null;
    try { body = await res.json(); } catch { /* non-JSON error page */ }
    throw new DraftError(describeFailure(res.status, body));
  }

  const data = (await res.json()) as { token?: string };
  if (!data?.token) throw new DraftError("The draft service did not return a token.");
  return data.token;
}

/** anonId rides inside redirect_url so it survives auth and the platform can
 *  continue the same funnel. */
export function handoffUrl(token: string, anonId: string): string {
  const redirect = `/resume?draft=${encodeURIComponent(token)}&aid=${encodeURIComponent(anonId)}`;
  return `${APP_URL}/sign-in?redirect_url=${encodeURIComponent(redirect)}`;
}
