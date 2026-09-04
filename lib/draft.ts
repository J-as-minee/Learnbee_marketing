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
 *  had nowhere honest to land. */
export type DraftSourceType = "idea" | "upload" | "paste";

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
  if (!["idea", "upload", "paste"].includes(type)) {
    throw new DraftContractError("source.type", "source.type must be idea, upload or paste");
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

/**
 * Upload step — the contract wants source.fileRef, a storage key the platform
 * builds ("anything else is someone reaching for a path we did not hand out"),
 * so the file goes up first and we send back the key we are given.
 *
 * ASSUMED ENDPOINT: POST {API}/draft/upload (multipart, field "file") →
 * { fileRef }. Confirm the real path before launch — nothing else in the flow
 * is guesswork, and this is the one piece the contract file does not name.
 */
export async function uploadDraftFile(file: File, turnstileToken: string | null): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  if (turnstileToken) form.append("cf-turnstile-response", turnstileToken);

  const res = await fetch(apiUrl("/draft/upload"), { method: "POST", body: form });
  if (!res.ok) throw new DraftError(`Could not upload your file (${res.status}).`);
  const data = (await res.json()) as { fileRef?: string };
  if (!data?.fileRef) throw new DraftError("The upload did not return a file reference.");
  return data.fileRef;
}

/** POST /draft → { token }. Validated against the contract before it leaves. */
export async function postDraft(
  payload: DraftPayload,
  turnstileToken: string | null
): Promise<string> {
  const checked = validateDraft(payload);

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (turnstileToken) headers["cf-turnstile-response"] = turnstileToken;

  const res = await fetch(apiUrl("/draft"), {
    method: "POST",
    headers,
    body: JSON.stringify(checked),
  });

  if (!res.ok) throw new DraftError(`Could not save your draft (${res.status}).`);
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
