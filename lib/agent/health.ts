import "server-only";

/**
 * Is OpenRouter usable right now? Checked against OpenRouter's key endpoint (credits / limit),
 * cached briefly so a page full of visitors doesn't hammer it. A failed model call also marks it down
 * for a short while, so the next visitors go straight to the native agent instead of waiting on errors.
 */

export type ProviderHealth = {
  ok: boolean;
  reason?: "no_key" | "credits" | "down";
  /** Remaining OpenRouter credit on the key when the key has a limit (null = unlimited / unknown). */
  creditsRemaining?: number | null;
};

const OK_TTL = 60_000;
const DOWN_TTL = 60_000;
let cache: { at: number; ttl: number; value: ProviderHealth } | null = null;

const baseUrl = () => (process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/$/, "");

export function markOpenRouterDown(reason: ProviderHealth["reason"] = "down") {
  cache = { at: Date.now(), ttl: DOWN_TTL, value: { ok: false, reason } };
}

export async function openRouterHealth(): Promise<ProviderHealth> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return { ok: false, reason: "no_key" };
  if (cache && Date.now() - cache.at < cache.ttl) return cache.value;

  let value: ProviderHealth;
  try {
    const res = await fetch(`${baseUrl()}/key`, {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (res.status === 401 || res.status === 403) value = { ok: false, reason: "down" };
    else if (res.status === 402 || res.status === 429) value = { ok: false, reason: "credits" };
    else if (!res.ok) value = { ok: false, reason: "down" };
    else {
      const body = (await res.json().catch(() => null)) as { data?: { limit_remaining?: number | null } } | null;
      const remaining = body?.data?.limit_remaining ?? null;
      value = remaining !== null && remaining <= 0 ? { ok: false, reason: "credits", creditsRemaining: 0 } : { ok: true, creditsRemaining: remaining };
    }
  } catch {
    value = { ok: false, reason: "down" };
  }
  cache = { at: Date.now(), ttl: value.ok ? OK_TTL : DOWN_TTL, value };
  return value;
}
