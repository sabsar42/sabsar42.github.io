import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createUIMessageStream, createUIMessageStreamResponse, streamText, type ModelMessage } from "ai";
import { z } from "zod";
import { buildSystemPrompt } from "@/lib/agent/prompt";
import { DEFAULT_MODEL, clientIp } from "@/lib/agent/config";
import { markOpenRouterDown, openRouterHealth } from "@/lib/agent/health";
import { nativeAnswer } from "@/lib/agent/native";
import {
  AGENT_LIMITS,
  type AgentKind,
  type AgentUIMessage,
  type FallbackReason,
  type TraceData,
  type TraceSource,
} from "@/lib/agent/types";
import { chunkById, chunks } from "@/lib/knowledge/chunks";
import { retrieve } from "@/lib/knowledge/bm25";
import { retrieveFit } from "@/lib/knowledge/fit";
import { chatLimiter, nativeLimiter } from "@/lib/rate-limit";
import { withCors, preflight } from "@/lib/agent/cors";

export const runtime = "nodejs";
export const maxDuration = 30;

/** Give up on the model (and let the native agent answer) if no text arrives in this long. */
const FIRST_TOKEN_TIMEOUT_MS = 15_000;
const MAX_BODY_BYTES = 32 * 1024;

const Body = z
  .object({
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          text: z.string().trim().min(1).max(AGENT_LIMITS.assistantChars),
        }),
      )
      .min(1)
      .max(AGENT_LIMITS.history),
  })
  .superRefine(({ messages }, ctx) => {
    if (messages[messages.length - 1].role !== "user") {
      ctx.addIssue({ code: "custom", message: "The last message must be from the user." });
    }
    messages.forEach((m, i) => {
      if (m.role === "user" && m.text.length > AGENT_LIMITS.userChars) {
        ctx.addIssue({ code: "custom", path: ["messages", i, "text"], message: `Max ${AGENT_LIMITS.userChars} characters.` });
      }
    });
  });

function fail(status: number, code: string, message: string, headers: Record<string, string> = {}) {
  return Response.json({ code, message }, { status, headers });
}

export const OPTIONS = preflight;
export const POST = withCors(handle);

