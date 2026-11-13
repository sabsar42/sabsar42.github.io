import type { ReactNode } from "react";
import { publications } from "@/lib/content";
import { getContributions } from "@/lib/github";
import { getKaggle, getScholar } from "@/lib/profiles";
import { CountUp } from "./count-up";
import { ImpactTile } from "./impact-tile";
import { Section } from "./section";

/* ------------------------------------------------------------------ */
/* Tiny SVG charts (server-rendered, drawn in once on reveal by CSS)   */
/* Every chart plots real values only: no invented series.             */
/* ------------------------------------------------------------------ */

/** Smooth curve through real data points, with a soft area fill. */
function Spark({ id, values, labels }: { id: string; values: number[]; labels: [string, string] }) {
  const W = 240;
  const H = 64;
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => [(i / Math.max(1, values.length - 1)) * W, H - 6 - (v / max) * (H - 14)]);
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  const last = pts[pts.length - 1];
  return (
    <figure aria-hidden="true" className="mt-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-16 w-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--brand-b)" stopOpacity="0.28" />
            <stop offset="1" stopColor="var(--brand-b)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${id}-stroke`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="var(--brand-a)" />
            <stop offset="1" stopColor="var(--brand-c)" />
          </linearGradient>
        </defs>
        <path d={`${d} L${W},${H} L0,${H} Z`} fill={`url(#${id}-fill)`} className="spark-area" />
        <path
          d={d}
          pathLength={1}
          fill="none"
          stroke={`url(#${id}-stroke)`}
          strokeWidth="2.2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="draw"
        />
        <circle cx={last[0]} cy={last[1]} r="3.5" fill="var(--brand-c)" className="spark-dot" />
      </svg>
      <figcaption className="mt-1 flex justify-between font-mono text-[10px] text-faint">
        <span>{labels[0]}</span>
        <span>{labels[1]}</span>
      </figcaption>
    </figure>
  );
}

/** Ring gauge for a real percentage. */
function Ring({ id, pct, label, value }: { id: string; pct: number; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative size-[68px] md:size-[74px]">
        <svg viewBox="0 0 40 40" className="size-full -rotate-90" aria-hidden="true">
          <defs>
            <linearGradient id={id} x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="var(--brand-a)" />
              <stop offset="1" stopColor="var(--brand-c)" />
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="16" fill="none" stroke="var(--line)" strokeWidth="3.2" />
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke={`url(#${id})`}
            strokeWidth="3.2"
            strokeLinecap="round"
            pathLength={100}
            className="ring-arc"
            style={{ strokeDasharray: `${pct} 100` }}
          />
        </svg>
        <span className="tabular absolute inset-0 grid place-items-center font-mono text-[12.5px] font-semibold text-fg">{value}</span>
      </div>
      <span className="mt-2 text-[11.5px] leading-tight text-muted">{label}</span>
    </div>
  );
}

