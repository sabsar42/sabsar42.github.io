"use client";

import { useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";
import { awards, metrics, projects, publications, type Domain } from "@/lib/content";
import { dom } from "@/lib/domain";
import { navigateTo } from "@/lib/navigate";
import { ArrowRight } from "./icons";
import { focusOpenChannel } from "./open-channel";
import { useSite } from "./providers";
import { Section } from "./section";

/* ------------------------------------------------------------------ */
/* The brief: every line is built from content.ts                      */
/* ------------------------------------------------------------------ */

const m = (id: string) => {
  const x = metrics.find((k) => k.id === id)!;
  return `${x.prefix ?? ""}${x.value}${x.suffix ?? ""}`;
};
const live = projects.filter((p) => p.live);
const hackathon = awards.find((a) => a.text.includes("Headstarter"));
const nasa = awards.find((a) => a.text.includes("NASA"));

type Row = { key: string; domain: Domain; value: React.ReactNode; target?: string };

const ROWS: Row[] = [
  {
    key: "Open to",
    domain: "ship",
    value: (
      <>
        <span className="text-fg">Founding and early-stage AI engineering roles</span>, and{" "}
        <span className="text-fg">client projects</span>: agentic and multimodal AI, delivered end to end.
      </>
    ),
    target: "clients",
  },
  {
    key: "Ships",
    domain: "agent",
    value: (
      <>
        <span className="text-fg">Agentic and multimodal AI, end to end:</span> multi-agent workflows (LangGraph, LangChain,
        MCP) grounded with RAG, FastAPI and Docker backends, Next.js and Flutter front ends.
      </>
    ),
    target: "agents",
  },
  {
    key: "In production",
    domain: "vision",
    value: (
      <>
        <b className="font-medium text-fg">{m("checks")}</b> moderation checks/day · <b className="font-medium text-fg">{m("review")}</b>{" "}
        less manual review · RAG over <b className="font-medium text-fg">{m("docs")}</b> docs ·{" "}
        <b className="font-medium text-fg">{m("miou")}</b> mIoU with LoRA
      </>
    ),
    target: "proof",
  },
  {
    key: "Live products",
    domain: "ship",
    value: (
      <span className="flex flex-wrap gap-1.5">
        {live.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigateTo(`work-${p.id}`);
            }}
            className={`inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-[12.5px] text-fg transition-colors duration-150 ${dom[p.domain].border} ${dom[p.domain].softer} ${dom[p.domain].hoverBorder}`}
          >
            <span aria-hidden="true" className="live-dot relative size-1.5 rounded-full bg-live" />
            {p.name}
          </button>
        ))}
      </span>
    ),
  },
  {
    key: "Remote track record",
    domain: "data",
    value: <>UK clients (Indetechs / TVS) · Fadlun, London · Headstarter AI, New York · all remote</>,
    target: "experience",
  },
  {
    key: "Research depth",
    domain: "research",
    value: (
      <>
        <b className="font-medium text-fg">{publications.length} papers</b>, incl. WACV 2026 Workshops, Scientific Data, IEEE, and an
        AAAI 2026 Workshop
      </>
    ),
    target: "research",
  },
  {
    key: "Under pressure",
    domain: "agent",
    value: (
      <>
        {hackathon?.text}. {nasa?.text}.
      </>
    ),
    target: "recognition",
  },
];

/* ------------------------------------------------------------------ */
/* Time-zone overlap                                                   */
/* ------------------------------------------------------------------ */

const HIS_OFFSET = 6 * 60; // Asia/Dhaka, no DST

function subscribeMinute(cb: () => void) {
  const id = window.setInterval(cb, 30_000);
  return () => window.clearInterval(id);
}
/** Minutes since epoch on the client; null on the server so markup stays stable. */
function useNowMinute() {
  return useSyncExternalStore(subscribeMinute, () => Math.floor(Date.now() / 60_000), () => null);
}
function subscribeNever() {
  return () => {};
}
function useZone() {
  return useSyncExternalStore(
    subscribeNever,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    () => null,
  );
}

const wrap = (h: number) => ((h % 24) + 24) % 24;
function hhmm(h: number) {
  const t = wrap(h);
  const hr = Math.floor(t);
  const mi = Math.round((t - hr) * 60) % 60;
  const ampm = hr < 12 ? "am" : "pm";
  const h12 = hr % 12 === 0 ? 12 : hr % 12;
  return `${h12}:${String(mi).padStart(2, "0")} ${ampm}`;
}
const isNight = (h: number) => {
  const t = wrap(h);
  return t < 7 || t >= 22;
};

