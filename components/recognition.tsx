import type { CSSProperties } from "react";
import { awards, leadership } from "@/lib/content";
import { OrgLogo } from "./org-logo";
import { Section } from "./section";

export function Recognition() {
  return (
    <Section id="recognition" index="11" label="Recognition">
      <ul className="grid gap-3 sm:grid-cols-2">
        {awards.map((a, i) => (
          <li
            key={a.text}
            className="reveal spotlight flex items-start gap-4 rounded-[14px] border border-line bg-raised p-4 transition-colors duration-150 hover:border-brand/40"
            style={{ "--i": i } as CSSProperties}
          >
            <OrgLogo mark={a.mark} size={40} />
            <span className="min-w-0">
              <span className="tabular text-grad font-mono text-[12px] font-semibold">{a.year}</span>
              <span className="mt-0.5 block text-[14.5px] leading-snug text-fg">{a.text}</span>
            </span>
          </li>
        ))}
      </ul>

      <h3 className="label mt-10">Leadership</h3>
      <ul className="mt-3 border-t border-line">
        {leadership.map((l) => (
          <li key={l.text} className="reveal flex items-center gap-4 border-b border-line py-3.5">
            <OrgLogo mark={l.mark} size={32} />
            <span className="label tabular w-14 shrink-0">{l.year}</span>
            <span className="text-muted">{l.text}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
