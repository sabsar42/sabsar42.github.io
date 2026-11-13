"use client";

import { useEffect, useState } from "react";

const STAGES = [
  { id: "book", label: "book", title: "Student books a slot", body: "Picks a 20-minute IELTS speaking slot and submits a payment transaction ID.", tech: ["Next.js", "Supabase"] },
  { id: "verify", label: "verify", title: "Admin verifies", body: "Password-protected dashboard with cookie-based auth: verify payment, confirm or reject, manage time slots.", tech: ["Next.js", "Supabase"] },
  { id: "confirm", label: "confirm", title: "Confirmation email", body: "A React Email template goes out through Resend with a private magic-link session page.", tech: ["Resend", "React Email"] },
  { id: "remind", label: "remind", title: "Reminders", body: "Automatic reminder emails 24 hours and 1 hour before the session.", tech: ["Resend"] },
  { id: "session", label: "session", title: "Session", body: "The magic-link page holds the Google Meet link for the session.", tech: ["Next.js"] },
  { id: "result", label: "result", title: "Result ready", body: "Admin uploads the result file to Supabase Storage; a 'result ready' email follows.", tech: ["Supabase Storage", "Resend"] },
  { id: "cleanup", label: "+72h", title: "Cleanup", body: "A Vercel Cron job deletes session pages and result files 72 hours after completion.", tech: ["Vercel Cron"] },
];

export function SpeakMockDemo() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => {
      if (i + 1 < STAGES.length) setI(i + 1);
      else setPlaying(false);
    }, 1400);
    return () => window.clearTimeout(t);
  }, [playing, i]);

  const s = STAGES[i];

  return (
    <div className="rounded-(--r-md) border border-line bg-raised p-4 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="label">booking lifecycle</p>
        <button
          type="button"
          onClick={() => {
            if (!playing && i === STAGES.length - 1) setI(0);
            setPlaying((p) => !p);
          }}
          className="inline-flex h-8 items-center gap-2 rounded-full border border-ship/50 bg-ship/10 px-4 font-mono text-[12px] text-ship transition-colors duration-150 hover:bg-ship/20"
        >
          {playing ? "■ pause" : "▶ play"}
        </button>
      </div>

      {/* stepper */}
      <ol className="relative mt-6 flex justify-between" aria-label="Lifecycle stages">
        <span aria-hidden="true" className="absolute inset-x-3 top-[9px] h-0.5 rounded-full bg-line-strong" />
        <span
          aria-hidden="true"
          className="absolute left-3 top-[9px] h-0.5 rounded-full bg-ship transition-[width] duration-320 ease-out"
          style={{ width: `calc((100% - 24px) * ${i / (STAGES.length - 1)})` }}
        />
        {STAGES.map((st, k) => (
          <li key={st.id} className="relative flex flex-col items-center">
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setI(k);
              }}
              aria-current={k === i ? "step" : undefined}
              aria-label={st.title}
              className={`size-5 rounded-full border-2 transition-all duration-220 ${
                k < i ? "border-ship bg-ship" : k === i ? "scale-125 border-ship bg-bg" : "border-line-strong bg-bg hover:border-ship/60"
              }`}
            />
            <span className={`mt-2 hidden font-mono text-[11px] sm:block ${k === i ? "text-ship" : "text-faint"}`}>{st.label}</span>
          </li>
        ))}
      </ol>

      {/* stage card */}
      <div key={s.id} className="stage-in mt-6 rounded-(--r-sm) border border-ship/30 bg-ship/5 p-4" aria-live="polite">
        <p className="label text-ship">
          {String(i + 1).padStart(2, "0")} / {String(STAGES.length).padStart(2, "0")}
        </p>
        <p className="mt-1 text-lead font-medium text-fg">{s.title}</p>
        <p className="mt-1 text-muted">{s.body}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {s.tech.map((t) => (
            <span key={t} className="rounded-full border border-line px-2 py-0.5 font-mono text-[11px] text-muted">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