function ZoneBridge() {
  const now = useNowMinute();
  const zone = useZone();
  const [probe, setProbe] = useState<number | null>(null);

  const mine = now === null ? 0 : -new Date(now * 60_000).getTimezoneOffset();
  const diffH = (HIS_OFFSET - mine) / 60;
  const nowMine = now === null ? 12 : wrap((now % 1440) / 60 + mine / 60);
  const p = probe ?? nowMine;
  const city = zone ? (zone.split("/").pop() ?? zone).replace(/_/g, " ") : "you";
  const ready = now !== null;

  const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setProbe(Math.min(23.99, Math.max(0, ((e.clientX - r.left) / r.width) * 24)));
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      setProbe(wrap(p + (e.key === "ArrowRight" ? 0.5 : -0.5)));
    }
  };

  const ahead =
    !ready ? "" : diffH === 0 ? "You're in the same time zone." : `Sylhet is ${Math.abs(diffH)}h ${diffH > 0 ? "ahead of" : "behind"} you.`;

  return (
    <div className="rounded-[14px] border border-line bg-raised p-4 md:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="label">Your time ↔ his time</p>
        {probe !== null && (
          <button type="button" onClick={() => setProbe(null)} className="font-mono text-[11px] text-faint hover:text-fg">
            reset to now
          </button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="font-mono text-[11px] text-vision">{ready ? city : "you"}</p>
          <p className="tabular mt-0.5 text-[24px] font-medium tracking-[-0.02em] text-fg">{ready ? hhmm(p) : "--:--"}</p>
        </div>
        <div>
          <p className="font-mono text-[11px] text-agent">Sylhet · UTC+6</p>
          <p className="tabular mt-0.5 text-[24px] font-medium tracking-[-0.02em] text-fg">{ready ? hhmm(p + diffH) : "--:--"}</p>
        </div>
      </div>

      <div
        role="slider"
        tabIndex={0}
        aria-label="Pick a time of day to convert"
        aria-valuemin={0}
        aria-valuemax={24}
        aria-valuenow={Math.round(p * 2) / 2}
        aria-valuetext={ready ? `${hhmm(p)} for you is ${hhmm(p + diffH)} in Sylhet` : undefined}
        onPointerMove={fromPointer}
        onPointerDown={fromPointer}
        onKeyDown={onKey}
        className="relative mt-4 cursor-ew-resize touch-none select-none rounded-[8px] focus-visible:outline-offset-4"
      >
        {[0, diffH].map((shift, row) => (
          <div key={row} className={`flex h-5 gap-px overflow-hidden rounded-[5px] ${row ? "mt-1" : ""}`}>
            {Array.from({ length: 24 }, (_, h) => {
              const night = isNight(h + shift);
              return (
                <span
                  key={h}
                  className={`flex-1 ${night ? "bg-line" : row ? "bg-agent/35" : "bg-vision/35"}`}
                  title={row ? `Sylhet ${hhmm(h + shift)}` : `You ${hhmm(h)}`}
                />
              );
            })}
          </div>
        ))}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-1 -top-1 w-0.5 -translate-x-1/2 rounded-full bg-fg transition-[left] duration-75"
          style={{ left: `${(p / 24) * 100}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[10px] text-faint" aria-hidden="true">
        <span>12am</span>
        <span>6am</span>
        <span>12pm</span>
        <span>6pm</span>
        <span>12am</span>
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-muted">
        {ahead} Drag across the bars to convert any time. Colored = daytime, grey = night.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export function FounderBrief() {
  const { openAgent, preloadAgent } = useSite();

  return (
    <Section id="brief" index="01" label="The 30-second brief" wide>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-8">
        <dl className="reveal overflow-hidden rounded-[14px] border border-line bg-raised/40">
          {ROWS.map((r) => {
            const d = dom[r.domain];
            const body = (
              <>
                <dt className="flex items-center gap-2 font-mono text-[12px] text-muted">
                  <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${d.bg}`} />
                  {r.key}
                </dt>
                <dd className="flex items-start justify-between gap-3 text-[14.5px] leading-relaxed text-muted">
                  <span className="min-w-0">{r.value}</span>
                  {r.target && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateTo(r.target!);
                      }}
                      aria-label={`${r.key}: see the details`}
                      className={`mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full text-faint transition-colors duration-150 group-hover:text-fg ${d.hoverBorder}`}
                    >
                      <ArrowRight size={13} />
                    </button>
                  )}
                </dd>
              </>
            );
            const cls =
              "grid grid-cols-1 gap-1 border-b border-line px-4 py-3.5 last:border-b-0 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-4 md:px-5";
            return r.target ? (
              <div
                key={r.key}
                onClick={() => navigateTo(r.target!)}
                className={`${cls} group relative cursor-pointer transition-colors duration-150 hover:bg-hover`}
              >
                <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 ${d.bg}`} />
                {body}
              </div>
            ) : (
              <div key={r.key} className={cls}>
                {body}
              </div>
            );
          })}
        </dl>

        <div className="reveal space-y-4" style={{ "--i": 1 } as React.CSSProperties}>
          <ZoneBridge />

          <div className="border-grad spotlight relative overflow-hidden rounded-[14px] p-4 md:p-5" style={{ "--surface": "var(--bg-raised)" } as React.CSSProperties}>
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -right-16 size-64 rounded-full bg-[radial-gradient(closest-side,var(--brand-glow),transparent)]" />
            <p className="text-[17px] font-medium tracking-[-0.01em] text-fg">Hiring, or got a project in mind?</p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-muted">
              Tell the agent what the role needs and it maps each requirement to evidence from his work, or says when
              something isn&apos;t there. Have a project instead? Message him directly.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openAgent(undefined, "fit")}
                onPointerEnter={preloadAgent}
                onFocus={preloadAgent}
                aria-haspopup="dialog"
                className="btn-brand group inline-flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-semibold"
              >
                Run a fit check
                <ArrowRight size={15} className="transition-transform duration-150 group-hover:translate-x-0.5" />
              </button>
              <button
                type="button"
                onClick={focusOpenChannel}
                className="inline-flex h-10 items-center rounded-full border border-line-strong px-4 text-[14px] font-medium text-fg transition-colors duration-150 hover:border-brand/60"
              >
                Start a project
              </button>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
