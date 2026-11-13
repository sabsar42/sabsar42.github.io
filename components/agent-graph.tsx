"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { agentGraph, type GraphNodeId } from "@/lib/content";
import { dom } from "@/lib/domain";
import { Section } from "./section";

type Box = { x: number; y: number; w: number; h: number };
type Layout = {
  viewBox: string;
  dir: "h" | "v";
  nodes: Record<GraphNodeId, Box>;
  group: Box & { labelX: number; labelY: number };
};

const H: Layout = {
  viewBox: "0 0 960 280",
  dir: "h",
  nodes: {
    query: { x: 8, y: 126, w: 124, h: 40 },
    planner: { x: 208, y: 126, w: 124, h: 40 },
    retrieval: { x: 418, y: 46, w: 124, h: 40 },
    vision: { x: 418, y: 126, w: 124, h: 40 },
    mcp: { x: 418, y: 206, w: 124, h: 40 },
    evaluator: { x: 628, y: 126, w: 124, h: 40 },
    answer: { x: 828, y: 126, w: 124, h: 40 },
  },
  group: { x: 402, y: 30, w: 156, h: 232, labelX: 404, labelY: 22 },
};

const V: Layout = {
  viewBox: "0 0 340 446",
  dir: "v",
  nodes: {
    query: { x: 120, y: 8, w: 100, h: 36 },
    planner: { x: 120, y: 100, w: 100, h: 36 },
    retrieval: { x: 12, y: 210, w: 100, h: 36 },
    vision: { x: 120, y: 210, w: 100, h: 36 },
    mcp: { x: 228, y: 210, w: 100, h: 36 },
    evaluator: { x: 120, y: 310, w: 100, h: 36 },
    answer: { x: 120, y: 400, w: 100, h: 36 },
  },
  group: { x: 4, y: 196, w: 332, h: 64, labelX: 6, labelY: 188 },
};

const TOOLS: GraphNodeId[] = ["retrieval", "vision", "mcp"];
const EDGES: { from: GraphNodeId; to: GraphNodeId; stage: number }[] = [
  { from: "query", to: "planner", stage: 0 },
  ...TOOLS.map((t) => ({ from: "planner" as GraphNodeId, to: t, stage: 1 })),
  ...TOOLS.map((t) => ({ from: t, to: "evaluator" as GraphNodeId, stage: 2 })),
  { from: "evaluator", to: "answer", stage: 3 },
];

function edgePath(layout: Layout, from: GraphNodeId, to: GraphNodeId) {
  const a = layout.nodes[from];
  const b = layout.nodes[to];
  if (layout.dir === "h") {
    const x1 = a.x + a.w;
    const y1 = a.y + a.h / 2;
    const x2 = b.x;
    const y2 = b.y + b.h / 2;
    const dx = (x2 - x1) / 2;
    return `M${x1} ${y1} C${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}`;
  }
  const x1 = a.x + a.w / 2;
  const y1 = a.y + a.h;
  const x2 = b.x + b.w / 2;
  const y2 = b.y;
  const dy = (y2 - y1) / 2;
  return `M${x1} ${y1} C${x1} ${y1 + dy} ${x2} ${y2 - dy} ${x2} ${y2}`;
}

const RUN_ORDER: GraphNodeId[] = ["query", "planner", "retrieval", "vision", "mcp", "evaluator", "answer"];

const colorOf = (id: GraphNodeId) => {
  const d = agentGraph.find((n) => n.id === id)?.domain;
  return d ? dom[d].var : "var(--fg-muted)";
};

const byId = Object.fromEntries(agentGraph.map((n) => [n.id, n])) as Record<
  GraphNodeId,
  (typeof agentGraph)[number]
>;

