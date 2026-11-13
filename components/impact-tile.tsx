"use client";

import type { CSSProperties, ReactNode } from "react";
import { navigateTo } from "@/lib/navigate";
import { ArrowRight } from "./icons";

/** A clickable Impact card: the whole card jumps to the work the number came from. */
export function ImpactTile({
  target,
  source,
  className = "",
  i = 0,
  children,
}: {
  target: string;
  source: string;
  className?: string;
  i?: number;
  children: ReactNode;
}) {
  return (
    <li className={`reveal ${className}`} style={{ "--i": i } as CSSProperties}>
      <button
        type="button"
        onClick={() => navigateTo(target)}
        className="spotlight group flex h-full w-full flex-col rounded-[18px] border border-line bg-raised p-5 text-left transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/45 motion-reduce:hover:translate-y-0 md:p-6"
      >
        <div className="flex w-full flex-1 flex-col">{children}</div>
        <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-[11px] text-faint transition-colors duration-150 group-hover:text-fg">
          {source}
          <ArrowRight size={12} className="transition-transform duration-150 group-hover:translate-x-0.5" />
        </span>
      </button>
    </li>
  );
}