/** Horizontal comparison bars (real values only). */
function Bars({ rows }: { rows: { label: string; pct: number; brand?: boolean; note: string }[] }) {
  return (
    <div className="mt-5 space-y-2.5" aria-hidden="true">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex items-baseline justify-between font-mono text-[11px]">
            <span className="text-muted">{r.label}</span>
            <span className={r.brand ? "font-semibold text-brand" : "text-faint"}>{r.note}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-line">
            <div className={`grow-x h-full rounded-full ${r.brand ? "bg-grad" : "bg-line-strong"}`} style={{ width: `${Math.max(r.pct, 0.8)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const Big = ({ children }: { children: ReactNode }) => (
  <p className="tabular text-grad font-mono text-[44px] font-semibold leading-none tracking-[-0.05em] md:text-[54px]">{children}</p>
);
const Kicker = ({ children }: { children: ReactNode }) => (
  <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">{children}</p>
);

/* ------------------------------------------------------------------ */

export async function Impact() {
  const [days, scholar, kaggle] = await Promise.all([getContributions(), getScholar(), getKaggle()]);

  // Contributions per month over the last 12 months (real GitHub data).
  const months = new Map<string, number>();
  for (const d of days ?? []) months.set(d.date.slice(0, 7), (months.get(d.date.slice(0, 7)) ?? 0) + d.count);
  const monthly = [...months.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-12);
  const ghTotal = monthly.reduce((s, [, v]) => s + v, 0);
  const fmtMonth = (ym: string) =>
    new Date(`${ym}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "short", year: "2-digit", timeZone: "UTC" });
  const downloads = kaggle?.reduce((s, d) => s + d.downloads, 0) ?? 0;

  return (
    <Section id="proof" index="02" label="Impact" wide>
      <p className="reveal mb-6 max-w-[62ch] text-lead text-muted">
        <span className="text-fg">Numbers from production and research.</span> Every figure comes from shipped work or a
        published paper; the curves are live from GitHub and Google Scholar.
      </p>

      <ul className="grid gap-3 md:grid-cols-6 lg:grid-cols-12">
        <ImpactTile target="exp-fadlun" source="Fadlun, London · content moderation" className="md:col-span-6 lg:col-span-5">
          <Kicker>Production AI · moderation</Kicker>
          <Big>
            <CountUp value={50} suffix="K" />
          </Big>
          <p className="mt-2 text-[14px] text-fg">
            checks per day <span className="text-muted">at 85%+ precision, under 300 ms on average</span>
          </p>
          <Bars
            rows={[
              { label: "manual review, before", pct: 100, note: "baseline" },
              { label: "manual review, after", pct: 40, brand: true, note: "−60%" },
            ]}
          />
        </ImpactTile>

        <ImpactTile target="exp-indetechs" source="Indetechs / TVS · satellite segmentation" className="md:col-span-3 lg:col-span-4" i={1}>
          <Kicker>Foundation models · LoRA</Kicker>
          <Big>
            <CountUp value={15} prefix="+" suffix="%" />
          </Big>
          <p className="mt-2 text-[14px] text-fg">
            mIoU <span className="text-muted">fine-tuning SAM3 and IBM Prithvi-2 (300M)</span>
          </p>
          <Bars
            rows={[
              { label: "parameters in the model", pct: 100, note: "100%" },
              { label: "parameters trained", pct: 0.1, brand: true, note: "0.1%" },
            ]}
          />
        </ImpactTile>

        <ImpactTile target="exp-headstarter" source="Headstarter AI · production RAG" className="md:col-span-6 lg:col-span-3" i={2}>
          <Kicker>Retrieval · RAG</Kicker>
          <Big>
            <CountUp value={10} suffix="K+" />
          </Big>
          <p className="mt-2 text-[14px] text-fg">
            documents <span className="text-muted">behind a GPT-4 + LangChain system</span>
          </p>
          <svg viewBox="0 0 160 56" className="mt-5 h-14 w-full" aria-hidden="true">
            <path d="M8 14 C60 14 70 29 104 29" fill="none" stroke="var(--line-strong)" strokeWidth="1.5" />
            <path d="M8 44 C60 44 70 29 104 29" fill="none" stroke="var(--line-strong)" strokeWidth="1.5" />
            <path d="M104 29 L152 29" fill="none" stroke="var(--brand-b)" strokeWidth="2" pathLength={1} className="draw" />
            <text x="8" y="9" fill="var(--fg-faint)" className="font-mono text-[8px]">
              BM25 keywords
            </text>
            <text x="8" y="55" fill="var(--fg-faint)" className="font-mono text-[8px]">
              dense vectors
            </text>
            <circle cx="104" cy="29" r="4" fill="var(--brand-b)" />
            <text x="112" y="22" fill="var(--brand-b)" className="font-mono text-[8px]">
              hybrid
            </text>
          </svg>
        </ImpactTile>

        <ImpactTile target="work" source="Content Guardian · Digi-Pharma · TFFM" className="md:col-span-6 lg:col-span-4" i={3}>
          <Kicker>Model quality · %</Kicker>
          <div className="grid flex-1 grid-cols-4 content-center gap-1">
            <Ring id="r-nsfw" pct={97.1} value="97.1" label="NSFW image accuracy" />
            <Ring id="r-hate" pct={94.2} value="94.2" label="hate-speech accuracy" />
            <Ring id="r-ocr" pct={92} value="92" label="OCR extraction" />
            <Ring id="r-dice" pct={90.97} value="90.97" label="Dice, TFFM @ WACV" />
          </div>
        </ImpactTile>

        <ImpactTile target="research" source={scholar ? "live · Google Scholar" : "Publications"} className="md:col-span-3 lg:col-span-4" i={4}>
          <Kicker>Research</Kicker>
          <div className="flex items-end gap-6">
            <Big>
              <CountUp value={publications.length} />
            </Big>
            {scholar && (
              <p className="pb-1 font-mono text-[12px] leading-snug text-muted">
                <span className="text-fg">{scholar.citations}</span> citations
                <br />
                h-index <span className="text-fg">{scholar.hIndex}</span>
              </p>
            )}
          </div>
          <p className="mt-2 text-[14px] text-fg">
            papers <span className="text-muted">published, accepted, or under review</span>
          </p>
          {scholar && scholar.perYear.length > 1 && (
            <Spark
              id="sp-cite"
              values={scholar.perYear.map((y) => y.count)}
              labels={[`citations · ${scholar.perYear[0].year}`, String(scholar.perYear[scholar.perYear.length - 1].year)]}
            />
          )}
        </ImpactTile>

        <ImpactTile target="github" source={days ? "live · GitHub" : "GitHub"} className="md:col-span-3 lg:col-span-4" i={5}>
          <Kicker>Shipping cadence</Kicker>
          <div className="flex items-end gap-6">
            <Big>{days ? <CountUp value={ghTotal} /> : "—"}</Big>
            {downloads > 0 && (
              <p className="pb-1 font-mono text-[12px] leading-snug text-muted">
                <span className="text-fg">{downloads.toLocaleString("en-US")}</span> dataset
                <br />
                downloads, Kaggle
              </p>
            )}
          </div>
          <p className="mt-2 text-[14px] text-fg">
            contributions <span className="text-muted">in the last 12 months</span>
          </p>
          {monthly.length > 1 && (
            <Spark id="sp-gh" values={monthly.map(([, v]) => v)} labels={[fmtMonth(monthly[0][0]), fmtMonth(monthly[monthly.length - 1][0])]} />
          )}
        </ImpactTile>
      </ul>
    </Section>
  );
}
