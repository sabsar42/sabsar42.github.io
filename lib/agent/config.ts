import "server-only";

/** Fast, inexpensive default; override with OPENROUTER_MODEL. */
export const DEFAULT_MODEL = "anthropic/claude-haiku-5.5";

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "local";
}
