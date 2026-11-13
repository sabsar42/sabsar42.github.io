"use client";

import { useState, type CSSProperties } from "react";
import { identity, statementHighlights } from "@/lib/content";
import { dom } from "@/lib/domain";
import { navigateTo } from "@/lib/navigate";
import { ArrowRight } from "./icons";
import { LocalClock } from "./local-clock";
import { OpenChannel } from "./open-channel";

const KEYS = Object.keys(statementHighlights);

export function Intro() {
  const [active, setActive] = useState<string>("agentic");
  const words = identity.statement.split(/(\s+)/);
  const current = statementHighlights[active];
  const c = dom[current.domain];

  const meta = [identity.name, identity.shortTitle, identity.location, <LocalClock key="clock" />];

  return (
    <section id="about" suppressHydrationWarning aria-label="About" className="pb-14 pt-12 md:pb-20 md:pt-16">
      <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start xl:gap-14">
        <div className="min-w-0">
        <p className="reveal max-w-[22ch] font-serif text-display text-fg sm:max-w-[24ch]">
          {words.map((w, i) => {
            const key = w.replace(/[^a-z]/gi, "").toLowerCase();
            const h = statementHighlights[key];
            if (!h) return <span key={i}>{w}</span>;
            const d = dom[h.domain];
            const punct = w.slice(key.length);
            const on = active === key;
            return (
              <span key={i}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(key)}
                  onFocus={() => setActive(key)}
                  onClick={() => setActive(key)}
                  aria-pressed={on}
                  aria-controls="statement-proof"
                  className={`cursor-pointer rounded-[0.12em] px-[0.06em] italic underline decoration-[0.06em] underline-offset-[0.14em] transition-colors duration-150 ${d.text} ${
                    on ? `${d.soft} decoration-current` : "decoration-current/30 hover:decoration-current"
                  }`}
                >
                  {w.slice(0, key.length)}
                </button>
                {punct}
              </span>
            );
          })}
        </p>

        {/* Evidence for the highlighted word */}
        <div
          id="statement-proof"
          aria-live="polite"
          className={`reveal mt-8 max-w-[640px] rounded-(--r-md) border p-4 transition-colors duration-220 md:p-5 ${c.border} ${c.softer}`}
          style={{ "--i": 1 } as CSSProperties}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {KEYS.map((k) => {
                const d = dom[statementHighlights[k].domain];
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setActive(k)}
                    aria-label={`Show proof for ${statementHighlights[k].title}`}
                    aria-pressed={active === k}
                    className="group/dot -m-2 inline-flex h-6 items-center p-2"
                  >
                    <span className={`block h-2 rounded-full transition-all duration-220 ${d.bg} ${active === k ? "w-6" : "w-2 opacity-40 group-hover/dot:opacity-80"}`} />
                  </button>
                );
              })}
              <span className={`label ml-2 ${c.text}`}>{current.title.toLowerCase()} · proof</span>
            </div>
            <button
              type="button"
              onClick={() => navigateTo(current.target)}
              className={`label inline-flex items-center gap-1 transition-colors duration-150 hover:text-fg ${c.text}`}
            >
              see it <ArrowRight size={12} />
            </button>
          </div>
          <ul className="mt-3 space-y-1.5">
            {current.proof.map((line) => (
              <li key={line} className="flex gap-2.5 text-muted">
                <span aria-hidden="true" className={`mt-[0.6em] size-1.5 shrink-0 rounded-full ${c.bg}`} />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <ul
          className="reveal label mt-10 flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-y-2"
          style={{ "--i": 2 } as CSSProperties}
        >
          {meta.map((item, i) => (
            <li key={i} className={`text-muted sm:leading-none ${i > 0 ? "sm:ml-3 sm:border-l sm:border-line sm:pl-3" : ""}`}>
              {item}
            </li>
          ))}
          <li className="sm:ml-3 sm:border-l sm:border-line sm:pl-3 sm:leading-none">
            <span className="inline-flex items-center gap-1.5 text-ship">
              <span aria-hidden="true" className="live-dot relative size-1.5 rounded-full bg-ship" />
              {identity.availability}
            </span>
          </li>
        </ul>

        <p className="reveal mt-6 flex items-baseline gap-3" style={{ "--i": 3 } as CSSProperties}>
          <span className="label shrink-0 rounded-[4px] border border-agent/40 bg-agent/10 px-1.5 py-0.5 text-agent">Now</span>
          <span className="text-muted">{identity.now}</span>
        </p>
        </div>
        <OpenChannel idPrefix="intro" className="reveal hidden lg:block" />
      </div>
    </section>
  );
}
