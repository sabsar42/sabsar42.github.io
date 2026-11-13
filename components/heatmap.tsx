"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Day } from "@/lib/github";

const LEVEL = ["bg-line", "bg-ship/30", "bg-ship/55", "bg-ship/80", "bg-ship"] as const;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function label(d: Day) {
  const date = new Date(`${d.date}T00:00:00Z`);
  const when = date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  return `${d.count === 0 ? "No" : d.count} contribution${d.count === 1 ? "" : "s"} on ${when}`;
}

/** Year of GitHub activity. The grid fills in once, in date order, when it scrolls into view. */
export function Heatmap({ days }: { days: Day[] }) {
  const [hover, setHover] = useState<Day | null>(null);
  const [run, setRun] = useState(0);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const weeks = useMemo(() => {
    const out: (Day | null)[][] = [];
    const first = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
    let week: (Day | null)[] = Array.from({ length: first }, () => null);
    for (const d of days) {
      week.push(d);
      if (week.length === 7) {
        out.push(week);
        week = [];
      }
    }
    if (week.length) out.push([...week, ...Array.from({ length: 7 - week.length }, () => null)]);
    return out;
  }, [days]);

  const months = useMemo(
    () =>
      weeks.map((w, i) => {
        const d = w.find((x) => x && x.date.endsWith("-01")) ?? (i === 0 ? w.find(Boolean) : null);
        return d ? MONTHS[Number(d.date.slice(5, 7)) - 1] : "";
      }),
    [weeks],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    // Phones show the most recent weeks first.
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    return () => io.disconnect();
  }, []);

  const latest = days[days.length - 1];

  return (
    <div ref={ref}>
      <div ref={scrollRef} className="-mx-1 overflow-x-auto px-1 pb-2">
        <div aria-hidden="true" className="inline-flex min-w-full flex-col gap-1.5" onPointerLeave={() => setHover(null)}>
          <div className="flex gap-[3px] font-mono text-[10px] text-faint">
            {months.map((mo, i) => (
              <span key={i} className="w-[11px] shrink-0 overflow-visible whitespace-nowrap md:w-[13px] lg:w-[16px]">
                {mo}
              </span>
            ))}
          </div>
          <div key={run} className="flex gap-[3px]">
            {weeks.map((w, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {w.map((d, di) =>
                  d ? (
                    <span
                      key={d.date}
                      onPointerEnter={() => setHover(d)}
                      className={`heat-cell block size-[11px] rounded-[2.5px] md:size-[13px] lg:size-[16px] lg:rounded-[3px] ${LEVEL[d.level]} ${
                        inView ? "opacity-100" : "opacity-0"
                      } transition-opacity duration-300 motion-reduce:transition-none ${hover?.date === d.date ? "ring-1 ring-fg" : ""}`}
                      style={{ transitionDelay: inView ? `${wi * 14 + di * 4}ms` : "0ms" }}
                    />
                  ) : (
                    <span key={`e${di}`} className="block size-[11px] md:size-[13px] lg:size-[16px]" />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <p className="tabular min-h-5 font-mono text-[12px] text-muted" aria-live="polite">
          {hover ? label(hover) : `Hover a day · latest: ${label(latest)}`}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setInView(false);
              setRun((r) => r + 1);
              requestAnimationFrame(() => requestAnimationFrame(() => setInView(true)));
            }}
            className="h-7 rounded-full border border-line px-2.5 font-mono text-[11px] text-muted transition-colors duration-150 hover:border-ship/60 hover:text-fg"
          >
            ▶ replay the year
          </button>
          <span className="flex items-center gap-1 font-mono text-[10px] text-faint" aria-hidden="true">
            less
            {LEVEL.map((c) => (
              <span key={c} className={`size-[10px] rounded-[2px] ${c}`} />
            ))}
            more
          </span>
        </div>
      </div>
    </div>
  );
}
