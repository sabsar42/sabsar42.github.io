"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { identity } from "@/lib/content";
import { useIsMac } from "@/lib/hooks";
import { navigateTo } from "@/lib/navigate";
import me from "@/public/me.jpg";
import { ChevronDown, SearchIcon } from "./icons";
import { focusOpenChannel } from "./open-channel";
import { useSite } from "./providers";
import { ThemeToggle } from "./theme-toggle";

type Mode = "hidden" | "bar" | "pill";

const LINKS: { id: string; label: string }[] = [
  { id: "brief", label: "Brief" },
  { id: "proof", label: "Impact" },
  { id: "clients", label: "Client work" },
  { id: "work", label: "Projects" },
  { id: "research", label: "Research" },
  { id: "news", label: "News" },
  { id: "contact", label: "Contact" },
];

/** Reads "07" and "Selected work" from a section's heading so labels never drift from the page. */
function sectionMeta(id: string): { index: string; label: string } {
  if (id === "about") return { index: "00", label: "Intro" };
  const h = document.getElementById(`${id}-title`);
  const spans = h?.querySelectorAll("span");
  return { index: spans?.[0]?.textContent ?? "", label: spans?.[1]?.textContent ?? id };
}

/**
 * Dynamic-Island navigation. Hidden over the hero (it stays empty), a full bar at the top of the
 * content, then it condenses into a floating pill showing where you are. Hover, focus, or tap expands it.
 */