function Graph({
  layout,
  active,
  visited,
  onActivate,
  className,
}: {
  layout: Layout;
  active: GraphNodeId | null;
  visited: Set<GraphNodeId>;
  onActivate: (id: GraphNodeId | null) => void;
  className: string;
}) {
  const { group } = layout;
  return (
    <svg
      viewBox={layout.viewBox}
      className={className}
      role="group"
      aria-label="Agent graph: user query, planner, tools (retrieval, vision, MCP servers), evaluator, answer"
      onMouseLeave={() => onActivate(null)}
    >
      <rect
        x={group.x}
        y={group.y}
        width={group.w}
        height={group.h}
        rx={12}
        fill="none"
        stroke="var(--line-strong)"
        strokeDasharray="3 4"
      />
      <text x={group.labelX} y={group.labelY} className="fill-faint font-mono" fontSize={11}>
        tools
      </text>

      {EDGES.map((e) => {
        const d = edgePath(layout, e.from, e.to);
        const lit = (active !== null && (e.from === active || e.to === active)) || (visited.has(e.from) && visited.has(e.to));
        return (
          <g key={`${e.from}-${e.to}`}>
            <path
              d={d}
              fill="none"
              stroke={lit ? colorOf(e.to) : "var(--line-strong)"}
              strokeOpacity={lit ? 0.8 : 1}
              strokeWidth={lit ? 1.5 : 1}
              style={{ transition: "stroke 150ms var(--ease-out)" }}
            />
            <path
              d={d}
              pathLength={100}
              fill="none"
              stroke={colorOf(e.to)}
              strokeWidth={2.5}
              strokeLinecap="round"
              className="edge-pulse"
              style={{ "--stage": e.stage } as CSSProperties}
            />
          </g>
        );
      })}

      {(Object.keys(layout.nodes) as GraphNodeId[]).map((id) => {
        const b = layout.nodes[id];
        const isActive = active === id;
        const lit = isActive || visited.has(id);
        const node = byId[id];
        const col = colorOf(id);
        return (
          <g
            key={id}
            tabIndex={0}
            role="button"
            aria-pressed={isActive}
            aria-label={`${node.label}: ${node.caption}`}
            className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-fg"
            onMouseEnter={() => onActivate(id)}
            onFocus={() => onActivate(id)}
            onClick={() => onActivate(id)}
          >
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx={8}
              fill={col}
              fillOpacity={isActive ? 0.22 : lit ? 0.14 : 0.06}
              stroke={col}
              strokeOpacity={lit ? 1 : 0.45}
              strokeWidth={isActive ? 1.5 : 1}
              style={{ transition: "all 220ms var(--ease-out)" }}
            />
            <text
              x={b.x + b.w / 2}
              y={b.y + b.h / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={layout.dir === "h" ? 13 : 12}
              className="pointer-events-none font-mono"
              fill={lit ? "var(--fg)" : col}
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function AgentGraph() {
  const [hovered, setHovered] = useState<GraphNodeId | null>(null);
  const [step, setStep] = useState<number | null>(null);
  const running = step !== null;

  useEffect(() => {
    if (step === null) return;
    const t = window.setTimeout(() => setStep(step + 1 < RUN_ORDER.length ? step + 1 : null), step + 1 < RUN_ORDER.length ? 1300 : 2200);
    return () => window.clearTimeout(t);
  }, [step]);

  const active = running ? RUN_ORDER[step] : hovered;
  const visited = new Set<GraphNodeId>(running ? RUN_ORDER.slice(0, step + 1) : []);
  const current = active ? byId[active] : null;
  const currentColor = active ? colorOf(active) : undefined;

  const onActivate = (id: GraphNodeId | null) => {
    if (running) return;
    setHovered(id);
  };

  return (
    <Section id="agents" index="06" label="How I build agents">
      <div className="reveal flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-[60ch] text-lead text-muted">
          The shape behind the geospatial risk-mapping agents I build at work. The agent on this page runs a smaller
          version of it: retrieve, then answer.
        </p>
        <button
          type="button"
          onClick={() => setStep(running ? null : 0)}
          className="inline-flex h-9 shrink-0 items-center gap-2 self-start rounded-full border border-agent/50 bg-agent/10 px-4 font-mono text-[12px] text-agent transition-colors duration-150 hover:bg-agent/20 sm:self-auto"
        >
          {running ? (
            <>
              <span aria-hidden="true" className="size-2 rounded-[2px] bg-agent" /> stop
            </>
          ) : (
            <>
              <span aria-hidden="true">▶</span> run the graph
            </>
          )}
        </button>
      </div>

      <div className="reveal mt-10" style={{ "--i": 1 } as CSSProperties}>
        <Graph layout={H} active={active} visited={visited} onActivate={onActivate} className="hidden h-auto w-full md:block" />
        <Graph layout={V} active={active} visited={visited} onActivate={onActivate} className="mx-auto block h-auto w-full max-w-[380px] md:hidden" />
      </div>

      <div className="mt-8 min-h-[5rem] border-t border-line pt-5" aria-live="polite">
        {running && (
          <div aria-hidden="true" className="mb-3 flex gap-1.5">
            {RUN_ORDER.map((id, i) => (
              <span
                key={id}
                className="h-1 w-8 rounded-full transition-colors duration-220"
                style={{ background: i <= step ? colorOf(id) : "var(--line-strong)" }}
              />
            ))}
          </div>
        )}
        {current ? (
          <p className="max-w-[62ch]">
            <span className="label mr-3" style={{ color: currentColor }}>
              {running ? `step ${step + 1}/${RUN_ORDER.length} · ` : ""}
              {current.label}
            </span>
            <span className="text-muted">{current.caption}</span>
          </p>
        ) : (
          <p className="label">Hover or tap a node, or press run to step through a full pass.</p>
        )}
      </div>
    </Section>
  );
}
