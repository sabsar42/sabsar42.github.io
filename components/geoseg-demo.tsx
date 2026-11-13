"use client";

import Image from "next/image";
import { useState } from "react";
import { geosegDemo } from "@/lib/content";

type PromptId = (typeof geosegDemo.prompts)[number]["id"];

const COLOR: Record<PromptId, string> = {
  buildings: "var(--c-agent)",
  roads: "var(--c-data)",
  water: "var(--c-vision)",
};

/* Schematic scene used until the real orthophoto and pre-rendered masks are supplied. */
const RIVER =
  "M0 292 C110 262 196 326 320 296 C444 266 520 318 640 286 L640 344 C520 376 444 326 320 356 C196 386 110 324 0 354 Z";
const ROADS = ["M0 132 H640", "M228 0 V292", "M452 132 L560 0"];
const BUILDINGS: [number, number, number, number][] = [
  [24, 24, 52, 38], [92, 30, 40, 52], [148, 20, 58, 44], [26, 78, 64, 36], [110, 96, 82, 22],
  [252, 22, 46, 46], [312, 30, 70, 34], [252, 82, 96, 30], [396, 24, 36, 58],
  [24, 160, 70, 46], [110, 156, 44, 70], [168, 168, 40, 40], [26, 222, 56, 34], [100, 240, 90, 24],
  [252, 160, 52, 52], [320, 158, 84, 40], [256, 226, 40, 34], [312, 214, 64, 30],
  [420, 160, 60, 44], [496, 158, 46, 64], [560, 170, 60, 40], [430, 222, 92, 30], [556, 226, 60, 30],
  [480, 60, 48, 40], [560, 70, 56, 46],
];

function Schematic({ on }: { on: Record<PromptId, boolean> }) {
  const mask = (id: PromptId) => ({
    opacity: on[id] ? 1 : 0,
    transition: "opacity 220ms var(--ease-out)",
  });
  return (
    <svg viewBox="0 0 640 400" className="block h-auto w-full" role="img" aria-label="Schematic aerial scene with buildings, roads and a river">
      <defs>
        <pattern id="geo-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="var(--line)" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="640" height="400" fill="var(--bg-hover)" />
      <rect width="640" height="400" fill="url(#geo-grid)" />
      <path d={RIVER} fill="var(--line-strong)" />
      {ROADS.map((d) => (
        <path key={d} d={d} stroke="var(--bg)" strokeWidth={12} fill="none" />
      ))}
      {BUILDINGS.map(([x, y, w, h]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx={2} fill="var(--line-strong)" stroke="var(--fg-faint)" strokeOpacity={0.35} />
      ))}

      <g style={mask("water")}>
        <path d={RIVER} fill={COLOR.water} fillOpacity={0.5} stroke={COLOR.water} strokeWidth={1.5} />
      </g>
      <g style={mask("roads")}>
        {ROADS.map((d) => (
          <path key={d} d={d} stroke={COLOR.roads} strokeOpacity={0.7} strokeWidth={12} fill="none" />
        ))}
      </g>
      <g style={mask("buildings")}>
        {BUILDINGS.map(([x, y, w, h]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx={2} fill={COLOR.buildings} fillOpacity={0.55} stroke={COLOR.buildings} strokeWidth={1.2} />
        ))}
      </g>
    </svg>
  );
}

export function GeoSegDemo() {
  const [on, setOn] = useState<Record<PromptId, boolean>>({ buildings: true, roads: false, water: false });
  const activeList = geosegDemo.prompts.filter((p) => on[p.id]).map((p) => p.label);

  return (
    <div>
      <div className="overflow-hidden rounded-(--r-md) border border-line">
        {geosegDemo.assetsReady ? (
          <div className="relative aspect-[16/10]">
            <Image src={geosegDemo.base} alt="Aerial orthophoto" fill sizes="(min-width: 768px) 720px, 100vw" className="object-cover" />
            {geosegDemo.prompts.map((p) => (
              <Image
                key={p.id}
                src={p.mask}
                alt=""
                fill
                sizes="(min-width: 768px) 720px, 100vw"
                className="object-cover transition-opacity duration-220 ease-out"
                style={{ opacity: on[p.id] ? 1 : 0 }}
              />
            ))}
          </div>
        ) : (
          <Schematic on={on} />
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="label mr-1">prompt</span>
        {geosegDemo.prompts.map((p) => {
          const pressed = on[p.id];
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={pressed}
              onClick={() => setOn((s) => ({ ...s, [p.id]: !s[p.id] }))}
              className="inline-flex h-8 items-center gap-2 rounded-full border px-3 font-mono text-[12px] transition-colors duration-150"
              style={{
                borderColor: pressed ? COLOR[p.id] : "var(--line)",
                background: pressed ? `color-mix(in oklab, ${COLOR[p.id]} 16%, transparent)` : "transparent",
                color: pressed ? "var(--fg)" : "var(--fg-muted)",
              }}
            >
              <span aria-hidden="true" className="size-2 rounded-full" style={{ background: COLOR[p.id], opacity: pressed ? 1 : 0.5 }} />
              {p.label}
            </button>
          );
        })}
      </div>
      <p className="label mt-3" aria-live="polite">
        {activeList.length ? `mask: ${activeList.join(" + ")}` : "Pick a prompt to overlay its mask."}{" "}
        {geosegDemo.assetsReady
          ? "Pre-rendered CLIP + SAM-2 output. Nothing runs in your browser."
          : "Illustrative schematic; masks are pre-drawn, nothing runs in your browser."}
      </p>
    </div>
  );
}
