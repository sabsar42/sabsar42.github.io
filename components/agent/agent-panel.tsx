"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { AnimatePresence, LazyMotion, domAnimation, m } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type KeyboardEvent } from "react";
import {
  AGENT_LIMITS,
  type AgentErrorCode,
  type AgentStatus,
  type AgentUIMessage,
  type TraceData,
  type TraceSource,
  type WireMessage,
} from "@/lib/agent/types";
import { identity, suggestedQuestions } from "@/lib/content";
import { useReducedMotion } from "@/lib/hooks";
import { navigateTo } from "@/lib/navigate";
import me from "@/public/me.jpg";
import { BrandIcon } from "../brand-icon";
import { apiUrl, LOCAL_ONLY } from "@/lib/api";
import { localAgentResponse } from "@/lib/agent/local";
import { copyText } from "../copy-email";
import { ArrowRight, ArrowUp, CheckIcon, CloseIcon, CopyIcon, ResetIcon, StopIcon } from "../icons";
import { useSite } from "../providers";
import { Markdown } from "./markdown";
import { AnswerStatus, FALLBACK_TEXT, Provenance, Sources, modelName } from "./trace";

/* ------------------------------------------------------------------ */
/* Wire helpers                                                        */
/* ------------------------------------------------------------------ */

function textOf(m: AgentUIMessage): string {
  return m.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .trim();
}

function traceOf(m: AgentUIMessage): TraceData | null {
  for (const p of m.parts) if (p.type === "data-trace") return p.data;
  return null;
}

function toWire(messages: AgentUIMessage[]): WireMessage[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as WireMessage["role"],
      text: textOf(m).slice(0, m.role === "user" ? AGENT_LIMITS.userChars : AGENT_LIMITS.assistantChars),
    }))
    .filter((m) => m.text.length > 0)
    .slice(-AGENT_LIMITS.history);
}

/** Ask the API; if it can't be reached (or there is none, as on GitHub Pages) the Native Agent answers in the browser. */
const chatFetch: typeof fetch = async (input, init) => {
  const messages = (JSON.parse(String(init?.body ?? "{}")) as { messages?: WireMessage[] }).messages ?? [];
  if (LOCAL_ONLY) return localAgentResponse(messages, "offline");
  try {
    const res = await fetch(input, { ...init, signal: init?.signal ?? undefined });
    if (res.status >= 500) return localAgentResponse(messages, "offline");
    return res;
  } catch (err) {
    if (init?.signal?.aborted) throw err;
    return localAgentResponse(messages, "offline");
  }
};

const transport = new DefaultChatTransport<AgentUIMessage>({
  api: apiUrl("/api/chat"),
  fetch: chatFetch,
  prepareSendMessagesRequest: ({ messages }) => ({ body: { messages: toWire(messages) } }),
});

function errorCode(err: Error | undefined): AgentErrorCode | null {
  if (!err) return null;
  try {
    const parsed = JSON.parse(err.message) as { code?: AgentErrorCode };
    if (parsed.code) return parsed.code;
  } catch {
    /* not JSON */
  }
  if (["rate_limited", "model_unavailable", "invalid"].includes(err.message)) return err.message as AgentErrorCode;
  if (err.name === "TypeError" || /fetch|network|load failed/i.test(err.message)) return "network";
  return "model_unavailable";
}

const ERRORS: Record<AgentErrorCode, { title: string; detail: string; retry: boolean }> = {
  rate_limited: {
    title: "You've reached the hourly limit.",
    detail: `The agent allows a limited number of messages per hour. Try again later, or email ${identity.email}.`,
    retry: false,
  },
  model_unavailable: {
    title: "The model isn't responding right now.",
    detail: "This is usually temporary. Try again in a moment.",
    retry: true,
  },
  network: {
    title: "Network error.",
    detail: "Check your connection and try again.",
    retry: true,
  },
  timeout: {
    title: "No response after 20 seconds.",
    detail: "The model may be busy. Try again.",
    retry: true,
  },
  invalid: {
    title: "That message couldn't be sent.",
    detail: `Messages can be up to ${AGENT_LIMITS.userChars} characters.`,
    retry: false,
  },
};

