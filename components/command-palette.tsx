"use client";

import { Command } from "cmdk";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { identity, projects } from "@/lib/content";
import { navigateTo } from "@/lib/navigate";
import { copyText } from "./copy-email";
import { ArrowRight, ArrowUpRight, CheckIcon, CopyIcon, FileIcon, MoonIcon, SearchIcon, SunIcon } from "./icons";
import { focusOpenChannel } from "./open-channel";
import { useSite } from "./providers";

const ASK = "__ask";

const SECTIONS: { id: string; label: string; keywords: string[] }[] = [
  { id: "top", label: "Top", keywords: ["home", "start", "hero"] },
  { id: "about", label: "About", keywords: ["intro", "now", "location", "time"] },
  { id: "brief", label: "The 30-second brief", keywords: ["summary", "hire", "timezone", "overview", "founder"] },
  { id: "clients", label: "Client work", keywords: ["case studies", "clients", "consulting", "results"] },
  { id: "news", label: "News", keywords: ["updates", "latest", "accepted", "announcements"] },
  { id: "proof", label: "Impact", keywords: ["metrics", "numbers", "proof"] },
  { id: "experience", label: "Ship log", keywords: ["experience", "work", "jobs", "roles", "education"] },
  { id: "agents", label: "How I build agents", keywords: ["agent", "graph", "langgraph", "architecture"] },
  { id: "work", label: "Selected work", keywords: ["projects", "demos", "geoseg", "content guardian", "digi-pharma", "speakmock", "mindreva", "live"] },
  { id: "github", label: "Shipping in public", keywords: ["github", "contributions", "activity", "repos", "commits"] },
  { id: "research", label: "Research", keywords: ["publications", "papers"] },
  { id: "stack", label: "Stack", keywords: ["skills", "tools", "technologies"] },
  { id: "elsewhere", label: "Elsewhere", keywords: ["scholar", "kaggle", "hugging face", "youtube", "linkedin", "researchgate", "profiles", "citations"] },
  { id: "recognition", label: "Recognition", keywords: ["awards", "leadership", "hackathon"] },
  { id: "contact", label: "Contact", keywords: ["email", "reach", "hire"] },
];

const LINKS = [
  { label: "Open GitHub", href: identity.links.github, keywords: ["code", "repos"] },
  { label: "Open Google Scholar", href: identity.links.scholar, keywords: ["papers", "citations"] },
  { label: "Open LinkedIn", href: identity.links.linkedin, keywords: ["profile"] },
  { label: "Open Kaggle", href: identity.links.kaggle, keywords: ["competitions"] },
  { label: "Open academic site", href: identity.links.academic, keywords: ["research", "website"] },
  ...projects
    .filter((p) => p.live)
    .map((p) => ({ label: `Open ${p.name} (live)`, href: p.links.find((l) => l.label === "Live")!.href, keywords: ["live", "app", "product"] })),
];

/** Strict token match for commands; the "ask" row always stays available (last when commands match). */
function filter(value: string, search: string, keywords?: string[]): number {
  if (value === ASK) return 1;
  const hay = `${value} ${(keywords ?? []).join(" ")}`.toLowerCase();
  const tokens = search.toLowerCase().split(/\s+/).filter(Boolean);
  return tokens.every((t) => hay.includes(t)) ? 1 : 0;
}

function Item({
  value,
  keywords,
  onSelect,
  icon,
  children,
  hint,
}: {
  value: string;
  keywords?: string[];
  onSelect: () => void;
  icon: ReactNode;
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <Command.Item value={value} keywords={keywords} onSelect={onSelect}>
      <span className="flex size-4 shrink-0 items-center justify-center text-faint">{icon}</span>
      <span className="min-w-0 flex-1 truncate text-[14px]">{children}</span>
      {hint && <span className="label shrink-0">{hint}</span>}
    </Command.Item>
  );
}

