"use client";

import { useState } from "react";

type Mode = "text" | "image";

const MODELS: Record<Mode, { name: string; task: string; acc: number; color: string; note: string }> = {
  text: {
    name: "BERT",
    task: "hate speech",
    acc: 94.2,
    color: "var(--c-agent)",
    note: "Fine-tuned BERT classifies the post text.",
  },
  image: {
    name: "Vision model",
    task: "NSFW",
    acc: 97.1,
    color: "var(--c-vision)",
    note: "Adversarially trained, so perturbed images are harder to sneak through.",
  },
};

function Gauge({ value, color, label, dim }: { value: number; color: string; label: string; dim: boolean }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className={`flex items-center gap-3 transition-opacity duration-220 ${dim ? "opacity-40" : "opacity-100"}`}>
      <svg viewBox="0 0 80 80" className="size-16 -rotate-90" aria-hidden="true">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--line-strong)" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * c} ${c}`}
        />
      </svg>
      <div>
        <p className="tabular font-mono text-[22px] leading-none tracking-[-0.03em]" style={{ color }}>
          {value}%
        </p>
        <p className="mt-1 text-small text-muted">{label}</p>
      </div>
    </div>
  );
}

export function GuardianDemo() {
  const [mode, setMode] = useState<Mode>("text");
  const [sent, setSent] = useState(0);
  const m = MODELS[mode];

  return (
    <div className="rounded-(--r-md) border border-line bg-raised p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="radiogroup" aria-label="Post type" className="inline-flex rounded-full border border-line p-0.5">
          {(["text", "image"] as Mode[]).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={mode === k}
              onClick={() => {
                setMode(k);
                setSent((n) => n + 1);
              }}
              className="h-7 rounded-full px-3 font-mono text-[12px] transition-colors duration-150"
              style={mode === k ? { background: MODELS[k].color, color: "var(--bg)" } : { color: "var(--fg-muted)" }}
            >
              {k} post
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSent((n) => n + 1)}
          className="h-7 rounded-full border border-line-strong px-3 font-mono text-[12px] text-fg transition-colors duration-150 hover:border-fg"
        >
          send ↗
        </button>
      </div>

      {/* Flow: post → one FastAPI endpoint → the right model */}
      <div className="relative mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-4">
        <div className="rounded-(--r-sm) border border-line bg-bg p-3">
          <p className="label">incoming post</p>
          {mode === "text" ? (
            <div className="mt-2 space-y-1.5" aria-hidden="true">
              <div className="h-2 w-11/12 rounded-full bg-line-strong" />
              <div className="h-2 w-8/12 rounded-full bg-line-strong" />
              <div className="h-2 w-9/12 rounded-full bg-line-strong" />
            </div>
          ) : (
            <div aria-hidden="true" className="mt-2 grid aspect-[4/3] place-items-center rounded-[4px] bg-line-strong/60">
              <svg viewBox="0 0 24 24" className="size-6 text-faint" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 16 5-5 4 4 3-3 6 6" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="relative h-0.5 w-10 overflow-hidden rounded-full bg-line-strong md:w-16">
            <span key={sent} className="packet absolute inset-y-0 left-0 w-3 rounded-full" style={{ background: m.color }} />
          </div>
          <span className="rounded-full border border-line bg-bg px-2 py-1 font-mono text-[10px] text-muted md:text-[11px]">
            POST /moderate
          </span>
          <span className="label text-[10px]">FastAPI</span>
        </div>

        <div className="space-y-2">
          {(["text", "image"] as Mode[]).map((k) => {
            const on = k === mode;
            return (
              <div
                key={k}
                className="rounded-(--r-sm) border p-2.5 transition-all duration-220"
                style={{
                  borderColor: on ? MODELS[k].color : "var(--line)",
                  background: on ? `color-mix(in oklab, ${MODELS[k].color} 12%, transparent)` : "var(--bg)",
                  opacity: on ? 1 : 0.5,
                }}
              >
                <p className="font-mono text-[12px]" style={{ color: on ? MODELS[k].color : "var(--fg-muted)" }}>
                  {MODELS[k].name}
                </p>
                <p className="text-[12px] text-muted">{MODELS[k].task}</p>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-5 text-small text-muted" aria-live="polite">
        <span className="font-mono" style={{ color: m.color }}>
          → {m.name}
        </span>{" "}
        {m.note}
      </p>

      <div className="mt-5 flex flex-wrap gap-x-8 gap-y-4 border-t border-line pt-5">
        <Gauge value={94.2} color={MODELS.text.color} label="hate speech accuracy (BERT)" dim={mode !== "text"} />
        <Gauge value={97.1} color={MODELS.image.color} label="NSFW accuracy (vision)" dim={mode !== "image"} />
      </div>
      <p className="label mt-4">Architecture walkthrough. Accuracy figures are from the project; no model runs here.</p>
    </div>
  );
}
