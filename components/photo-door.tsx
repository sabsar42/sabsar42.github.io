"use client";

import Image from "next/image";
import { useState } from "react";
import me from "@/public/me.jpg";
import { useSite } from "./providers";

/**
 * The hero's only element: a small circular photo that is also the door to the agent.
 * Desktop: hover/focus reveals the hint, click opens. Touch: first tap reveals the hint, second opens.
 */
export function PhotoDoor() {
  const { openAgent, preloadAgent } = useSite();
  const [hintShown, setHintShown] = useState(false);

  const onClick = () => {
    const touchOnly = window.matchMedia("(hover: none)").matches;
    if (touchOnly && !hintShown) {
      setHintShown(true);
      preloadAgent();
      return;
    }
    openAgent();
  };

  return (
    <div className="group absolute bottom-[calc(13svh+env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 flex-col items-center md:bottom-[15svh]">
      <button
        type="button"
        onClick={onClick}
        onPointerEnter={preloadAgent}
        onFocus={preloadAgent}
        aria-haspopup="dialog"
        aria-label="Ask my agent: open an AI agent that answers questions about Shakib's work"
        className="peer relative size-[72px] cursor-pointer rounded-full transition-transform duration-220 ease-out hover:scale-[1.04] focus-visible:rounded-full focus-visible:outline-offset-4 active:scale-[0.97] motion-reduce:transition-none motion-reduce:hover:scale-100 md:size-[84px]"
      >
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
      </button>
      <span
        aria-hidden="true"
        className={`label pointer-events-none mt-3 transition-[opacity,transform] duration-220 ease-out group-hover:translate-y-0 group-hover:opacity-100 peer-focus-visible:translate-y-0 peer-focus-visible:opacity-100 motion-reduce:transition-opacity ${
          hintShown ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
        }`}
      >
        ask my agent
      </span>
    </div>
  );
}