export default function CommandPalette() {
  const { paletteOpen, closePalette, openAgent } = useSite();
  const { resolvedTheme, setTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const close = () => {
    closePalette();
    setSearch("");
  };

  const run = (fn: () => void) => () => {
    close();
    fn();
  };

  const question = search.trim();

  // With a query, commands that match come first; the ask row is the fallback Enter target.
  const askGroup = (
        <Command.Group heading="Agent">
          <Item
            value={ASK}
            onSelect={run(() => openAgent(question || undefined))}
            icon={<span aria-hidden="true" className="size-1.5 rounded-full bg-live" />}
            hint="↵"
          >
            {question ? (
              <>
                Ask my agent: <span className="text-fg">“{question}”</span>
              </>
            ) : (
              "Ask my agent"
            )}
          </Item>
          {!question && (
            <Item
              value="Run a fit check"
              keywords={["hire", "hiring", "role", "job", "fit"]}
              onSelect={run(() => openAgent(undefined, "fit"))}
              icon={<span aria-hidden="true" className="size-1.5 rounded-full bg-data" />}
            >
              Run a fit check for your role
            </Item>
          )}
        </Command.Group>
  );

  return (
    <Command.Dialog
      open={paletteOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
      label="Command palette"
      filter={filter}
      loop
      className="overflow-hidden rounded-(--r-md) border border-line-strong bg-raised"
    >
      <div className="flex items-center gap-3 border-b border-line px-4">
        <SearchIcon className="shrink-0 text-faint" />
        <Command.Input
          value={search}
          onValueChange={setSearch}
          maxLength={500}
          placeholder="Search, or ask my agent anything…"
          className="h-12 w-full bg-transparent text-[16px] text-fg outline-none placeholder:text-faint focus-visible:outline-none md:text-[14.5px]"
        />
        <kbd className="label hidden shrink-0 rounded-[4px] border border-line px-1.5 py-px sm:inline">esc</kbd>
      </div>

      <Command.List className="p-2">
        <Command.Empty>No matches.</Command.Empty>

        {!question && askGroup}

        <Command.Group heading="Go to">
          {SECTIONS.map((s) => (
            <Item
              key={s.id}
              value={`Go to ${s.label}`}
              keywords={s.keywords}
              onSelect={run(() => navigateTo(s.id, { flash: false }))}
              icon={<ArrowRight size={14} />}
            >
              {s.label}
            </Item>
          ))}
        </Command.Group>

        <Command.Group heading="Actions">
          <Item
            value="Message Shakib"
            keywords={["contact", "open channel", "hire", "collaborate", "project", "hello", "message"]}
            onSelect={run(() => focusOpenChannel())}
            icon={<ArrowRight size={14} />}
          >
            Message Shakib (Open Channel)
          </Item>
          <Item
            value="Copy email"
            keywords={["contact", identity.email]}
            onSelect={async () => {
              if (!(await copyText(identity.email))) return;
              setCopied(true);
              timer.current = window.setTimeout(() => {
                setCopied(false);
                close();
              }, 700);
            }}
            icon={copied ? <CheckIcon size={14} className="text-accent" /> : <CopyIcon size={14} />}
            hint={copied ? "copied" : identity.email}
          >
            Copy email
          </Item>
          {LINKS.map((l) => (
            <Item
              key={l.href}
              value={l.label}
              keywords={l.keywords}
              onSelect={run(() => window.open(l.href, "_blank", "noopener,noreferrer"))}
              icon={<ArrowUpRight size={14} />}
            >
              {l.label}
            </Item>
          ))}
          {identity.cvPath && (
            <Item
              value="Download CV"
              keywords={["resume", "pdf"]}
              onSelect={run(() => {
                const a = document.createElement("a");
                a.href = identity.cvPath as string;
                a.download = "";
                a.click();
              })}
              icon={<FileIcon size={14} />}
            >
              Download CV
            </Item>
          )}
          <Item
            value="Toggle theme"
            keywords={["dark", "light", "mode", "appearance"]}
            onSelect={run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))}
            icon={resolvedTheme === "dark" ? <SunIcon size={14} /> : <MoonIcon size={14} />}
          >
            {resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          </Item>
        </Command.Group>

        {question && askGroup}
      </Command.List>
    </Command.Dialog>
  );
}
