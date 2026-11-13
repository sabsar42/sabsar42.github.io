"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { identity } from "@/lib/content";
import { apiUrl, LOCAL_ONLY } from "@/lib/api";
import type { ContactErrorCode } from "@/lib/contact";
import { DIRECT_KEY, sendDirect } from "@/lib/contact-direct";
import { ArrowRight, CheckIcon } from "./icons";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; anonymous: boolean } | { kind: "error"; code: ContactErrorCode; message?: string };

const MAX = 2000;

/**
 * "Open Channel": a direct line to Shakib for projects, roles, consulting, or just a hello.
 * Posts straight from the browser when NEXT_PUBLIC_CONTACT_ACCESS_KEY is set (Web3Forms); otherwise via /api/contact.
 */
export function OpenChannel({ idPrefix, className = "" }: { idPrefix: string; className?: string }) {
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  const id = (s: string) => `${idPrefix}-${s}`;
  const mailto = `mailto:${identity.email}?subject=${encodeURIComponent("Hello from your site")}&body=${encodeURIComponent(message)}`;

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (state.kind === "sending") return;
    // Bots fill the hidden honeypot: pretend it worked, send nothing.
    if (website) {
      setState({ kind: "sent", anonymous });
      return;
    }
    if (DIRECT_KEY) {
      setState({ kind: "sending" });
      const r = await sendDirect({ message, anonymous, name, email });
      if (r.ok) {
        setState({ kind: "sent", anonymous });
        setMessage("");
      } else {
        setState({ kind: "error", code: r.code, message: r.message });
      }
      return;
    }
    if (LOCAL_ONLY) {
      setState({ kind: "error", code: "not_configured" });
      return;
    }
    setState({ kind: "sending" });
    try {
      const res = await fetch(apiUrl("/api/contact"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, anonymous, name, email, website }),
      });
      if (res.ok) {
        setState({ kind: "sent", anonymous });
        setMessage("");
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { code?: ContactErrorCode; message?: string };
      setState({ kind: "error", code: body.code ?? "upstream", message: body.message });
    } catch {
      setState({ kind: "error", code: "network" });
    }
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void submit();
  };

  return (
    <section
      data-open-channel
      aria-labelledby={id("title")}
      className={`border-grad relative overflow-hidden rounded-[20px] p-5 md:p-6 ${className}`}
      style={{ "--surface": "var(--bg-raised)" } as React.CSSProperties}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-[radial-gradient(closest-side,var(--brand-glow),transparent)]"
      />

      <div className="relative">
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-brand">
          <span aria-hidden="true" className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-live opacity-60 motion-reduce:hidden" />
            <span className="relative size-2 rounded-full bg-live" />
          </span>
          Open Channel
        </p>
        <h2 id={id("title")} className="mt-3 text-[22px] font-semibold leading-[1.15] tracking-[-0.025em] text-fg md:text-[24px]">
          Have something to build? <span className="text-grad">Let&apos;s talk.</span>
        </h2>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
          He&apos;s open to consulting, independent engagements, and the right role. Describe what you need, ask a question, or just say hi.
        </p>

        {state.kind === "sent" ? (
          <div role="status" className="stage-in mt-6 rounded-[14px] border border-line bg-bg p-5">
            <span className="grid size-10 place-items-center rounded-full bg-grad-bright text-[#0a0a0a]">
              <CheckIcon size={18} />
            </span>
            <p className="mt-3 text-[16px] font-medium text-fg">Message delivered.</p>
            <p className="mt-1 text-[13.5px] text-muted">
              {state.anonymous ? "Sent anonymously. Thanks for reaching out." : "Thanks! Your email is attached so he can reply."}
            </p>
            <button
              type="button"
              onClick={() => setState({ kind: "idle" })}
              className="mt-4 text-[13px] font-medium text-brand transition-opacity duration-150 hover:opacity-80"
            >
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3.5" noValidate>

            <div>
              <label htmlFor={id("message")} className="sr-only">
                Message
              </label>
              <textarea
                id={id("message")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={onKey}
                maxLength={MAX}
                rows={4}
                required
                placeholder="What are you working on? A project, a role, a question, or just hi…"
                className="block w-full resize-none rounded-[12px] border border-line-strong bg-bg px-3.5 py-3 text-[16px] leading-relaxed text-fg outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-faint focus-visible:border-brand/70 focus-visible:shadow-[0_0_0_4px_var(--brand-glow)] focus-visible:outline-none md:text-[14px]"
              />
              {message.length > MAX - 200 && (
                <p className="tabular mt-1 text-right font-mono text-[10.5px] text-faint">
                  {message.length}/{MAX}
                </p>
              )}
            </div>

            <div role="radiogroup" aria-label="Reply" className="grid grid-cols-2 rounded-full border border-line bg-bg p-0.5">
              {[
                { v: false, label: "Reply to my email" },
                { v: true, label: "Send anonymously" },
              ].map((o) => (
                <button
                  key={o.label}
                  type="button"
                  role="radio"
                  aria-checked={anonymous === o.v}
                  onClick={() => setAnonymous(o.v)}
                  className={`h-8 rounded-full text-[12.5px] transition-colors duration-150 ${
                    anonymous === o.v ? "bg-hover font-medium text-fg" : "text-muted hover:text-fg"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>

            {anonymous ? (
              <p className="px-1 text-[12.5px] text-faint">No name, no email. He&apos;ll read it, but he can&apos;t reply.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label htmlFor={id("name")} className="sr-only">
                    Name (optional)
                  </label>
                  <input
                    id={id("name")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={80}
                    autoComplete="name"
                    placeholder="Name (optional)"
                    className="h-10 w-full rounded-[10px] border border-line-strong bg-bg px-3 text-[16px] text-fg outline-none transition-colors duration-150 placeholder:text-faint focus-visible:border-brand/70 focus-visible:outline-none md:text-[13.5px]"
                  />
                </div>
                <div>
                  <label htmlFor={id("email")} className="sr-only">
                    Email
                  </label>
                  <input
                    id={id("email")}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={200}
                    autoComplete="email"
                    required
                    placeholder="you@company.com"
                    className="h-10 w-full rounded-[10px] border border-line-strong bg-bg px-3 text-[16px] text-fg outline-none transition-colors duration-150 placeholder:text-faint focus-visible:border-brand/70 focus-visible:outline-none md:text-[13.5px]"
                  />
                </div>
              </div>
            )}

            {/* Honeypot */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 overflow-hidden">
              <label htmlFor={id("website")}>Website</label>
              <input id={id("website")} tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>

            {state.kind === "error" && (
              <div role="alert" className="rounded-[12px] border border-brand/40 bg-brand/5 p-3 text-[13px]">
                {state.code === "not_configured" ? (
                  <p className="text-muted">
                    The message form isn&apos;t connected yet.{" "}
                    <a href={mailto} className="font-medium text-brand underline-offset-2 hover:underline">
                      Send it by email instead
                    </a>
                    .
                  </p>
                ) : state.code === "invalid" ? (
                  <p className="text-muted">{state.message ?? "Check the message and try again."}</p>
                ) : state.code === "rate_limited" ? (
                  <p className="text-muted">
                    That&apos;s a lot of messages. Try again later, or{" "}
                    <a href={mailto} className="font-medium text-brand hover:underline">
                      email him
                    </a>
                    .
                  </p>
                ) : (
                  <p className="text-muted">
                    Couldn&apos;t send right now.{" "}
                    <a href={mailto} className="font-medium text-brand hover:underline">
                      Email him instead
                    </a>
                    .
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="hidden font-mono text-[10.5px] text-faint sm:inline">⌘/Ctrl + Enter to send</span>
              <button
                type="submit"
                disabled={state.kind === "sending" || message.trim().length < 2}
                className="btn-brand group ml-auto inline-flex h-10 items-center gap-2 rounded-full px-5 text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {state.kind === "sending" ? "Sending…" : "Send message"}
                <ArrowRight size={15} className="transition-transform duration-150 group-hover:translate-x-0.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

/** Scroll to whichever Open Channel is visible at this screen size and focus its message box. */
export function focusOpenChannel() {
  const el = Array.from(document.querySelectorAll<HTMLElement>("[data-open-channel]")).find((n) => n.offsetParent !== null);
  if (!el) return;
  el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  window.setTimeout(() => el.querySelector<HTMLTextAreaElement>("textarea")?.focus({ preventScroll: true }), 450);
}
