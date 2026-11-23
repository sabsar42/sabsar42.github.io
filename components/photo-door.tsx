"use client";

import Image from "next/image";
import me from "@/public/me.jpg";
import { useSite } from "./providers";

/**
 * The hero's only element: a small circular photo that is also the door to the agent.
 * The label under it is always visible so visitors know it's clickable.
 */
export function PhotoDoor() {
  const { openAgent, preloadAgent } = useSite();

  return (
    <div className="absolute bottom-[calc(28px+env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 flex-col items-center md:bottom-10">
      <button
        type="button"
        onClick={() => openAgent()}
        onPointerEnter={preloadAgent}
        onFocus={preloadAgent}
        aria-haspopup="dialog"
        aria-label="Click to ask my agent: open an AI agent that answers questions about Shakib's work"
        className="group flex cursor-pointer flex-col items-center rounded-[18px] px-3 pb-1 pt-1 focus-visible:outline-offset-4"
      >
        <span className="relative size-[72px] transition-transform duration-220 ease-out group-hover:scale-[1.04] group-active:scale-[0.97] motion-reduce:transition-none motion-reduce:group-hover:scale-100 md:size-[84px]">
          <span aria-hidden="true" className="photo-orbit" />
          <Image
            src={me}
            alt="Shakib Absar"
            preload
            fetchPriority="high"
            loading="eager"
            quality={80}
            sizes="(min-width: 768px) 84px, 72px"
            className="relative size-full rounded-full object-cover ring-1 ring-line"
          />
          <span
            aria-hidden="true"
            className="live-dot absolute size-2 rounded-full bg-live ring-2 ring-bg"
            style={{ right: "calc(14.64% - 4px)", bottom: "calc(14.64% - 4px)" }}
          />
        </span>
        <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-[12px] text-muted transition-colors duration-150 group-hover:text-fg">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-grad" />
          click to ask my agent
        </span>
      </button>
    </div>
  );
}
