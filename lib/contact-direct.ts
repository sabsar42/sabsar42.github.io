import type { ContactErrorCode } from "./contact";

/**
 * Browser-direct submission (Web3Forms-style). Web3Forms' free plan only accepts requests made from the
 * visitor's browser, and its access key is designed to be public, so this runs client-side.
 * Set NEXT_PUBLIC_CONTACT_ACCESS_KEY (and optionally NEXT_PUBLIC_CONTACT_ENDPOINT) at build time.
 */
export const DIRECT_KEY = process.env.NEXT_PUBLIC_CONTACT_ACCESS_KEY ?? "";
const DIRECT_URL = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT || "https://api.web3forms.com/submit";

export type DirectInput = { message: string; anonymous: boolean; name: string; email: string };
export type DirectResult = { ok: true } | { ok: false; code: ContactErrorCode; message?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function sendDirect(v: DirectInput): Promise<DirectResult> {
  const message = v.message.trim();
  if (message.length < 2) return { ok: false, code: "invalid", message: "Write a message first." };
  if (message.length > 2000) return { ok: false, code: "invalid", message: "Keep it under 2,000 characters." };
  const email = v.email.trim();
  if (!v.anonymous && !EMAIL.test(email)) {
    return { ok: false, code: "invalid", message: "Add a valid email so he can reply, or send anonymously." };
  }
  const name = v.name.trim().slice(0, 80);
  const who = v.anonymous ? "Anonymous visitor" : name || email;
  try {
    const res = await fetch(DIRECT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: DIRECT_KEY,
        subject: `Open Channel · ${who}`,
        from_name: who,
        name: v.anonymous ? "" : name,
        ...(v.anonymous ? {} : { email }),
        message,
        anonymous: v.anonymous ? "yes" : "no",
        source: "sabsar42.github.io",
      }),
    });
    const body = (await res.json().catch(() => null)) as { success?: boolean } | null;
    if (res.ok && body?.success !== false) return { ok: true };
    return { ok: false, code: res.status === 429 ? "rate_limited" : "upstream" };
  } catch {
    return { ok: false, code: "network" };
  }
}
