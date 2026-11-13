import "server-only";

/** OpenRouter's auto router picks the best available model per question. Pin one with OPENROUTER_MODEL. */
export const DEFAULT_MODEL = "openrouter/auto";

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "local";
}
