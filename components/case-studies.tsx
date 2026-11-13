"use client";

import { useState, type KeyboardEvent } from "react";
import { caseStudies } from "@/lib/case-studies";
import { navigateTo } from "@/lib/navigate";
import { SkillMark } from "./brand-icon";
import { ArrowRight } from "./icons";
import { OrgLogos } from "./org-logo";
import { focusOpenChannel } from "./open-channel";
import { Section } from "./section";

/** Client work as "case files": the brief, what was built (as a pipeline), and the measured result. */
export function CaseStudies() {
  const [activeId, setActiveId] = useState(caseStudies[0].id);
  const c = caseStudies.find((x) => x.id === activeId) ?? caseStudies[0];

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(e.key)) return;
    e.preventDefault();
    const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
    const next = caseStudies[(i + dir + caseStudies.length) % caseStudies.length];
    setActiveId(next.id);
    document.getElementById(`case-${next.id}`)?.focus();
  };

  return (
    <Section id="clients" index="03" label="Client work" wide>
      <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-8">
        {/* Case list */}
        <div
          role="tablist"
          aria-label="Case studies"
          aria-orientation="vertical"
          className="reveal -mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
        >
          {caseStudies.map((x, i) => {
            const on = x.id === activeId;
            return (
              <button
                key={x.id}
                id={`case-${x.id}`}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls="case-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => setActiveId(x.id)}
                onKeyDown={(e) => onKey(e, i)}
                className={`group relative flex w-[260px] shrink-0 snap-start items-start gap-3 rounded-[14px] border p-3.5 text-left transition-colors duration-200 lg:w-full ${
                  on ? "border-brand/50 bg-raised" : "border-line hover:border-line-strong hover:bg-raised/60"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-y-3 left-0 w-0.5 rounded-full bg-grad transition-opacity duration-200 ${on ? "opacity-100" : "opacity-0"}`}
                />
                <OrgLogos marks={x.marks} size={34} />
                <span className="min-w-0">
                  <span className="block font-mono text-[10.5px] text-faint">
                    {String(i + 1).padStart(2, "0")} · {x.client}
                  </span>
                  <span className={`mt-0.5 block text-[14px] font-medium leading-snug ${on ? "text-fg" : "text-muted group-hover:text-fg"}`}>
                    {x.title}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Case file */}
        <div
          id="case-panel"
          role="tabpanel"
          aria-labelledby={`case-${c.id}`}
          key={c.id}
          className="stage-in spotlight relative overflow-hidden rounded-[20px] border border-line bg-raised p-5 md:p-7"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 -top-32 size-80 rounded-full bg-[radial-gradient(closest-side,var(--brand-glow),transparent)]"
          />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11.5px] text-faint">
              <span className="text-brand">case file</span>
              <span>·</span>
              <span className="text-fg">{c.client}</span>
              <span>· {c.via}</span>
              <span>· {c.period}</span>
            </div>
            <h3 className="mt-3 text-[24px] font-semibold leading-[1.15] tracking-[-0.025em] text-fg md:text-[30px]">{c.title}</h3>

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
              <div>
                <p className="label">The brief</p>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{c.brief}</p>

                <p className="label mt-6">Results</p>
                <ul className="mt-2 grid grid-cols-2 gap-2">
                  {c.outcomes.map((o) => (
                    <li key={o.label} className="rounded-[12px] border border-line bg-bg p-3">
                      <p className="tabular text-grad font-mono text-[18px] font-semibold leading-none tracking-[-0.03em] sm:text-[22px] md:text-[26px]">
                        {o.value}
                      </p>
                      <p className="mt-1.5 text-[12px] leading-snug text-muted">{o.label}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="label">What I built</p>
                <ol className="mt-3">
                  {c.steps.map((s, i) => (
                    <li key={s.name} className="relative pb-5 pl-10 last:pb-0">
                      {i < c.steps.length - 1 && (
                        <span aria-hidden="true" className="absolute bottom-0 left-[13px] top-7 w-px bg-gradient-to-b from-brand/70 to-line" />
                      )}
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-0 grid size-7 place-items-center rounded-full bg-grad-bright font-mono text-[11px] font-semibold text-[#0a0a0a]"
                      >
                        {i + 1}
                      </span>
                      <p className="text-[14px] font-semibold text-fg">{s.name}</p>
                      <p className="mt-0.5 text-[13.5px] leading-relaxed text-muted">{s.detail}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
              <ul className="flex flex-wrap gap-1.5" aria-label="Stack">
                {c.stack.map((t) => (
                  <li key={t} className="inline-flex h-7 items-center gap-1.5 rounded-full border border-line px-2.5 text-[12px] text-muted">
                    <SkillMark name={t} size={13} />
                    {t}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => navigateTo(c.target)}
                className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-brand transition-opacity duration-150 hover:opacity-80"
              >
                See the role
                <ArrowRight size={13} className="transition-transform duration-150 group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="reveal mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-line bg-raised/50 px-5 py-4">
        <p className="text-[14px] text-muted">
          <span className="text-fg">Open to consulting and independent engagements.</span> Have a similar problem? He&apos;d like to hear it.
        </p>
        <button type="button" onClick={focusOpenChannel} className="btn-brand inline-flex h-9 items-center rounded-full px-4 text-[13px] font-semibold">
          Start a project
        </button>
      </div>
    </Section>
  );
}
