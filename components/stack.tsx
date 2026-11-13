"use client";

import { useState, type CSSProperties } from "react";
import { projects, publications, roles, stack, type Domain, type Skill } from "@/lib/content";
import { dom } from "@/lib/domain";
import { navigateTo } from "@/lib/navigate";
import { SkillMark } from "./brand-icon";
import { ArrowRight } from "./icons";
import { Section } from "./section";

type Use = { label: string; kind: string; target: string };

/* Everything a skill could appear in, as searchable text. */
const ENTITIES: (Use & { text: string })[] = [
  ...roles.map((r) => ({
    label: `${r.title}, ${r.org.replace(/ Ltd\..*$/, "")}`,
    kind: r.kind === "research" ? "research" : "role",
    target: `exp-${r.id}`,
    text: [...r.details, ...r.highlights].join(" "),
  })),
  ...projects.map((p) => ({
    label: p.name,
    kind: "project",
    target: `work-${p.id}`,
    text: [p.outcome, ...p.details, ...p.stack].join(" "),
  })),
  ...publications.map((p) => ({
    label: p.title.split(":")[0],
    kind: "paper",
    target: p.featured ? `pub-${p.id}` : "research",
    text: p.title,
  })),
];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function usesOf(skill: Skill): Use[] {
  const phrases = skill.match ?? [skill.name.toLowerCase()];
  const res = phrases.map((p) => new RegExp(`(^|[^a-z0-9])${escape(p)}`, "i"));
  return ENTITIES.filter((e) => res.some((r) => r.test(e.text))).map(({ label, kind, target }) => ({ label, kind, target }));
}

const USES = new Map(stack.flatMap((g) => g.items.map((s) => [s.name, usesOf(s)] as const)));

export function Stack() {
  const [selected, setSelected] = useState<{ name: string; domain: Domain }>({ name: "LangGraph", domain: "agent" });
  const uses = USES.get(selected.name) ?? [];
  const c = dom[selected.domain];

  return (
    <Section id="stack" index="10" label="Stack">
      <p className="reveal label mb-6">Pick a skill to see where I used it.</p>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid gap-6 sm:grid-cols-2">
          {stack.map((group, gi) => {
            const d = dom[group.domain];
            return (
              <div key={group.name} className="reveal" style={{ "--i": gi } as CSSProperties}>
                <h3 className={`label flex items-center gap-2 border-b pb-3 ${d.border} ${d.text}`}>
                  <span aria-hidden="true" className={`size-2 rounded-full ${d.bg}`} />
                  {group.name}
                </h3>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {group.items.map((s) => {
                    const n = USES.get(s.name)?.length ?? 0;
                    const on = selected.name === s.name;
                    return (
                      <li key={s.name}>
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() => setSelected({ name: s.name, domain: group.domain })}
                          onMouseEnter={() => setSelected({ name: s.name, domain: group.domain })}
                          className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] transition-colors duration-150 ${
                            on ? `${d.border} ${d.soft} text-fg` : `border-line text-muted hover:text-fg ${d.hoverBorder}`
                          }`}
                        >
                          <SkillMark name={s.name} size={14} className={on ? "" : "opacity-85"} />
                          {s.name}
                          {n > 0 && <span className={`tabular font-mono text-[10px] ${on ? d.text : "text-faint"}`}>{n}</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        <aside
          aria-live="polite"
          className={`h-fit rounded-(--r-md) border p-5 transition-colors duration-220 lg:sticky lg:top-[calc(var(--topbar-h)+24px)] ${c.border} ${c.softer}`}
        >
          <p className={`font-mono text-[12px] ${c.text}`}>where I used</p>
          <p className="mt-1 flex items-center gap-3 text-title font-medium text-fg">
            <SkillMark name={selected.name} size={28} />
            {selected.name}
          </p>
          {uses.length ? (
            <ul className="mt-4 space-y-1">
              {uses.map((u) => (
                <li key={u.target + u.label}>
                  <button
                    type="button"
                    onClick={() => navigateTo(u.target)}
                    className="group flex w-full items-start justify-between gap-3 rounded-(--r-sm) py-1.5 text-left"
                  >
                    <span className="min-w-0">
                      <span className="label mr-2">{u.kind}</span>
                      <span className="text-small text-muted transition-colors duration-150 group-hover:text-fg">{u.label}</span>
                    </span>
                    <ArrowRight size={14} className={`mt-1 shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100 ${c.text}`} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-small text-muted">Part of my toolkit; not tied to a specific entry on this page.</p>
          )}
        </aside>
      </div>
    </Section>
  );
}