const FIT_TEMPLATE = "Fit check for [role]. Requirements: ";

/** Follow-ups built from the sources an answer used (questions only, never facts). */
function followUps(sources: TraceSource[], asked: Set<string>): string[] {
  const out: string[] = [];
  for (const s of sources.slice(0, 3)) {
    const name = (s.label.split(" · ")[1] ?? "").replace(/…$/, "").trim();
    let q: string | null = null;
    if (s.id.startsWith("project-") && name) q = `How did he build ${name}?`;
    else if (s.id.startsWith("role-") && name) q = `What did he ship at ${name}?`;
    else if (s.id.startsWith("pub-") && s.id !== "pub-overview" && name) q = `What was his role in "${name}"?`;
    if (q && !asked.has(q.toLowerCase()) && !out.includes(q)) out.push(q);
  }
  const fit = "Is he a fit for a founding engineer role?";
  if (!asked.has(fit.toLowerCase())) out.push(fit);
  return out.slice(0, 2);
}

const DESKTOP = "(min-width: 768px)";
function subscribeDesktop(cb: () => void) {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function useIsDesktop() {
  return useSyncExternalStore(subscribeDesktop, () => window.matchMedia(DESKTOP).matches, () => true);
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select, summary, [tabindex]:not([tabindex="-1"])';

function CopyAnswer({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        if (await copyText(text)) {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1400);
        }
      }}
      aria-label={copied ? "Copied" : "Copy answer"}
      className="inline-flex size-6 items-center justify-center rounded-full text-faint transition-colors duration-150 hover:bg-hover hover:text-fg"
    >
      {copied ? <CheckIcon size={12} className="text-brand" /> : <CopyIcon size={12} />}
    </button>
  );
}

