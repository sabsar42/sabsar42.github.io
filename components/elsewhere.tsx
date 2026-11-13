import type { CSSProperties, ReactNode } from "react";
import type { BrandSlug } from "@/lib/brand-icons";
import { identity, linkedinPosts, profiles } from "@/lib/content";
import { getHuggingFace, getKaggle, getScholar } from "@/lib/profiles";
import { BrandIcon } from "./brand-icon";
import { ArrowUpRight } from "./icons";
import { LinkedinPosts } from "./linkedin-posts";
import { VideoEmbed } from "./live-embed";
import { Section } from "./section";

const fmt = (n: number) => n.toLocaleString("en-US");

function Card({
  slug,
  name,
  handle,
  href,
  className = "",
  i = 0,
  children,
}: {
  slug: BrandSlug;
  name: string;
  handle: string;
  href: string;
  className?: string;
  i?: number;
  children?: ReactNode;
}) {
  return (
    <div
      className={`reveal spotlight flex min-w-0 flex-col rounded-[16px] border border-line bg-raised p-5 transition-colors duration-200 hover:border-brand/40 ${className}`}
      style={{ "--i": i } as CSSProperties}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-[10px] border border-line bg-bg">
            <BrandIcon slug={slug} size={20} />
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] font-medium text-fg">{name}</span>
            <span className="block truncate font-mono text-[11px] text-faint">{handle}</span>
          </span>
        </span>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer me"
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-line px-3 text-[12px] text-muted transition-colors duration-150 hover:border-brand/60 hover:text-fg"
        >
          Open <ArrowUpRight size={12} />
          <span className="sr-only"> {name} (opens in a new tab)</span>
        </a>
      </div>
      {children}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="tabular text-grad font-mono text-[32px] font-semibold leading-none tracking-[-0.04em] md:text-[38px]">{value}</p>
      <p className="mt-1.5 text-[12.5px] text-muted">{label}</p>
    </div>
  );
}

export async function Elsewhere() {
  const [scholar, kaggle, hf] = await Promise.all([getScholar(), getKaggle(), getHuggingFace()]);
  const kaggleTotal = kaggle?.reduce((s, d) => s + d.downloads, 0) ?? 0;
  const topKaggle = kaggle?.slice(0, 3) ?? [];
  const maxDl = topKaggle[0]?.downloads || 1;
  const maxYear = Math.max(1, ...(scholar?.perYear.map((y) => y.count) ?? [1]));

  return (
    <Section id="elsewhere" index="12" label="Elsewhere" wide>
      <p className="reveal mb-6 max-w-[56ch] text-lead text-muted">
        <span className="text-fg">Across the AI internet.</span> Live numbers pulled from each platform, refreshed every few
        hours.
      </p>

      <div className="grid gap-3 lg:grid-cols-6">
        {/* Google Scholar */}
        <Card slug="googlescholar" name="Google Scholar" handle="citations · h-index" href={identity.links.scholar} className="lg:col-span-3">
          {scholar ? (
            <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
              <div className="flex flex-wrap gap-x-7 gap-y-4">
                <Stat value={fmt(scholar.citations)} label="citations" />
                <Stat value={String(scholar.hIndex)} label="h-index" />
                <Stat value={String(scholar.i10)} label="i10-index" />
              </div>
              {scholar.perYear.length > 0 && (
                <div aria-label="Citations per year" className="flex items-end gap-1.5">
                  {scholar.perYear.map((y) => (
                    <div key={y.year} className="flex flex-col items-center gap-1">
                      <span className="tabular font-mono text-[10px] text-muted">{y.count}</span>
                      <span className="w-7 rounded-t-[4px] bg-grad" style={{ height: `${Math.max(6, (y.count / maxYear) * 64)}px` }} />
                      <span className="tabular font-mono text-[10px] text-faint">{y.year}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="mt-6 text-small text-muted">Publications and citations, on Google Scholar.</p>
          )}
        </Card>

        {/* Kaggle */}
        <Card slug="kaggle" name="Kaggle" handle="datasets" href={identity.links.kaggle} className="lg:col-span-3" i={1}>
          {kaggle && kaggle.length ? (
            <>
              <div className="mt-6 flex flex-wrap gap-x-7 gap-y-4">
                <Stat value={fmt(kaggleTotal)} label="dataset downloads" />
                <Stat value={String(kaggle.length)} label="public datasets" />
              </div>
              <ul className="mt-5 space-y-2.5">
                {topKaggle.map((d) => (
                  <li key={d.url}>
                    <a href={d.url} target="_blank" rel="noopener noreferrer" className="group block">
                      <span className="flex items-baseline justify-between gap-3 text-[13px]">
                        <span className="truncate text-fg group-hover:text-brand">{d.title}</span>
                        <span className="tabular shrink-0 font-mono text-[11px] text-muted">{fmt(d.downloads)} ↓</span>
                      </span>
                      <span aria-hidden="true" className="mt-1 block h-1 overflow-hidden rounded-full bg-line">
                        <span className="block h-full rounded-full bg-grad" style={{ width: `${Math.max(3, (d.downloads / maxDl) * 100)}%` }} />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-6 text-small text-muted">Datasets and notebooks, on Kaggle.</p>
          )}
        </Card>

        {/* YouTube */}
        <Card slug="youtube" name="YouTube" handle="@shakibabsar" href={profiles.youtube} className="lg:col-span-3" i={2}>
          <div className="mt-5">
            <VideoEmbed youtubeId={profiles.youtubeVideo} poster="/projects/content-guardian.webp" name="Content Guardian" domain="agent" />
          </div>
        </Card>

        <div className="grid gap-3 lg:col-span-3">
          {/* Hugging Face */}
          <Card slug="huggingface" name="Hugging Face" handle="sabsar42" href={profiles.huggingface} i={3}>
            {hf && hf.length ? (
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {hf.map((h) => (
                  <li key={h.url}>
                    <a
                      href={h.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-7 max-w-full items-center gap-1.5 rounded-full border border-line px-2.5 font-mono text-[11px] text-muted transition-colors duration-150 hover:border-brand/60 hover:text-fg"
                    >
                      <span className="text-brand">{h.kind}</span>
                      <span className="truncate">{h.id.split("/").pop()}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-small text-muted">Datasets and Spaces, on Hugging Face.</p>
            )}
          </Card>
          <div className="grid gap-3 sm:grid-cols-2">
            <Card slug="researchgate" name="ResearchGate" handle="Shakib-Absar" href={profiles.researchgate} i={4} />
            <Card slug="github" name="GitHub" handle="sabsar42" href={identity.links.github} i={5} />
          </div>
        </div>

        {/* LinkedIn */}
        <div className="reveal lg:col-span-6" style={{ "--i": 6 } as CSSProperties}>
          <LinkedinPosts posts={linkedinPosts} />
        </div>
      </div>
    </Section>
  );
}