async function handle(req: Request) {
  // 1. Validate
  const length = Number(req.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return fail(413, "invalid", "Request too large.");

  let parsed: z.infer<typeof Body>;
  try {
    const result = Body.safeParse(await req.json());
    if (!result.success) {
      return fail(400, "invalid", result.error.issues[0]?.message ?? "Invalid request.");
    }
    parsed = result.data;
  } catch {
    return fail(400, "invalid", "Invalid JSON.");
  }

  // 2. Who answers: OpenRouter while it's healthy and this visitor has budget, otherwise the native agent.
  const ip = `ip:${clientIp(req)}`;
  const health = await openRouterHealth();
  let agent: AgentKind = "native";
  let fallback: FallbackReason | undefined;
  let remaining = 0;
  if (health.ok) {
    const rl = await chatLimiter.take(ip);
    if (rl.ok) {
      agent = "openrouter";
      remaining = rl.remaining;
    } else {
      fallback = "visitor_limit";
    }
  } else {
    fallback = health.reason === "credits" ? "credits" : "offline";
  }
  if (agent === "native") {
    const nl = await nativeLimiter.take(ip);
    if (!nl.ok) {
      const retryAfter = Math.max(1, Math.ceil((nl.reset - Date.now()) / 1000));
      return fail(429, "rate_limited", "Too many messages. Please try again later.", { "Retry-After": String(retryAfter) });
    }
  }
  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

  // 3. Retrieve
  const { messages } = parsed;
  const userTurns = messages.filter((m) => m.role === "user");
  const question = userTurns[userTurns.length - 1].text;
  const previous = userTurns.length > 1 ? userTurns[userTurns.length - 2].text : "";
  const hits = /^fit check\b/i.test(question) ? retrieveFit(question) : retrieve(question, previous);

  const top = hits[0]?.score ?? 1;
  const sources: TraceSource[] = hits.map((h) => ({
    id: h.chunk.id,
    target: h.chunk.target,
    label: h.chunk.label,
    domain: h.chunk.domain,
    score: Math.round((h.score / top) * 100) / 100,
  }));
  // Identity + contact are always available so the model can introduce him and point to his email.
  const context = [...hits.map((h) => h.chunk)];
  for (const id of ["identity", "contact"]) {
    const c = chunkById.get(id);
    if (c && !context.includes(c)) context.push(c);
  }
  const started = Date.now();

  // 4. Stream: real trace steps first, then the answer.
  const stream = createUIMessageStream<AgentUIMessage>({
    execute: async ({ writer }) => {
      const trace = (data: Partial<TraceData> & Pick<TraceData, "stage">) =>
        writer.write({
          type: "data-trace",
          id: "trace",
          data: {
            sources,
            searched: chunks.length,
            context: context.length,
            agent,
            fallback,
            model: agent === "openrouter" ? model : undefined,
            routedFrom: agent === "openrouter" && model === "openrouter/auto" ? model : undefined,
            ...data,
          },
        });
      let routedModel: string | undefined;
      const TEXT = "answer";
      let opened = false;
      const delta = (text: string) => {
        if (!opened) {
          writer.write({ type: "text-start", id: TEXT });
          opened = true;
        }
        writer.write({ type: "text-delta", id: TEXT, delta: text });
      };
      /* The native answer is extractive and instant; stream it in small pieces so it reads like the model. */
      const writeNative = async (prefix = "") => {
        const answer = prefix + nativeAnswer(question, hits);
        const parts = answer.match(/\S+\s*/g) ?? [answer];
        for (let i = 0; i < parts.length; i += 4) {
          delta(parts.slice(i, i + 4).join(""));
          await new Promise((r) => setTimeout(r, 12));
        }
      };

      // Open the assistant message first so trace parts and text land in the same message.
      writer.write({ type: "start" });
      trace({ stage: "understood", sources: [] });
      trace({ stage: "retrieved" });
      trace({ stage: "writing" });

      if (agent === "openrouter") {
        const openrouter = createOpenRouter({
          apiKey: process.env.OPENROUTER_API_KEY,
          baseURL: process.env.OPENROUTER_BASE_URL || undefined,
        });
        const abort = new AbortController();
        req.signal.addEventListener("abort", () => abort.abort());
        const timer = setTimeout(() => abort.abort(), FIRST_TOKEN_TIMEOUT_MS);
        let gotText = false;
        let failed = false;
        let result: ReturnType<typeof streamText> | null = null;
        try {
          result = streamText({
            model: openrouter(model),
            instructions: buildSystemPrompt(context),
            messages: messages.map((m): ModelMessage => ({ role: m.role, content: m.text })),
            maxOutputTokens: 600,
            temperature: 0.2,
            maxRetries: 1,
            abortSignal: abort.signal,
          });
          for await (const part of result.fullStream) {
            if (part.type === "text-delta" && part.text) {
              if (!gotText) clearTimeout(timer);
              gotText = true;
              delta(part.text);
            } else if (part.type === "error") {
              failed = true;
              console.error("[chat] model error", part.error);
              break;
            }
          }
        } catch (err) {
          failed = true;
          console.error("[chat] model call failed", err);
        } finally {
          clearTimeout(timer);
        }
        if (req.signal.aborted) return;

        // With the auto router, the model that actually answered is reported in the response.
        if (!failed && gotText && result) {
          try {
            const meta = await result.response;
            if (meta.modelId) routedModel = meta.modelId;
          } catch {
            /* keep the requested model name */
          }
        }

        if (failed || !gotText) {
          // Fail over: mark OpenRouter down briefly and let the native agent answer this turn.
          markOpenRouterDown();
          agent = "native";
          fallback = "model_error";
          trace({ stage: "writing" });
          await writeNative(gotText ? "\n\n---\n\n*The model stopped mid-answer; the native agent finished it:*\n\n" : "");
        }
      } else {
        await writeNative();
      }

      if (opened) writer.write({ type: "text-end", id: TEXT });
      trace({ stage: "done", ms: Date.now() - started, ...(routedModel ? { model: routedModel } : {}) });
      writer.write({ type: "finish" });
    },
    onError: (err) => {
      console.error("[chat] stream error", err);
      return "model_unavailable";
    },
  });

  return createUIMessageStreamResponse({
    stream,
    headers: { "X-Agent": agent, "X-RateLimit-Remaining": String(remaining) },
  });
}

export const GET = withCors(() => fail(405, "invalid", "Use POST."));
