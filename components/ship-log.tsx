"use client";

import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { education, formatRange, roles, type Domain, type Mark } from "@/lib/content";
import { dom } from "@/lib/domain";
import { NAVIGATE_EVENT, type NavigateDetail } from "@/lib/navigate";
import { ChevronDown } from "./icons";
import { OrgLogos } from "./org-logo";
import { Section } from "./section";

type Lane = "industry" | "research" | "education";

const LANES: { id: Lane; domain: Domain; x: number }[] = [
  { id: "industry", domain: "ship", x: 12 },
  { id: "research", domain: "research", x: 32 },
  { id: "education", domain: "data", x: 52 },
];
const laneOf = Object.fromEntries(LANES.map((l) => [l.id, l])) as Record<Lane, (typeof LANES)[number]>;

type Entry = {
  id: string;
  lane: Lane;
  title: string;
  org: string;
  location: string;
  start: string;
  end: string;
  highlights: string[];
  details: string[];
  marks: Mark[];
};

const ALL: Entry[] = [
  ...roles.map((r) => ({
    id: r.id,
    lane: r.kind as Lane,
    title: r.title,
    org: r.org,
    location: r.location,
    start: r.start,
    end: r.end,
    highlights: r.highlights,
    details: r.details,
    marks: r.marks,
  })),
  {
    id: "education",
    lane: "education" as const,
    title: education.degree,
    org: education.school,
    location: education.location,
    start: education.start,
    end: education.end,
    highlights: [`CGPA ${education.cgpa}.`],
    details: [`Thesis: ${education.thesis}`],
    marks: education.marks,
  },
].sort((a, b) => (a.start < b.start ? 1 : -1));

const DOT_Y = 30;

