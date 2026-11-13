import { identity } from "@/lib/content";
import { getContributions, getRecentRepos, githubUser, summarize } from "@/lib/github";
import { Heatmap } from "./heatmap";
import { ArrowUpRight } from "./icons";
import { Section } from "./section";

const LANG: Record<string, string> = {
  TypeScript: "bg-vision",
  JavaScript: "bg-data",
  Python: "bg-ship",
  "Jupyter Notebook": "bg-research",
  Java: "bg-agent",
  Dart: "bg-vision",
};

function ago(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/** Real, public GitHub activity: proof of shipping that updates itself. */
export async function GithubActivity() {
  const [days, repos] = await Promise.all([getContributions(), getRecentRepos()]);
  const s = days ? summarize(days) : null;

  const stats = s
    ? [
        { value: s.total.toLocaleString("en-US"), label: "contributions in the last year", color: "text-ship" },
        { value: String(s.activeDays), label: "active days", color: "text-vision" },
        { value: `${s.longest}d`, label: "longest streak", color: "text-agent" },
        { value: s.best ? String(s.best.count) : "0", label: "most in one day", color: "text-research" },
      ]
    : [];

  return (
    <Section id="github" index="08" label="Shipping in public" wide>
      <div className="reveal flex flex-wrap items-end justify-between gap-4">
        <p className="max-w-[46ch] text-lead text-muted">
          <span className="text-fg">Live from GitHub.</span> Pulled from his public profile and refreshed every few hours,
          so it can&apos;t be dressed up.
        </p>
        <a
          href={identity.links.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-4 font-mono text-[12.5px] text-muted transition-colors duration-150 hover:border-ship/60 hover:text-fg"
        >
          github.com/{githubUser}
          <ArrowUpRight size={14} />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>

      {s && days ? (
        <>
          <ul className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-line bg-line md:grid-cols-4">
            {stats.map((x, i) => (
              <li key={x.label} className="reveal bg-bg px-4 py-4 md:px-5" style={{ "--i": i } as React.CSSProperties}>
                <p className={`tabular font-mono text-[30px] font-medium leading-none tracking-[-0.03em] md:text-[38px] ${x.color}`}>
                  {x.value}
                </p>
                <p className="mt-2 text-[13px] text-muted">{x.label}</p>
              </li>
            ))}
          </ul>
          <p className="sr-only">
            {s.total} public contributions on GitHub in the last year, across {s.activeDays} active days.
          </p>
          <div className="reveal mt-6 rounded-[14px] border border-line p-4 md:p-5">
            <Heatmap days={days} />
          </div>
        </>
      ) : null}

      {repos && repos.length > 0 && (
        <div className="mt-8">
          <h3 className="label">Recently pushed</h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {repos.map((r, i) => (
              <li key={r.name} className="reveal" style={{ "--i": i } as React.CSSProperties}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col rounded-[12px] border border-line p-4 transition-colors duration-150 hover:border-ship/50 hover:bg-hover"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-mono text-[13.5px] text-fg">{r.name}</span>
                    <ArrowUpRight size={14} className="shrink-0 text-faint transition-colors duration-150 group-hover:text-ship" />
                  </span>
                  {r.description && <span className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted">{r.description}</span>}
                  <span className="mt-auto flex items-center gap-3 pt-3 font-mono text-[11px] text-faint">
                    {r.language && (
                      <span className="flex items-center gap-1.5">
                        <span aria-hidden="true" className={`size-2 rounded-full ${LANG[r.language] ?? "bg-line-strong"}`} />
                        {r.language}
                      </span>
                    )}
                    <span>pushed {ago(r.pushedAt)}</span>
                    {r.homepage && <span className="text-ship">● live</span>}
                  </span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}
