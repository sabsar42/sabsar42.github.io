import { DEFAULT_MODEL, clientIp } from "@/lib/agent/config";
import { openRouterHealth } from "@/lib/agent/health";
import type { AgentStatus } from "@/lib/agent/types";
import { chatLimiter } from "@/lib/rate-limit";
import { withCors, preflight } from "@/lib/agent/cors";

export const runtime = "nodejs";

/** Which agent will answer this visitor right now, and how many model messages they have left this hour. */
export const dynamic = "force-dynamic";
export const OPTIONS = preflight;
export const GET = withCors(handle);

async function handle(req: Request) {
  const [health, budget] = await Promise.all([openRouterHealth(), chatLimiter.peek(`ip:${clientIp(req)}`)]);
  const status: AgentStatus = health.ok && budget.ok
    ? { agent: "openrouter", model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL, remaining: budget.remaining, limit: budget.limit, resetAt: budget.reset }
    : {
        agent: "native",
        fallback: !health.ok ? (health.reason === "credits" ? "credits" : "offline") : "visitor_limit",
        remaining: budget.remaining,
        limit: budget.limit,
        resetAt: budget.reset,
      };
  return Response.json(status, { headers: { "Cache-Control": "no-store" } });
}
