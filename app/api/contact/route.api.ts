import { clientIp } from "@/lib/agent/config";
import { ContactSchema } from "@/lib/contact";
import { contactLimiter } from "@/lib/rate-limit";
import { withCors, preflight } from "@/lib/agent/cors";

export const runtime = "nodejs";

function fail(status: number, code: string, message: string) {
  return Response.json({ code, message }, { status });
}

/**
 * Open Channel submissions.
 *
 * Integration point: set CONTACT_FORM_ENDPOINT to your form backend (Formspree, Web3Forms, Getform,
 * a Zapier/Make webhook, …). The message is forwarded server-side as JSON, so the endpoint never
 * reaches the browser. Until it is set, this returns `not_configured` and the UI offers email instead.
 */
export const OPTIONS = preflight;
export const POST = withCors(handle);

async function handle(req: Request) {
  if (Number(req.headers.get("content-length") ?? 0) > 16 * 1024) return fail(413, "invalid", "Message too large.");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, "invalid", "Invalid request.");
  }
  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) return fail(400, "invalid", parsed.error.issues[0]?.message ?? "Invalid message.");
  const v = parsed.data;

  // Bots fill the honeypot: pretend success, send nothing.
  if (v.website) return Response.json({ ok: true });

  const endpoint = process.env.CONTACT_FORM_ENDPOINT;
  if (!endpoint) return fail(503, "not_configured", "Messaging is not connected yet.");

  const rl = await contactLimiter.take(`ip:${clientIp(req)}`);
  if (!rl.ok) return fail(429, "rate_limited", "Too many messages. Please try again later.");

  const payload = {
    message: v.message,
    anonymous: v.anonymous,
    name: v.anonymous ? "" : v.name,
    email: v.anonymous ? "" : v.email,
    // Common form-service conventions (Formspree / Web3Forms): reply-to and subject.
    _replyto: v.anonymous ? undefined : v.email,
    _subject: `Open Channel${v.anonymous ? " (anonymous)" : v.name ? ` · ${v.name}` : ""}`,
    subject: "Open Channel message",
    source: "portfolio",
    sentAt: new Date().toISOString(),
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error("[contact] form endpoint responded", res.status);
      return fail(502, "upstream", "The message service didn't accept it.");
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[contact] form endpoint unreachable", err);
    return fail(502, "upstream", "The message service is unreachable.");
  }
}
