"use client";

import { useState, type CSSProperties } from "react";
import { areaDomain, areas, identity, publications } from "@/lib/content";
import { dom } from "@/lib/domain";
import { ArrowUpRight } from "./icons";
import { Section } from "./section";

const STATUS = [
  { id: "published", label: "published", color: "var(--c-ship)" },
  { id: "accepted", label: "accepted", color: "var(--c-data)" },
  { id: "under review", label: "under review", color: "var(--c-research)" },
] as const;

const counts = STATUS.map((s) => ({ ...s, n: publications.filter((p) => p.status === s.id).length }));
const areaCounts = areas.map((a) => ({ area: a, n: publications.filter((p) => p.areas.includes(a)).length }));
const featured = publications.filter((p) => p.featured);

export function Research() {
  const [hover, setHover] = useState<string | null>(null);
  const total = publications.length;

  return (
    <Section id="research" index="09" label="Research">
      {/* overview */}
      <div className="reveal grid gap-6 md:grid-cols-[auto_1fr] md:items-end md:gap-10">
        <p className="flex items-baseline gap-3">
          <span className="tabular font-mono text-metric text-research">{total}</span>
          <span className="text-muted">papers</span>
        </p>
        <div>
          <div className="flex h-3 gap-1 overflow-hidden rounded-full" role="img" aria-label={counts.map((c) => `${c.n} ${c.label}`).join(", ")}>
            {counts.map((s) => (
              <span
                key={s.id}
                onMouseEnter={() => setHover(s.id)}
                onMouseLeave={() => setHover(null)}
                className="h-full rounded-full transition-opacity duration-150"
                style={{ flexGrow: s.n, background: s.color, opacity: hover && hover !== s.id ? 0.35 : 1 }}
              />
            ))}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
            {counts.map((s) => (
              <li
                key={s.id}
                onMouseEnter={() => setHover(s.id)}
                onMouseLeave={() => setHover(null)}
                className="label flex items-center gap-1.5 transition-opacity duration-150"
                style={{ opacity: hover && hover !== s.id ? 0.45 : 1 }}
              >
                <span aria-hidden="true" className="size-2 rounded-full" style={{ background: s.color }} />
                <span className="tabular text-fg">{s.n}</span> {s.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ul className="reveal mt-6 flex flex-wrap gap-2" aria-label="Research areas">
        {areaCounts.map(({ area, n }) => {
          const d = dom[areaDomain[area]];
          return (
            <li key={area} className={`inline-flex h-7 items-center gap-2 rounded-full border px-3 text-small ${d.border} ${d.softer} ${d.text}`}>
              {area}
              <span className="tabular font-mono text-[11px] opacity-80">{n}</span>
            </li>
          );
        })}
      </ul>

      {/* featured */}
      <p className="label mt-12">Featured</p>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {featured.map((p, i) => {
          const d = dom[areaDomain[p.areas[0]]];
          const link = p.links[0];
          const Card = link ? "a" : "div";
          return (
            <li key={p.id} id={`pub-${p.id}`} className="reveal" style={{ "--i": i } as CSSProperties}>
              <Card
                {...(link ? { href: link.href, target: "_blank", rel: "noopener noreferrer" } : {})}
                className={`group relative flex h-full flex-col overflow-hidden rounded-(--r-md) border p-5 transition-[transform,border-color,background-color] duration-220 ease-out ${d.border} ${d.softer} ${
                  link ? `hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 ${d.hoverBorder}` : ""
                }`}
              >
                <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-0.5 ${d.bg}`} />
                <span className="flex items-center justify-between gap-3">
                  <span className={`font-mono text-[12px] ${d.text}`}>
                    {p.venue}
                    {p.year ? ` · ${p.year}` : ""}
                  </span>
                  {p.status !== "published" && (
                    <span className="rounded-full border border-line px-2 py-px font-mono text-[11px] text-muted">{p.status}</span>
                  )}
                </span>
                <span className="mt-3 block text-[16px] font-medium leading-snug text-fg">{p.title}</span>
                <span className="mt-auto flex items-end justify-between gap-3 pt-4">
                  <span className="flex flex-wrap gap-1.5">
                    {p.role && <span className="label">{p.role}</span>}
                  </span>
                  {link && (
                    <span className={`inline-flex shrink-0 items-center gap-1 text-small ${d.text}`}>
                      {link.label}
                      <ArrowUpRight size={14} className="transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </span>
                  )}
                </span>
              </Card>
            </li>
          );
        })}
      </ul>

      <a
        href={identity.links.scholar}
        target="_blank"
        rel="noopener noreferrer"
        className="reveal mt-6 inline-flex items-center gap-1.5 text-muted transition-colors duration-150 hover:text-research"
      >
        All {total} papers on Google Scholar <ArrowUpRight size={14} />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </Section>
  );
}
