import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { chunks } from "../knowledge/chunks";
import { retrieve } from "../knowledge/bm25";
import { retrieveFit } from "../knowledge/fit";
import { nativeAnswer } from "./native";
import type { AgentUIMessage, FallbackReason, TraceSource, WireMessage } from "./types";

/**
 * The Native Agent, running entirely in the browser. Used when the API can't be reached, and on the
 * static GitHub Pages build. Same retrieval, same answers, same stream format as /api/chat.
 */
export function localAgentResponse(messages: WireMessage[], fallback: FallbackReason): Response {
  const user = messages.filter((m) => m.role === "user");
  const question = user[user.length - 1]?.text ?? "";
  const previous = user.length > 1 ? user[user.length - 2].text : "";
  const hits = /^fit check\b/i.test(question) ? retrieveFit(question) : retrieve(question, previous);
  const top = hits[0]?.score ?? 1;
  const sources: TraceSource[] = hits.map((h) => ({
    id: h.chunk.id,
    target: h.chunk.target,
    label: h.chunk.label,
    domain: h.chunk.domain,
    score: Math.round((h.score / top) * 100) / 100,
  }));
  const started = Date.now();

  const stream = createUIMessageStream<AgentUIMessage>({
    execute: async ({ writer }) => {
      const trace = (stage: "understood" | "retrieved" | "writing" | "done", ms?: number) =>
        writer.write({
          type: "data-trace",
          id: "trace",
          data: { stage, sources: stage === "understood" ? [] : sources, searched: chunks.length, context: sources.length, agent: "native", fallback, ms },
        });
      writer.write({ type: "start" });
      trace("understood");
      trace("retrieved");
      trace("writing");
      const answer = nativeAnswer(question, hits);
      writer.write({ type: "text-start", id: "answer" });
      const parts = answer.match(/\S+\s*/g) ?? [answer];
      for (let i = 0; i < parts.length; i += 4) {
        writer.write({ type: "text-delta", id: "answer", delta: parts.slice(i, i + 4).join("") });
        await new Promise((r) => setTimeout(r, 12));
      }
      writer.write({ type: "text-end", id: "answer" });
      trace("done", Date.now() - started);
      writer.write({ type: "finish" });
    },
    onError: () => "model_unavailable",
  });
  return createUIMessageStreamResponse({ stream });
}
