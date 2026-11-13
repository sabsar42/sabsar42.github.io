"use client";

import { identity } from "@/lib/content";
import { useIsMac } from "@/lib/hooks";
import { useSite } from "./providers";
import { ThemeToggle } from "./theme-toggle";

const updated = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(
  new Date(`${identity.lastUpdated}T00:00:00Z`),
);

export function Footer() {
  const { openPalette, preloadPalette } = useSite();
  const isMac = useIsMac();
  return (
    <footer className="border-t border-line">
      <div className="container-x flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="label">
          Last updated <time dateTime={identity.lastUpdated}>{updated}</time>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openPalette}
            onPointerEnter={preloadPalette}
            onFocus={preloadPalette}
            className="label rounded-(--r-sm) px-1.5 py-1 transition-colors duration-150 hover:text-fg"
          >
            Press <kbd className="font-mono text-muted">{isMac ? "⌘K" : "Ctrl K"}</kbd> to ask my agent
          </button>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
