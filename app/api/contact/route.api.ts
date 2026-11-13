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

  // Shaped for Web3Forms (access_key, subject, from_name, email, message). Other form services ignore the extras.
  const accessKey = process.env.CONTACT_FORM_ACCESS_KEY;
  const who = v.anonymous ? "Anonymous visitor" : v.name || v.email;
  const payload = {
    ...(accessKey ? { access_key: accessKey } : {}),
    subject: `Open Channel · ${who}`,
    from_name: who,
    name: v.anonymous ? "" : v.name,
    ...(v.anonymous ? {} : { email: v.email }),
    message: v.message,
    anonymous: v.anonymous ? "yes" : "no",
    source: "sabsar42.github.io",
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    const body = (await res.json().catch(() => null)) as { success?: boolean; message?: string } | null;
    if (!res.ok || body?.success === false) {
      console.error("[contact] form endpoint responded", res.status, body?.message);
      return fail(502, "upstream", "The message service didn't accept it.");
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[contact] form endpoint unreachable", err);
    return fail(502, "upstream", "The message service is unreachable.");
  }
}
