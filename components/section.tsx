import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  index: string;
  label: string;
  children: ReactNode;
  /** Full-width content with the label above instead of in the left column. */
  wide?: boolean;
  className?: string;
};

export function Section({ id, index, label, children, wide = false, className = "" }: SectionProps) {
  return (
    <section id={id} suppressHydrationWarning aria-labelledby={`${id}-title`} className={`border-t border-line ${className}`}>
      <div className="container-x grid grid-cols-1 gap-x-6 gap-y-8 py-12 md:grid-cols-12 md:py-[4.5rem]">
        <div className={wide ? "md:col-span-12" : "md:col-span-3"}>
          <h2
            id={`${id}-title`}
            className={`label flex gap-3 ${wide ? "" : "md:sticky md:top-[calc(var(--topbar-h)+28px)]"}`}
          >
            <span className="tabular section-index font-semibold" aria-hidden="true">
              {index}
            </span>
            <span className="text-muted">{label}</span>
          </h2>
        </div>
        <div className={wide ? "md:col-span-12" : "md:col-span-9"}>{children}</div>
      </div>
    </section>
  );
}
