"use client";

import { useEffect, useState } from "react";

/* Illustrative sample only: not real patient data. */
const RX = [
  { line: "Tab. Paracetamol 500 mg   1+0+1   5 days", medicine: "Paracetamol", dose: "500 mg", schedule: "morning + night · 5 days" },
  { line: "Cap. Omeprazole 20 mg   1+0+0   before food", medicine: "Omeprazole", dose: "20 mg", schedule: "morning, before food" },
  { line: "Tab. Cetirizine 10 mg   0+0+1   7 days", medicine: "Cetirizine", dose: "10 mg", schedule: "night · 7 days" },
];

const COLORS = ["var(--c-research)", "var(--c-vision)", "var(--c-ship)"];

export function PharmaDemo() {
  // 0 idle · 1 scanning · 2..4 rows extracted
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step === 0 || step >= RX.length + 1) return;
    const t = window.setTimeout(() => setStep(step + 1), step === 1 ? 1000 : 380);
    return () => window.clearTimeout(t);
  }, [step]);

  const scanning = step === 1;
  const rows = Math.max(0, step - 1);
  const done = rows === RX.length;

  return (
    <div className="rounded-(--r-md) border border-line bg-raised p-4 md:p-6">
      <div className="grid gap-5 md:grid-cols-2">
        {/* prescription */}
        <div className="relative overflow-hidden rounded-(--r-sm) border border-line bg-bg p-4">
          <div className="flex items-baseline justify-between">
            <p className="font-serif text-[22px] italic text-fg">Rx</p>
            <p className="label">sample prescription</p>
          </div>
          <ul className="mt-3 space-y-2.5">
            {RX.map((r, i) => (
              <li
                key={r.line}
                className="font-serif text-[15px] italic transition-colors duration-220"
                style={{ color: rows > i ? COLORS[i] : "var(--fg-muted)" }}
              >
                {r.line}
              </li>
            ))}
          </ul>
          <div aria-hidden="true" className="mt-4 h-px w-24 bg-line-strong" />
          {scanning && (
            <span
              aria-hidden="true"
              className="scan-line pointer-events-none absolute inset-x-0 h-10"
              style={{ background: "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--c-research) 30%, transparent), transparent)" }}
            />
          )}
        </div>

        {/* structured output */}
        <div className="rounded-(--r-sm) border border-line bg-bg p-4">
          <div className="flex items-center justify-between">
            <p className="label">structured · Gemini + knowledge graph</p>
            <span className="label" aria-live="polite">
              {scanning ? "reading…" : done ? "done" : ""}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-[1.1fr_0.7fr_1.4fr] gap-x-3 border-b border-line pb-2 font-mono text-[11px] text-faint">
            <span>medicine</span>
            <span>dose</span>
            <span>schedule</span>
          </div>
          <ul>
            {RX.map((r, i) => (
              <li
                key={r.medicine}
                className="grid grid-cols-[1.1fr_0.7fr_1.4fr] gap-x-3 border-b border-line py-2 text-[13px] transition-all duration-220"
                style={{ opacity: rows > i ? 1 : 0.15, transform: rows > i ? "none" : "translateY(4px)" }}
              >
                <span className="font-medium" style={{ color: COLORS[i] }}>
                  {r.medicine}
                </span>
                <span className="tabular font-mono text-muted">{r.dose}</span>
                <span className="text-muted">{r.schedule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setStep(step === 0 || done ? 1 : step)}
          disabled={step > 0 && !done}
          className="inline-flex h-8 items-center gap-2 rounded-full border border-research/50 bg-research/10 px-4 font-mono text-[12px] text-research transition-colors duration-150 hover:bg-research/20 disabled:opacity-60"
        >
          {done ? "↺ run again" : "▶ run OCR → structure"}
        </button>
        <div className="flex min-w-[220px] flex-1 items-center gap-3 md:max-w-[280px]">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-research" style={{ width: "92%" }} />
          </div>
          <span className="tabular font-mono text-[12px] text-research">92% OCR extraction</span>
        </div>
      </div>
      <p className="label mt-4">Illustrative sample, not real patient data. The 92% figure is the project&apos;s measured text extraction accuracy.</p>
    </div>
  );
}
