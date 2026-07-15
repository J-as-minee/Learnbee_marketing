import { Redis } from "@upstash/redis";

const DRAFT_PREFIX = "draft:";
const DRAFT_TTL = 60 * 60 * 24 * 90; // 90 days

let redisSingleton = null;

/** Lazy-init: avoid constructing Redis at module load (fixes build warnings when KV env is unset). */
function getRedis() {
  // Accept either Vercel KV naming (KV_REST_API_*) or Upstash naming
  // (UPSTASH_REDIS_REST_*) — Learnbee uses the latter. One Upstash source of truth.
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (!redisSingleton) {
    redisSingleton = new Redis({ url, token });
  }
  return redisSingleton;
}

export async function saveDraftToKV(sessionId, slug, data) {
  const redis = getRedis();
  if (!redis) {
    return { ok: false, error: "KV not configured" };
  }
  const key = `${DRAFT_PREFIX}${sessionId}:${slug || "new"}`;
  try {
    await redis.set(key, JSON.stringify({ ...data, savedAt: new Date().toISOString() }), { ex: DRAFT_TTL });
    return { ok: true };
  } catch (error) {
    console.error("Failed to save draft to KV:", error);
    return { ok: false, error: error.message };
  }
}

export async function getDraftFromKV(sessionId, slug) {
  const redis = getRedis();
  if (!redis) return null;
  const key = `${DRAFT_PREFIX}${sessionId}:${slug || "new"}`;
  try {
    const data = await redis.get(key);
    return data || null;
  } catch (error) {
    console.error("Failed to get draft from KV:", error);
    return null;
  }
}

export async function deleteDraftFromKV(sessionId, slug) {
  const redis = getRedis();
  if (!redis) {
    return { ok: false, error: "KV not configured" };
  }
  const key = `${DRAFT_PREFIX}${sessionId}:${slug || "new"}`;
  try {
    await redis.del(key);
    return { ok: true };
  } catch (error) {
    console.error("Failed to delete draft from KV:", error);
    return { ok: false, error: error.message };
  }
}

export async function listUserDrafts(sessionId) {
  const redis = getRedis();
  if (!redis) return [];
  try {
    const keys = await redis.keys(`${DRAFT_PREFIX}${sessionId}:*`);
    const drafts = [];
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) drafts.push(typeof data === "string" ? JSON.parse(data) : data);
    }
    return drafts;
  } catch (error) {
    console.error("Failed to list drafts from KV:", error);
    return [];
  }
}
