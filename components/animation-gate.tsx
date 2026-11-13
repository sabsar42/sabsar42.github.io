"use client";

import { useEffect } from "react";

/**
 * Pauses every CSS animation inside the hero and each section (it sets data-anim on them at runtime, never in server markup, so hydration never sees a mismatch) while it is off screen, so decorative motion
 * (graph pulses, live dots, marquee) never costs main-thread time for content the visitor can't see.
 */
export function AnimationGate() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("#top, #about, main > section");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) (e.target as HTMLElement).dataset.anim = e.isIntersecting ? "on" : "off";
      },
      { rootMargin: "120px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
