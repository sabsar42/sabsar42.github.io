"use client";

import type { FallbackReason, TraceData, TraceSource } from "@/lib/agent/types";
import { BrandIcon } from "../brand-icon";

/** Short model name for display: "anthropic/claude-haiku-5.5" → "claude-haiku-5.5". */
export function modelName(id?: string) {
  return id ? (id.split("/").pop() ?? id) : null;
}

export const FALLBACK_TEXT: Record<FallbackReason, string> = {
  offline: "OpenRouter is offline",
  credits: "OpenRouter's limit is used up",
  visitor_limit: "your hourly model limit is used",
  model_error: "the model didn't respond",
};

/** One live line while the agent works. Every state maps to a real server event. */
export function AnswerStatus({ trace, pending }: { trace: TraceData | null; pending: boolean }) {
  const stage = trace?.stage;
  const n = trace?.sources.length ?? 0;
  const text =
    pending || !trace || stage === "understood"
      ? "Searching Shakib's work…"
      : stage === "retrieved"
        ? `Found ${n} ${n === 1 ? "source" : "sources"}…`
        : trace.agent === "native"
          ? `Native agent is reading ${n} ${n === 1 ? "source" : "sources"}…`
          : `Reading ${n} ${n === 1 ? "source" : "sources"} and writing…`;
  return (
    <p className="flex items-center gap-2 text-[13.5px]" role="status">
      <span aria-hidden="true" className="relative flex size-2">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand opacity-60 motion-reduce:hidden" />
        <span className="relative size-2 rounded-full bg-grad" />
      </span>
      <span className="shimmer-text font-medium">{text}</span>
    </p>
  );
}

export function Sources({ sources, onSource }: { sources: TraceSource[]; onSource: (s: TraceSource) => void }) {
  if (!sources.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-0.5 font-mono text-[11px] text-faint">Sources</span>
      {sources.map((s, i) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onSource(s)}
          title={`Jump to ${s.label} on this page`}
          className="inline-flex h-6 max-w-full items-center gap-1.5 truncate rounded-full border border-line-strong px-2 text-[11.5px] text-muted transition-colors duration-150 hover:border-brand hover:text-fg"
        >
          <span className="tabular font-mono text-[10px] text-brand">{i + 1}</span>
          <span className="truncate">{s.label}</span>
        </button>
      ))}
    </div>
  );
}

/** Who answered, with the full trace one click away. */
export function Provenance({ trace, failed }: { trace: TraceData | null; failed: boolean }) {
  const model = modelName(trace?.model);
  const native = trace?.agent === "native";
  const secs = trace?.ms !== undefined ? ` · ${(trace.ms / 1000).toFixed(1)}s` : "";
  return (
    <details className="group text-[11.5px] text-faint">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-full py-0.5 font-mono transition-colors duration-150 hover:text-fg [&::-webkit-details-marker]:hidden">
        {failed ? (
          "interrupted"
        ) : native ? (
          <>
            <span aria-hidden="true" className="size-1.5 rounded-full bg-data" />
            <span className="text-data">Native agent</span>
            {secs}
          </>
        ) : (
          <>
            <BrandIcon slug="openrouter" size={11} tint={false} />
            via OpenRouter{model ? ` · ${model}` : ""}
            {secs}
          </>
        )}
        <span className="text-faint/70 group-open:hidden">· how?</span>
      </summary>
      <ol className="mt-2 space-y-1 border-l border-brand/40 pl-3 font-mono">
        <li>1. Matched the question against {trace?.searched ?? "every"} facts from this site (BM25).</li>
        <li>2. Picked the {trace?.sources.length ?? 0} most relevant as sources.</li>
        {native ? (
          <li>
            3. The native agent quoted the best-matching sentences from those facts. No language model
            {trace?.fallback ? `, because ${FALLBACK_TEXT[trace.fallback]}` : ""}.
          </li>
        ) : (
          <li>
            3. {model ?? "The model"} wrote the answer from {trace?.context ?? "those"} facts only, through OpenRouter.
          </li>
        )}
      </ol>
    </details>
  );
}