export function IslandNav() {
  const { openAgent, openPalette, preloadAgent, preloadPalette } = useSite();
  const isMac = useIsMac();
  const [mode, setMode] = useState<Mode>("hidden");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState({ id: "about", index: "00", label: "Intro" });
  const [progress, setProgress] = useState(0);
  const navRef = useRef<HTMLElement>(null);
  const openedAt = useRef<number | null>(null);

  useEffect(() => {
    openedAt.current = open ? window.scrollY : null;
  }, [open]);

  // Mode + scroll progress.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const hero = document.getElementById("top");
      const about = document.getElementById("about");
      const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
      const aboutTop = about ? about.getBoundingClientRect().top : 0;
      const next: Mode = heroBottom > 56 ? "hidden" : aboutTop > -260 ? "bar" : "pill";
      setMode(next);
      // Leave the island expanded only while the visitor stays put.
      if (next !== "pill" || (openedAt.current !== null && Math.abs(window.scrollY - openedAt.current) > 48)) setOpen(false);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.round((window.scrollY / max) * 100) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Which section is under the middle of the screen.
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("#about, main section[id]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive({ id: e.target.id, ...sectionMeta(e.target.id) });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Close the expanded island on outside tap or Esc.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pill = mode === "pill";
  const go = (id: string) => {
    setOpen(false);
    navigateTo(id, { flash: false });
  };
  const hoverable = () => window.matchMedia("(hover: hover)").matches;
  const R = 9;
  const C = 2 * Math.PI * R;

  return (
    <div
      inert={mode === "hidden"}
      className={`pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-opacity ${
        mode === "hidden" ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <nav
        ref={navRef}
        aria-label="Site"
        data-mode={mode}
        data-open={open || undefined}
        onPointerEnter={() => pill && hoverable() && setOpen(true)}
        onPointerLeave={() => pill && hoverable() && setOpen(false)}
        onFocus={(e) => pill && e.target.matches(":focus-visible") && setOpen(true)}
        className={`island pointer-events-auto overflow-hidden ${
          pill
            ? `mt-3 rounded-[26px] border-grad shadow-[0_18px_50px_-20px_rgb(0_0_0/0.6),0_0_0_1px_rgb(255_107_26/0.06)] ${
                open ? "w-[min(94vw,680px)]" : "w-[min(92vw,420px)]"
              }`
            : "mt-0 w-full rounded-none border-b border-line bg-bg"
        }`}
        style={pill ? ({ "--surface": "color-mix(in oklab, var(--bg-raised) 92%, black)" } as React.CSSProperties) : undefined}
      >
        <div className={`flex items-center justify-between gap-2 ${pill ? "h-11 pl-1.5 pr-1.5" : "container-x h-(--topbar-h)"}`}>
          {/* Left: name (bar) or where-you-are (pill) */}
          <div className="relative flex min-w-0 flex-1 items-center">
            <a
              href="#top"
              tabIndex={pill ? -1 : 0}
              aria-hidden={pill || undefined}
              className={`whitespace-nowrap text-[14px] font-semibold tracking-[-0.01em] text-fg transition-[opacity,transform] duration-300 ${
                pill ? "pointer-events-none absolute -translate-y-2 opacity-0" : "opacity-100"
              }`}
            >
              {identity.name}
            </a>
            <button
              type="button"
              tabIndex={pill ? 0 : -1}
              aria-hidden={!pill || undefined}
              aria-expanded={open}
              aria-label={`Current section: ${active.label}. Show navigation`}
              onClick={() => setOpen((o) => (hoverable() ? true : !o))}
              className={`flex min-w-0 items-center gap-2.5 rounded-full py-1 pl-0.5 pr-2 text-left transition-[opacity,transform] duration-300 ${
                pill ? "opacity-100" : "pointer-events-none absolute translate-y-2 opacity-0"
              }`}
            >
              <span className="relative shrink-0">
                <Image src={me} alt="" width={30} height={30} sizes="30px" className="size-[30px] rounded-full object-cover" />
                <span aria-hidden="true" className="absolute -bottom-px -right-px size-2 rounded-full bg-live ring-2 ring-raised" />
              </span>
              <span key={active.id} className="stage-in flex min-w-0 items-baseline gap-2">
                <span className="section-index tabular font-mono text-[11px] font-semibold">{active.index}</span>
                <span className="truncate text-[13px] font-medium text-fg">{active.label}</span>
              </span>
              <ChevronDown size={13} className={`shrink-0 text-faint transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Right: shortcuts */}
          <div className="flex shrink-0 items-center gap-1">
            {pill && (
              <svg width="24" height="24" viewBox="0 0 24 24" className="mr-0.5 -rotate-90" aria-label={`${progress}% scrolled`} role="img">
                <circle cx="12" cy="12" r={R} fill="none" stroke="var(--line-strong)" strokeWidth="2" />
                <circle
                  cx="12"
                  cy="12"
                  r={R}
                  fill="none"
                  stroke="var(--brand-b)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - progress / 100)}
                  className="transition-[stroke-dashoffset] duration-150"
                />
              </svg>
            )}
            {!pill && (
              <span className="hidden items-center gap-1.5 rounded-full border border-ship/35 bg-ship/5 px-2.5 py-1 font-mono text-[11px] text-ship lg:inline-flex">
                <span aria-hidden="true" className="live-dot relative size-1.5 rounded-full bg-live" />
                {identity.availabilityShort}
              </span>
            )}
            <button
              type="button"
              onClick={openPalette}
              onPointerEnter={preloadPalette}
              onFocus={preloadPalette}
              aria-label="Open command palette"
              aria-keyshortcuts={isMac ? "Meta+K" : "Control+K"}
              className="inline-flex h-8 items-center gap-1.5 rounded-full px-2 font-mono text-[12px] text-muted transition-colors duration-150 hover:bg-hover hover:text-fg"
            >
              {pill ? <SearchIcon /> : (
                <>
                  <SearchIcon className="md:hidden" />
                  <kbd className="hidden font-mono md:inline">{isMac ? "⌘K" : "Ctrl K"}</kbd>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => openAgent()}
              onPointerEnter={preloadAgent}
              onFocus={preloadAgent}
              aria-haspopup="dialog"
              className={`btn-brand inline-flex items-center gap-2 rounded-full font-medium ${pill ? "h-8 px-3 text-[12.5px]" : "h-8 px-3.5 text-[13px]"}`}
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-[#0a0a0a]" />
              {pill ? "Ask" : "Ask my agent"}
            </button>
            {!pill && <ThemeToggle />}
          </div>
        </div>

        {/* Expanded island: section links and shortcuts */}
        {pill && (
          <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className="min-h-0 overflow-hidden" inert={!open}>
              <div className="flex flex-wrap items-center gap-1 border-t border-line px-2 py-2">
                {LINKS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => go(l.id)}
                    aria-current={active.id === l.id ? "true" : undefined}
                    className={`h-8 rounded-full px-3 text-[12.5px] transition-colors duration-150 ${
                      active.id === l.id ? "bg-hover text-fg" : "text-muted hover:bg-hover hover:text-fg"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
                <span aria-hidden="true" className="mx-1 h-4 w-px bg-line-strong" />
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    focusOpenChannel();
                  }}
                  className="h-8 rounded-full px-3 text-[12.5px] font-medium text-brand transition-colors duration-150 hover:bg-brand/10"
                >
                  Message me
                </button>
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
