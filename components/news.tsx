"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import { news, newsKinds, type News as NewsItem, type NewsKind } from "@/lib/content";
import { dom } from "@/lib/domain";
import { NAVIGATE_EVENT, navigateTo, type NavigateDetail } from "@/lib/navigate";
import { ArrowRight } from "./icons";
import { OrgLogo } from "./org-logo";
import { Section } from "./section";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const kindOf = Object.fromEntries(newsKinds.map((k) => [k.id, k])) as Record<NewsKind, (typeof newsKinds)[number]>;

function when(date: string) {
  const [y, mo] = date.split("-");
  return mo ? `${MONTHS[Number(mo) - 1]} ${y}` : y;
}

function KindBadge({ kind }: { kind: NewsKind }) {
  const k = kindOf[kind];
  const d = dom[k.domain];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-px font-mono text-[10.5px] ${d.soft} ${d.text}`}>
      <span aria-hidden="true" className={`size-1.5 rounded-full ${d.bg}`} />
      {k.label.replace(/s$/, "").toLowerCase()}
    </span>
  );
}

function Row({ n, i }: { n: NewsItem; i: number }) {
  const body = (
    <>
      <span className="tabular w-[72px] shrink-0 pt-0.5 font-mono text-[12px] text-faint">{when(n.date)}</span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <KindBadge kind={n.kind} />
          {n.place && <span className="font-mono text-[10.5px] text-faint">{n.place}</span>}
        </span>
        <span className="mt-1.5 block text-[15.5px] font-medium leading-snug text-fg">{n.title}</span>
        <span className="mt-1 block text-[13.5px] leading-relaxed text-muted">{n.text}</span>
      </span>
      {n.mark ? <OrgLogo mark={n.mark} size={30} className="mt-0.5 hidden sm:inline-grid" /> : null}
      {n.href && (
        <ArrowRight
          size={14}
          className="mt-1 shrink-0 text-faint transition-[color,transform] duration-150 group-hover:translate-x-0.5 group-hover:text-brand"
        />
      )}
    </>
  );
  const cls = "group flex w-full items-start gap-4 rounded-[12px] px-3 py-4 text-left transition-colors duration-150";
  return (
    <li id={`news-${n.id}`} className="stage-in border-b border-line last:border-b-0" style={{ animationDelay: `${i * 35}ms` } as CSSProperties}>
      {n.href ? (
        <button type="button" onClick={() => navigateTo(n.href!)} className={`${cls} hover:bg-hover`}>
          {body}
        </button>
      ) : (
        <div className={cls}>{body}</div>
      )}
    </li>
  );
}

export function News() {
  const [kind, setKind] = useState<NewsKind | "all">("all");
  const [all, setAll] = useState(false);
  // Agent sources can point at any item: reveal it before scrolling.
  useEffect(() => {
    const onNavigate = (e: Event) => {
      const { id } = (e as CustomEvent<NavigateDetail>).detail;
      if (!id.startsWith("news-")) return;
      flushSync(() => {
        setKind("all");
        setAll(true);
      });
    };
    window.addEventListener(NAVIGATE_EVENT, onNavigate);
    return () => window.removeEventListener(NAVIGATE_EVENT, onNavigate);
  }, []);

  const latest = news[0];
  const rest = news.slice(1).filter((n) => kind === "all" || n.kind === kind);
  const shown = all ? rest : rest.slice(0, 5);
  const counts = Object.fromEntries(newsKinds.map((k) => [k.id, news.slice(1).filter((n) => n.kind === k.id).length]));

  return (
    <Section id="news" index="04" label="News" wide>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)] lg:gap-10">
        {/* Latest */}
        <div className="reveal lg:sticky lg:top-[calc(var(--topbar-h)+24px)] lg:h-fit">
          <article
            id={`news-${latest.id}`}
            className="border-grad spotlight relative overflow-hidden rounded-[18px] p-5 md:p-6"
            style={{ "--surface": "var(--bg-raised)" } as CSSProperties}
          >
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-[radial-gradient(closest-side,var(--brand-glow),transparent)]" />
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-brand">
              <span aria-hidden="true" className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-brand opacity-60 motion-reduce:hidden" />
                <span className="relative size-2 rounded-full bg-brand" />
              </span>
              Latest · {when(latest.date)}
            </p>
            <h3 className="mt-4 text-[26px] font-semibold leading-[1.1] tracking-[-0.025em] text-fg md:text-[30px]">
              {latest.title.split(" ").map((w, i, arr) =>
                i >= arr.length - 2 ? (
                  <span key={i} className="text-grad">
                    {w}
                    {i < arr.length - 1 ? " " : ""}
                  </span>
                ) : (
                  <span key={i}>{w} </span>
                ),
              )}
            </h3>
            <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{latest.text}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <KindBadge kind={latest.kind} />
              {latest.place && <span className="font-mono text-[11px] text-faint">{latest.place}</span>}
              {latest.href && (
                <button
                  type="button"
                  onClick={() => navigateTo(latest.href!)}
                  className="ml-auto inline-flex items-center gap-1 text-[13px] font-medium text-brand transition-opacity duration-150 hover:opacity-80"
                >
                  See it <ArrowRight size={13} />
                </button>
              )}
            </div>
          </article>
          <p className="mt-3 px-1 font-mono text-[11px] text-faint">{news.length} updates · newest first</p>
        </div>

        {/* Feed */}
        <div className="reveal" style={{ "--i": 1 } as CSSProperties}>
          <div role="group" aria-label="Filter news" className="flex flex-wrap gap-1.5">
            {[{ id: "all" as const, label: "All", n: news.length - 1 }, ...newsKinds.map((k) => ({ id: k.id, label: k.label, n: counts[k.id] }))]
              .filter((k) => k.n > 0)
              .map((k) => {
                const on = kind === k.id;
                return (
                  <button
                    key={k.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setKind(k.id);
                      setAll(false);
                    }}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12.5px] transition-colors duration-150 ${
                      on ? "border-transparent bg-grad-bright font-medium text-[#0a0a0a]" : "border-line text-muted hover:border-brand/50 hover:text-fg"
                    }`}
                  >
                    {k.label}
                    <span className={`tabular font-mono text-[10px] ${on ? "text-[#0a0a0a]/70" : "text-faint"}`}>{k.n}</span>
                  </button>
                );
              })}
          </div>
          <ol key={`${kind}-${all}`} className="mt-3 rounded-[16px] border border-line">
            {shown.map((n, i) => (
              <Row key={n.id} n={n} i={i} />
            ))}
          </ol>
          {rest.length > 5 && (
            <button
              type="button"
              onClick={() => setAll((a) => !a)}
              aria-expanded={all}
              className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-4 text-[13px] text-muted transition-colors duration-150 hover:border-brand/50 hover:text-fg"
            >
              {all ? "Show less" : `Show all ${rest.length}`}
            </button>
          )}
        </div>
      </div>
    </Section>
  );
}
