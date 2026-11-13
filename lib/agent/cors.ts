/**
 * CORS for the API routes, so the GitHub Pages site (a different origin) can call this deployment.
 * Only listed origins get an Allow-Origin header. Override with ALLOWED_ORIGINS (comma-separated).
 */
const configured = (process.env.ALLOWED_ORIGINS ?? "https://sabsar42.github.io")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);
const dev = process.env.NODE_ENV !== "production" ? ["http://localhost:3000", "http://localhost:3100", "http://localhost:3300"] : [];
const ALLOWED = new Set([...configured, ...dev]);

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  const h: Record<string, string> = { Vary: "Origin" };
  if (origin && ALLOWED.has(origin)) h["Access-Control-Allow-Origin"] = origin;
  return h;
}

export function preflight(req: Request): Response {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(req),
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export function withCors(handler: (req: Request) => Response | Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    const res = await handler(req);
    for (const [k, v] of Object.entries(corsHeaders(req))) res.headers.set(k, v);
    return res;
  };
}
