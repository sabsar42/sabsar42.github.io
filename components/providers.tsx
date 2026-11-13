"use client";

import dynamic from "next/dynamic";
import { ThemeProvider } from "next-themes";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/* Lazy chunks: cost nothing until the visitor shows intent. */
const loadAgent = () => import("./agent/agent-panel");
const loadPalette = () => import("./command-palette");
const AgentPanel = dynamic(loadAgent, { ssr: false });
const CommandPalette = dynamic(loadPalette, { ssr: false });

type PendingQuestion = { id: number; text: string };
export type AgentMode = "ask" | "fit";

type SiteContextValue = {
  agentOpen: boolean;
  paletteOpen: boolean;
  pendingQuestion: PendingQuestion | null;
  agentMode: AgentMode;
  setAgentMode: (mode: AgentMode) => void;
  /** Opens the agent; a question is sent right away. Pass mode "fit" to start a fit check in the input. */
  openAgent: (question?: string, mode?: AgentMode) => void;
  closeAgent: (opts?: { restoreFocus?: boolean }) => void;
  consumeQuestion: (id: number) => void;
  openPalette: () => void;
  closePalette: () => void;
  preloadAgent: () => void;
  preloadPalette: () => void;
};

const SiteContext = createContext<SiteContextValue | null>(null);

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside <Providers>");
  return ctx;
}

export function Providers({ children }: { children: ReactNode }) {
  const [agentOpen, setAgentOpen] = useState(false);
  const [agentMounted, setAgentMounted] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteMounted, setPaletteMounted] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<PendingQuestion | null>(null);
  const [agentMode, setAgentMode] = useState<AgentMode>("ask");
  const questionId = useRef(0);
  const returnFocus = useRef<HTMLElement | null>(null);

  const preloadAgent = useCallback(() => {
    void loadAgent();
  }, []);
  const preloadPalette = useCallback(() => {
    void loadPalette();
  }, []);

  const openAgent = useCallback((question?: string, mode: AgentMode = "ask") => {
    if (document.activeElement instanceof HTMLElement && document.activeElement !== document.body) {
      returnFocus.current = document.activeElement;
    }
    setPaletteOpen(false);
    setAgentMode(mode);
    setAgentMounted(true);
    setAgentOpen(true);
    const text = question?.trim();
    if (text) {
      questionId.current += 1;
      setPendingQuestion({ id: questionId.current, text });
    }
  }, []);

  const closeAgent = useCallback(({ restoreFocus = true }: { restoreFocus?: boolean } = {}) => {
    setAgentOpen(false);
    const el = returnFocus.current;
    returnFocus.current = null;
    if (restoreFocus && el && el.isConnected) {
      requestAnimationFrame(() => el.focus({ preventScroll: true }));
    }
  }, []);

  const consumeQuestion = useCallback((id: number) => {
    setPendingQuestion((q) => (q && q.id === id ? null : q));
  }, []);

  const openPalette = useCallback(() => {
    setPaletteMounted(true);
    setPaletteOpen(true);
  }, []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  // ⌘K / Ctrl+K toggles the palette everywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteMounted(true);
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo<SiteContextValue>(
    () => ({
      agentOpen,
      paletteOpen,
      pendingQuestion,
      agentMode,
      setAgentMode,
      openAgent,
      closeAgent,
      consumeQuestion,
      openPalette,
      closePalette,
      preloadAgent,
      preloadPalette,
    }),
    [agentOpen, paletteOpen, pendingQuestion, agentMode, openAgent, closeAgent, consumeQuestion, openPalette, closePalette, preloadAgent, preloadPalette],
  );

  return (
    <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <SiteContext.Provider value={value}>
        {children}
        {agentMounted && <AgentPanel />}
        {paletteMounted && <CommandPalette />}
      </SiteContext.Provider>
    </ThemeProvider>
  );
}
