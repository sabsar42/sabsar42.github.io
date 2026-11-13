"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { flushSync } from "react-dom";
import { projects } from "@/lib/content";
import { dom } from "@/lib/domain";
import { NAVIGATE_EVENT, type NavigateDetail } from "@/lib/navigate";
import { GuardianDemo } from "./demos/guardian-demo";
import { PharmaDemo } from "./demos/pharma-demo";
import { SpeakMockDemo } from "./demos/speakmock-demo";
import { GeoSegDemo } from "./geoseg-demo";
import { ArrowUpRight } from "./icons";
import { LiveEmbed } from "./live-embed";
import { Section } from "./section";

const DEMOS: Record<string, () => React.ReactNode> = {
  geoseg: () => <GeoSegDemo />,
  "content-guardian": () => <GuardianDemo />,
  "digi-pharma": () => <PharmaDemo />,
  speakmock: () => <SpeakMockDemo />,
};

type View = "live" | "demo";

export function SelectedWork() {
  const [activeId, setActiveId] = useState(projects[0].id);
  const [view, setView] = useState<View>("live");
  const active = projects.find((p) => p.id === activeId) ?? projects[0];
  const c = dom[active.domain];
  const hasDemo = !!DEMOS[active.id];
  const shown: View = active.embed && (view === "live" || !hasDemo) ? "live" : "demo";
  const select = (id: string) => {
    setActiveId(id);
    setView("live");
  };

  // The agent's source chips can point at a project: open its tab.
  useEffect(() => {
    const onNavigate = (e: Event) => {
      const { id } = (e as CustomEvent<NavigateDetail>).detail;
      if (id.startsWith("work-")) flushSync(() => select(id.slice(5)));
    };
    window.addEventListener(NAVIGATE_EVENT, onNavigate);
    return () => window.removeEventListener(NAVIGATE_EVENT, onNavigate);
  }, []);

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = projects[(i + (e.key === "ArrowRight" ? 1 : projects.length - 1)) % projects.length];
    select(next.id);
    document.getElementById(`work-${next.id}`)?.focus();
  };

  return (
    <Section id="work" index="07" label="Selected work" wide>
      <div role="tablist" aria-label="Projects" className="reveal grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {projects.map((p, i) => {
          const d = dom[p.domain];
          const on = p.id === activeId;
          return (
            <button
              key={p.id}
              id={`work-${p.id}`}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls="work-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => select(p.id)}
              onKeyDown={(e) => onTabKey(e, i)}
              className={`group relative flex flex-col items-start justify-start overflow-hidden rounded-(--r-md) border p-3.5 text-left transition-all duration-220 md:p-4 ${
                on ? `${d.border} ${d.soft}` : `border-line hover:bg-hover ${d.hoverBorder}`
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute inset-x-0 top-0 h-0.5 transition-opacity duration-220 ${d.bg} ${on ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
              />
              <span className="flex w-full items-center justify-between gap-2">
                <span className={`tabular font-mono text-[11px] ${on ? d.text : "text-faint"}`}>{String(i + 1).padStart(2, "0")}</span>
                {p.live && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-live/10 px-1.5 py-px font-mono text-[10px] uppercase tracking-wide text-ship">
                    <span aria-hidden="true" className="live-dot relative size-1.5 rounded-full bg-live" />
                    live
                  </span>
                )}
              </span>
              <span className={`mt-1 block text-[17px] font-medium tracking-[-0.01em] md:text-[19px] ${on ? "text-fg" : "text-muted group-hover:text-fg"}`}>
                {p.name}
              </span>
              <span className={`mt-2 block font-mono text-[12px] ${on ? d.text : "text-faint"}`}>
                {p.stat.value} <span className="hidden text-faint sm:inline">· {p.stat.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        id="work-panel"
        role="tabpanel"
        aria-labelledby={`work-${active.id}`}
        key={active.id}
        className="stage-in mt-6 grid gap-6 md:mt-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.6fr)] md:gap-10"
      >
        <div>
          <h3 className={`text-title font-medium ${c.text}`}>{active.name}</h3>
          <p className="mt-3 text-lead text-fg">{active.outcome}</p>
          <ul className="mt-4 space-y-2">
            {active.details.map((d) => (
              <li key={d} className="flex gap-2.5 text-small leading-relaxed text-muted">
                <span aria-hidden="true" className={`mt-[0.55em] size-1.5 shrink-0 rounded-full ${c.bg}`} />
                {d}
              </li>
            ))}
          </ul>
          <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Stack">
            {active.stack.map((t) => (
              <li key={t} className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] ${c.border} ${c.text}`}>
                {t}
              </li>
            ))}
          </ul>
          {active.links.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {active.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full border border-line-strong px-3.5 text-small text-fg transition-colors duration-150 ${c.hoverBorder}`}
                >
                  {l.label}
                  <ArrowUpRight size={14} />
                  <span className="sr-only"> for {active.name} (opens in a new tab)</span>
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="min-w-0">
          {active.embed && hasDemo && (
            <div role="group" aria-label="View" className="mb-3 inline-flex rounded-full border border-line p-0.5">
              {(
                [
                  ["live", active.embed.kind === "video" ? "Demo video" : "Live product"],
                  ["demo", "How it works"],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={shown === v}
                  onClick={() => setView(v)}
                  className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[12.5px] transition-colors duration-150 ${
                    shown === v ? `${c.soft} text-fg` : "text-muted hover:text-fg"
                  }`}
                >
                  <span aria-hidden="true" className={`size-1.5 rounded-full ${shown === v ? c.bg : "bg-line-strong"}`} />
                  {label}
                </button>
              ))}
            </div>
          )}
          {shown === "live" && active.embed ? (
            <LiveEmbed key={active.id} embed={active.embed} name={active.name} domain={active.domain} />
          ) : (
            DEMOS[active.id]?.()
          )}
        </div>
      </div>
    </Section>
  );
}