/** Live status: green while OpenRouter answers, amber when the native agent has taken over. */
function StatusPill({ status }: { status: AgentStatus | null }) {
  if (!status) {
    return <span className="font-mono text-[11px] text-faint">checking status…</span>;
  }
  if (status.agent === "openrouter") {
    return (
      <span className="inline-flex flex-wrap items-center gap-x-1.5 font-mono text-[11px] text-faint">
        <span aria-hidden="true" className="relative flex size-1.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-live opacity-70 motion-reduce:hidden" />
          <span className="relative size-1.5 rounded-full bg-live" />
        </span>
        <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-ship hover:underline">
          <BrandIcon slug="openrouter" size={10} tint={false} />
          OpenRouter online
        </a>
        <span title="Model messages you have left this hour; after that the native agent answers.">
          · {status.remaining}/{status.limit} left this hour
        </span>
        {status.model && <span className="hidden sm:inline">· {modelName(status.model)}</span>}
      </span>
    );
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 font-mono text-[11px] text-faint">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-data" />
      <span className="text-data">Native agent</span>
      <span>· {status.fallback ? FALLBACK_TEXT[status.fallback] : "OpenRouter unavailable"}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Panel                                                               */
/* ------------------------------------------------------------------ */

export default function AgentPanel() {
  const { agentOpen, closeAgent, pendingQuestion, consumeQuestion, agentMode, setAgentMode } = useSite();
  const { messages, sendMessage, status, error, stop, setMessages, clearError, regenerate } = useChat<AgentUIMessage>({
    transport,
  });

  const [input, setInput] = useState("");
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [timedOutFor, setTimedOutFor] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const consumed = useRef(0);
  const isDesktop = useIsDesktop();
  const reduced = useReducedMotion();

  const busy = status === "submitted" || status === "streaming";
  const last = messages[messages.length - 1];
  const lastUserId = [...messages].reverse().find((msg) => msg.role === "user")?.id ?? null;
  const timedOut = timedOutFor !== null && timedOutFor === lastUserId && !busy;
  const code: AgentErrorCode | null = timedOut ? "timeout" : errorCode(error);

  const send = useCallback(
    (text: string) => {
      const t = text.trim().slice(0, AGENT_LIMITS.userChars);
      if (!t) return;
      if (error) clearError();
      void sendMessage({ text: t });
    },
    [error, clearError, sendMessage],
  );

  const startFitCheck = useCallback(() => {
    setInput(FIT_TEMPLATE);
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      // Select "[role]" so the visitor can type straight over it.
      const at = FIT_TEMPLATE.indexOf("[role]");
      el.setSelectionRange(at, at + 6);
    });
  }, []);

  // A question from the palette or terminal, or a fit-check request, arrives here.
  useEffect(() => {
    if (!pendingQuestion || consumed.current === pendingQuestion.id) return;
    consumed.current = pendingQuestion.id;
    consumeQuestion(pendingQuestion.id);
    const q = pendingQuestion.text;
    // Send outside the effect body: stop any running answer first.
    void (busy ? stop() : Promise.resolve()).then(() => send(q));
  }, [pendingQuestion, consumeQuestion, busy, stop, send]);

  useEffect(() => {
    if (!agentOpen || agentMode !== "fit") return;
    void Promise.resolve().then(() => {
      setAgentMode("ask");
      startFitCheck();
    });
  }, [agentOpen, agentMode, setAgentMode, startFitCheck]);

  // Which agent is live, and this visitor's remaining budget: on open and after every answer.
  useEffect(() => {
    if (!agentOpen || status === "submitted" || status === "streaming") return;
    const ctrl = new AbortController();
    const offline: AgentStatus = { agent: "native", fallback: "offline", remaining: 0, limit: 0, resetAt: 0 };
    const request = LOCAL_ONLY
      ? Promise.resolve(offline)
      : fetch(apiUrl("/api/agent/status"), { signal: ctrl.signal, cache: "no-store" })
          .then((r) => (r.ok ? (r.json() as Promise<AgentStatus>) : offline))
          .catch(() => offline);
    void request.then((st) => {
      if (!ctrl.signal.aborted) setAgentStatus(st);
    });
    return () => ctrl.abort();
  }, [agentOpen, status, messages.length]);

  // Never hang silently: give up if no answer text has arrived 20s after sending.
  const waitingForText = busy && !(last?.role === "assistant" && textOf(last).length > 0);
  useEffect(() => {
    if (!waitingForText) return;
    const id = lastUserId;
    const t = window.setTimeout(() => {
      void stop();
      setTimedOutFor(id);
    }, 20_000);
    return () => window.clearTimeout(t);
  }, [waitingForText, lastUserId, stop]);

  // Lock page scroll and move focus into the dialog while open.
  useEffect(() => {
    if (!agentOpen) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => {
      if (isDesktop) inputRef.current?.focus({ preventScroll: true });
      else panelRef.current?.focus({ preventScroll: true });
    });
    return () => {
      html.style.overflow = prev;
      cancelAnimationFrame(raf);
    };
  }, [agentOpen, isDesktop]);

  // Follow the stream if the reader is already near the bottom.
  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 160) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      closeAgent();
      return;
    }
    if (e.key !== "Tab" || !panelRef.current) return;
    const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (n) => n.offsetParent !== null,
    );
    if (!nodes.length) return;
    const first = nodes[0];
    const lastNode = nodes[nodes.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
      e.preventDefault();
      lastNode.focus();
    } else if (!e.shiftKey && document.activeElement === lastNode) {
      e.preventDefault();
      first.focus();
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    send(input);
    setInput("");
  };

  const onInputKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  const reset = () => {
    void stop();
    setMessages([]);
    clearError();
    setTimedOutFor(null);
    setInput("");
    inputRef.current?.focus();
  };

  const retry = () => {
    clearError();
    setTimedOutFor(null);
    void regenerate();
  };

  const onSource = (s: TraceSource) => {
    closeAgent({ restoreFocus: false });
    navigateTo(s.target);
  };

  const waitingForFirstEvent = status === "submitted" && last?.role === "user";
  const asked = new Set(messages.filter((msg) => msg.role === "user").map((msg) => textOf(msg).toLowerCase()));
  const lastTrace = last?.role === "assistant" ? traceOf(last) : null;
  const suggestions = !busy && !code && lastTrace?.stage === "done" ? followUps(lastTrace.sources, asked) : [];

  const motionProps = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }
    : {
        initial: { opacity: 0, scale: 0.97, y: 16 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.98, y: 8, transition: { duration: 0.16, ease: [0.22, 1, 0.36, 1] as const } },
        transition: { type: "spring" as const, stiffness: 460, damping: 36, mass: 0.7 },
      };

  return (
    <LazyMotion features={domAnimation} strict>
      <AnimatePresence>
        {agentOpen && (
          <m.div
            key="scrim"
            aria-hidden="true"
            className="fixed inset-0 z-50 bg-(--scrim)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => closeAgent()}
          />
        )}
        {agentOpen && (
          <div key="frame" className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center md:p-8">
            <m.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="agent-title"
              tabIndex={-1}
              onKeyDown={onKeyDown}
              {...motionProps}
              className="agent-console pointer-events-auto relative flex h-svh w-full flex-col overflow-hidden bg-raised outline-none md:h-[min(600px,calc(100svh-96px))] md:max-w-[600px] md:rounded-[20px] md:border md:border-line-strong"
            >
              <div aria-hidden="true" className={`h-[2px] shrink-0 bg-grad ${busy ? "animate-pulse" : ""}`} />

              <header className="flex shrink-0 items-center justify-between gap-3 px-4 pb-3 pt-3.5 md:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="relative size-9 shrink-0">
                    <span aria-hidden="true" className="photo-orbit" />
                    <Image src={me} alt="" width={36} height={36} sizes="36px" className="size-9 rounded-full object-cover" />
                  </span>
                  <div className="min-w-0">
                    <h2 id="agent-title" className="truncate text-[15px] font-semibold leading-tight text-fg">
                      Shakib&apos;s agent
                    </h2>
                    <div className="mt-0.5">
                      <StatusPill status={agentStatus} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {messages.length > 0 && (
                    <button
                      type="button"
                      onClick={reset}
                      aria-label="Start a new conversation"
                      title="New conversation"
                      className="inline-flex size-9 items-center justify-center rounded-full text-muted transition-colors duration-150 hover:bg-hover hover:text-fg"
                    >
                      <ResetIcon />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => closeAgent()}
                    aria-label="Close agent"
                    className="inline-flex size-9 items-center justify-center rounded-full text-muted transition-colors duration-150 hover:bg-hover hover:text-fg"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </header>

              <div
                ref={logRef}
                role="log"
                aria-live="polite"
                aria-busy={busy}
                aria-label="Conversation"
                className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-4 md:px-6"
              >
                {messages.length === 0 ? (
                  <div className="flex min-h-full flex-col justify-center pb-2">
                    <p className="text-[22px] font-semibold leading-[1.15] tracking-[-0.025em] text-fg md:text-[25px]">
                      Ask me anything about
                      <br />
                      Shakib&apos;s <span className="text-grad">work</span>.
                    </p>
                    <p className="mt-3 max-w-[46ch] text-[14px] leading-relaxed text-muted">
                      I answer only from what&apos;s on this site, and every answer shows its sources. If I don&apos;t know,
                      I&apos;ll say so.
                    </p>
                    <ul className="mt-5 grid gap-1.5 sm:grid-cols-2">
                      {suggestedQuestions.map((q) => (
                        <li key={q}>
                          <button
                            type="button"
                            onClick={() => send(q)}
                            className="spotlight group flex h-full w-full items-center justify-between gap-2 rounded-[12px] border border-line bg-bg px-3 py-2 text-left text-[13px] text-fg transition-colors duration-150 hover:border-brand/50"
                          >
                            {q}
                            <ArrowRight
                              size={13}
                              className="shrink-0 text-faint transition-[color,transform] duration-150 group-hover:translate-x-0.5 group-hover:text-brand"
                            />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={startFitCheck}
                      className="mt-3 inline-flex items-center gap-1.5 self-start rounded-full px-1 text-[13px] font-medium text-brand transition-opacity duration-150 hover:opacity-80"
                    >
                      Hiring? Run a fit check for your role
                      <ArrowRight size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((msg, i) => {
                      const isLast = i === messages.length - 1;
                      if (msg.role === "user") {
                        return (
                          <div key={msg.id} className="flex justify-end">
                            <p className="max-w-[85%] whitespace-pre-wrap wrap-break-word rounded-[16px] rounded-br-[4px] bg-hover px-3.5 py-2 text-[14.5px] leading-[1.55] text-fg">
                              {textOf(msg)}
                            </p>
                          </div>
                        );
                      }
                      const text = textOf(msg);
                      const trace = traceOf(msg);
                      const live = isLast && busy;
                      const interrupted = !live && trace?.stage !== "done";
                      return (
                        <div key={msg.id} className="space-y-3">
                          {live && !text && <AnswerStatus trace={trace} pending={false} />}
                          {text && <Markdown text={text} streaming={isLast && status === "streaming"} />}
                          {!live && (
                            <div className="space-y-2">
                              <Sources sources={trace?.sources ?? []} onSource={onSource} />
                              <div className="flex items-start gap-1">
                                {text && <CopyAnswer text={text} />}
                                <Provenance trace={trace} failed={interrupted} />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {waitingForFirstEvent && <AnswerStatus trace={null} pending />}

                    {code && (
                      <div role="alert" className="rounded-[12px] border border-brand/40 bg-brand/5 p-3.5 text-[13.5px]">
                        <p className="font-medium text-fg">{ERRORS[code].title}</p>
                        <p className="mt-1 text-muted">{ERRORS[code].detail}</p>
                        {ERRORS[code].retry && (
                          <button
                            type="button"
                            onClick={retry}
                            className="mt-3 inline-flex h-7 items-center rounded-full border border-line-strong px-3 font-mono text-[12px] text-fg transition-colors duration-150 hover:border-brand hover:text-brand"
                          >
                            Try again
                          </button>
                        )}
                      </div>
                    )}

                    {suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {suggestions.map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => send(q)}
                            className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-line px-3 py-1 text-left text-[12.5px] text-muted transition-colors duration-150 hover:border-brand/60 hover:text-fg"
                          >
                            <ArrowRight size={12} className="shrink-0 text-brand" />
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <form onSubmit={onSubmit} className="shrink-0 px-3 pb-[calc(12px+env(safe-area-inset-bottom))] md:px-6 md:pb-5">
                <div className="flex items-end gap-2 rounded-[18px] border border-line-strong bg-bg py-2 pl-4 pr-2 transition-[border-color,box-shadow] duration-150 focus-within:border-brand/70 focus-within:shadow-[0_0_0_4px_var(--brand-glow)]">
                  <label htmlFor="agent-input" className="sr-only">
                    Ask about Shakib&apos;s work
                  </label>
                  <textarea
                    id="agent-input"
                    ref={inputRef}
                    rows={1}
                    value={input}
                    maxLength={AGENT_LIMITS.userChars}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onInputKey}
                    placeholder="Ask about Shakib's work…"
                    className="field-sizing-content max-h-32 min-h-[28px] flex-1 resize-none bg-transparent py-1 text-[16px] leading-[1.5] text-fg outline-none placeholder:text-faint focus-visible:outline-none md:text-[14.5px]"
                  />
                  {busy ? (
                    <button
                      type="button"
                      onClick={() => void stop()}
                      aria-label="Stop generating"
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-fg text-bg transition-opacity duration-150 hover:opacity-85"
                    >
                      <StopIcon size={14} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      aria-label="Send message"
                      className="btn-brand inline-flex size-8 shrink-0 items-center justify-center rounded-full disabled:bg-none disabled:bg-line-strong disabled:text-faint disabled:shadow-none"
                    >
                      <ArrowUp size={15} />
                    </button>
                  )}
                </div>
                <p className="mt-2 flex items-center justify-between gap-2 px-1 font-mono text-[10.5px] text-faint">
                  <span>Answers come only from this site · it never invents facts</span>
                  {input.length > AGENT_LIMITS.userChars - 100 && (
                    <span className="tabular" aria-live="polite">
                      {input.length}/{AGENT_LIMITS.userChars}
                    </span>
                  )}
                </p>
              </form>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