export function ShipLog() {
  const [hidden, setHidden] = useState<Set<Lane>>(new Set());
  const [open, setOpen] = useState<Set<string>>(new Set(["indetechs"]));

  const entries = useMemo(() => ALL.filter((e) => !hidden.has(e.lane)), [hidden]);

  // Lane extents over the visible rows. Lanes with a current role run up to the top.
  const extents = useMemo(() => {
    const ext = {} as Record<Lane, { first: number; last: number } | null>;
    for (const l of LANES) {
      const idx = entries.map((e, i) => (e.lane === l.id ? i : -2)).filter((i) => i >= 0);
      if (!idx.length) {
        ext[l.id] = null;
        continue;
      }
      const present = entries.some((e) => e.lane === l.id && e.end === "present");
      ext[l.id] = { first: present ? -1 : Math.min(...idx), last: Math.max(...idx) };
    }
    return ext;
  }, [entries]);

  useEffect(() => {
    const onNavigate = (e: Event) => {
      const { id } = (e as CustomEvent<NavigateDetail>).detail;
      if (!id.startsWith("exp-")) return;
      const key = id.slice(4);
      flushSync(() => {
        setHidden(new Set());
        setOpen((s) => new Set(s).add(key));
      });
    };
    window.addEventListener(NAVIGATE_EVENT, onNavigate);
    return () => window.removeEventListener(NAVIGATE_EVENT, onNavigate);
  }, []);

  const toggleLane = (l: Lane) =>
    setHidden((s) => {
      const next = new Set(s);
      if (next.has(l)) next.delete(l);
      else if (next.size < LANES.length - 1) next.add(l);
      return next;
    });

  const toggleOpen = (id: string) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <Section id="experience" index="05" label="Ship log">
      <div role="group" aria-label="Show or hide tracks" className="reveal mb-6 flex flex-wrap items-center gap-2">
        <span className="label mr-1 font-mono">git log --graph</span>
        {LANES.map((l) => {
          const c = dom[l.domain];
          const on = !hidden.has(l.id);
          return (
            <button
              key={l.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggleLane(l.id)}
              className={`inline-flex h-7 items-center gap-2 rounded-full border px-3 font-mono text-[12px] transition-colors duration-150 ${
                on ? `${c.border} ${c.soft} ${c.text}` : "border-line text-faint hover:text-muted"
              }`}
            >
              <span aria-hidden="true" className={`size-2 rounded-full ${on ? c.bg : "bg-line-strong"}`} />
              {l.id}
            </button>
          );
        })}
      </div>

      <ol className="shiplog">
        {entries.map((e, i) => {
          const lane = laneOf[e.lane];
          const c = dom[lane.domain];
          const isOpen = open.has(e.id);
          return (
            <li
              key={e.id}
              id={`exp-${e.id}`}
              className="shiplog-entry group relative grid grid-cols-[64px_1fr] rounded-(--r-md) transition-opacity duration-150"
            >
              {/* graph gutter */}
              <div aria-hidden="true" className="relative">
                {LANES.map((l) => {
                  const ext = extents[l.id];
                  if (!ext) return null;
                  const color = dom[l.domain].bg;
                  const top = ext.first < i && i <= ext.last;
                  const bottom = ext.first <= i && i < ext.last;
                  return (
                    <span key={l.id}>
                      {top && <span className={`absolute w-0.5 opacity-60 ${color}`} style={{ left: l.x, top: 0, height: DOT_Y }} />}
                      {bottom && <span className={`absolute bottom-0 w-0.5 opacity-60 ${color}`} style={{ left: l.x, top: DOT_Y }} />}
                    </span>
                  );
                })}
                <span
                  className={`absolute size-3 -translate-x-[5px] -translate-y-1/2 rounded-full ring-4 ring-bg transition-transform duration-150 group-hover:scale-125 ${c.bg}`}
                  style={{ left: lane.x, top: DOT_Y }}
                />
                {e.end === "present" && (
                  <span
                    className={`live-dot absolute size-3 -translate-x-[5px] -translate-y-1/2 rounded-full opacity-60 ${c.bg}`}
                    style={{ left: lane.x, top: DOT_Y }}
                  />
                )}
              </div>

              <div className="min-w-0 py-4 pr-1">
                <button
                  type="button"
                  onClick={() => toggleOpen(e.id)}
                  aria-expanded={isOpen}
                  aria-controls={`exp-${e.id}-details`}
                  className="flex w-full items-start justify-between gap-4 rounded-(--r-sm) text-left"
                >
                  <span className="flex min-w-0 gap-3.5">
                  <span className="mt-1 block">
                    <OrgLogos marks={e.marks} size={36} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className={`tabular font-mono text-[12px] ${c.text}`}>{formatRange(e.start, e.end)}</span>
                      {e.end === "present" && (
                        <span className={`rounded-full px-2 py-px font-mono text-[11px] ${c.soft} ${c.text}`}>HEAD</span>
                      )}
                    </span>
                    <span className="mt-1.5 block text-lead font-medium text-fg">{e.title}</span>
                    <span className="mt-0.5 block text-muted">
                      {e.org} <span className="text-faint">· {e.location}</span>
                    </span>
                  </span>
                  </span>
                  <ChevronDown
                    size={16}
                    className={`mt-1 shrink-0 text-faint transition-transform duration-220 group-hover:text-fg ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <ul className="mt-3 max-w-[68ch] space-y-1.5">
                  {e.highlights.map((line) => (
                    <li key={line} className="text-muted">
                      {line}
                    </li>
                  ))}
                </ul>

                <div
                  id={`exp-${e.id}-details`}
                  inert={!isOpen}
                  className={`grid transition-[grid-template-rows,opacity] duration-220 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <ul className={`mt-4 max-w-[68ch] space-y-2 rounded-(--r-md) border p-4 ${c.border} ${c.softer}`}>
                      {e.details.map((d) => (
                        <li key={d} className="flex gap-2.5 text-small leading-relaxed text-muted">
                          <span aria-hidden="true" className={`mt-[0.55em] size-1.5 shrink-0 rounded-full ${c.bg}`} />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
