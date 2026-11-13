import type { UIMessage } from "ai";
import type { Domain } from "../content";

/** A retrieved chunk the UI can link to. `target` is a DOM id on the page. */
export type TraceSource = {
  id: string;
  target: string;
  label: string;
  /** Color for the chip. */
  domain: Domain;
  /** BM25 relevance, normalised so the best source is 1. */
  score: number;
};

export type TraceStage = "understood" | "retrieved" | "writing" | "done";

export type TraceData = {
  stage: TraceStage;
  sources: TraceSource[];
  /** Total server time in ms, set on "done". */
  ms?: number;
  /** OpenRouter model id that wrote the answer, e.g. "anthropic/claude-haiku-5.5". */
  model?: string;
  /** Set when the model was chosen by OpenRouter's auto router (then `model` is the one it picked). */
  routedFrom?: string;
  /** Who wrote the answer. */
  agent?: AgentKind;
  /** Why the native agent answered instead of OpenRouter. */
  fallback?: FallbackReason;
  /** Chunks searched and chunks sent to the model (sources + always-on identity/contact). */
  searched?: number;
  context?: number;
};

export type AgentUIMessage = UIMessage<never, { trace: TraceData }>;

export type AgentKind = "openrouter" | "native";
export type FallbackReason = "offline" | "credits" | "visitor_limit" | "model_error";

/** GET /api/agent/status */
export type AgentStatus = {
  agent: AgentKind;
  fallback?: FallbackReason;
  model?: string;
  /** This visitor's remaining OpenRouter messages this hour, and the cap. */
  remaining: number;
  limit: number;
  resetAt: number;
};

export type AgentErrorCode = "rate_limited" | "model_unavailable" | "network" | "invalid" | "timeout";

export const AGENT_LIMITS = {
  userChars: 500,
  assistantChars: 2000,
  history: 10,
} as const;

/** Wire format sent to /api/chat (plain text only; the server never trusts client-side parts). */
export type WireMessage = { role: "user" | "assistant"; text: string };
