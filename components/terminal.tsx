"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { identity } from "@/lib/content";
import { copyText } from "./copy-email";
import { useSite } from "./providers";

type Line = { kind: "in" | "out" | "ok" | "err"; text: ReactNode };

const LINKS: Record<string, string> = {
  github: identity.links.github,
  scholar: identity.links.scholar,
  linkedin: identity.links.linkedin,
  kaggle: identity.links.kaggle,
  academic: identity.links.academic,
};

const HELP: [string, string][] = [
  ["email", "copy my email"],
  ["github · scholar · linkedin · kaggle · academic", "open a profile"],
  ["ask <question>", "ask my agent"],
  ["now", "what I'm working on"],
  ["cv", "download my CV"],
  ["clear", "clear the screen"],
];

const QUICK = ["help", "email", "github", "ask what does he build?"];

export function Terminal() {
  const { openAgent } = useSite();
  const [lines, setLines] = useState<Line[]>([
    { kind: "out", text: "Type a command, or anything else to ask my agent. Try help." },
  ]);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const run = async (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    const [head, ...rest] = cmd.split(/\s+/);
    const name = head.toLowerCase();
    const out: Line[] = [{ kind: "in", text: cmd }];

    if (name === "clear") {
      setLines([]);
      return;
    }
    if (name === "help") {
      out.push(
        ...HELP.map(([c, d]) => ({
          kind: "out" as const,
          text: (
            <>
              <span className="text-vision">{c.padEnd(18, " ")}</span> <span className="text-faint">{d}</span>
            </>
          ),
        })),
      );
    } else if (name === "email") {
      const ok = await copyText(identity.email);
      out.push({ kind: ok ? "ok" : "out", text: ok ? `${identity.email}  ✓ copied` : identity.email });
    } else if (LINKS[name]) {
      window.open(LINKS[name], "_blank", "noopener,noreferrer");
      out.push({ kind: "ok", text: `opening ${LINKS[name].replace(/^https?:\/\//, "")}` });
    } else if (name === "now") {
      out.push({ kind: "out", text: identity.now });
    } else if (name === "cv") {
      if (identity.cvPath) {
        const a = document.createElement("a");
        a.href = identity.cvPath;
        a.download = "";
        a.click();
        out.push({ kind: "ok", text: "downloading CV" });
      } else {
        out.push({ kind: "err", text: `CV isn't on the site yet. Email ${identity.email} for a copy.` });
      }
    } else {
      const question = name === "ask" ? rest.join(" ") : cmd;
      if (question.split(/\s+/).length >= 2 || name === "ask") {
        if (!question) {
          out.push({ kind: "err", text: "usage: ask <question>" });
        } else {
          out.push({ kind: "ok", text: "→ handing your question to my agent" });
          openAgent(question);
        }
      } else {
        out.push({ kind: "err", text: `command not found: ${name}. Try help.` });
      }
    }
    setLines((l) => [...l, ...out].slice(-40));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void run(value);
    setValue("");
  };

  return (
    <div className="overflow-hidden rounded-(--r-md) border border-line bg-raised">
      <div className="flex h-9 items-center gap-2 border-b border-line px-3">
        <span aria-hidden="true" className="size-2.5 rounded-full bg-agent" />
        <span aria-hidden="true" className="size-2.5 rounded-full bg-data" />
        <span aria-hidden="true" className="size-2.5 rounded-full bg-ship" />
        <span className="ml-2 font-mono text-[12px] text-faint">shakib@sylhet: ~</span>
      </div>
      <div
        ref={bodyRef}
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
        onClick={() => inputRef.current?.focus()}
        className="max-h-64 min-h-40 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-relaxed"
      >
        {lines.map((l, i) => (
          <p
            key={i}
            className={`whitespace-pre-wrap break-words ${
              l.kind === "in" ? "text-fg" : l.kind === "ok" ? "text-ship" : l.kind === "err" ? "text-agent" : "text-muted"
            }`}
          >
            {l.kind === "in" && <span className="text-ship">$ </span>}
            {l.text}
          </p>
        ))}
        <form onSubmit={onSubmit} className="flex items-center">
          <label htmlFor="term-input" className="sr-only">
            Terminal command
          </label>
          <span className="mr-2 text-ship" aria-hidden="true">
            $
          </span>
          <input
            id="term-input"
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={500}
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-[16px] text-fg caret-ship outline-none focus-visible:outline-none md:text-[13px]"
            placeholder="help"
          />
        </form>
      </div>
      <div className="flex flex-wrap gap-1.5 border-t border-line px-3 py-2.5">
        {QUICK.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => void run(q)}
            className="h-7 rounded-full border border-line px-2.5 font-mono text-[11px] text-muted transition-colors duration-150 hover:border-ship/60 hover:text-fg"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
