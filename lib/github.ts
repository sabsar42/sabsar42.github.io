import "server-only";
import { identity } from "./content";

/**
 * Public GitHub activity, fetched on the server and cached for 12 hours (ISR).
 * Nothing here is typed by hand: if GitHub is unreachable the section falls back to a plain link.
 */

export type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };
export type Repo = {
  name: string;
  description: string | null;
  language: string | null;
  pushedAt: string;
  url: string;
  homepage: string | null;
};

export const githubUser = identity.links.github.replace(/\/$/, "").split("/").pop()!;
const REVALIDATE = 60 * 60 * 12;
const HEADERS = { "User-Agent": "portfolio-site", Accept: "text/html,application/json" };

function attr(tag: string, name: string): string | null {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`));
  return m ? m[1] : null;
}

export async function getContributions(): Promise<Day[] | null> {
  try {
    const res = await fetch(`https://github.com/users/${githubUser}/contributions`, {
      headers: HEADERS,
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Counts live in the tooltips ("3 contributions on May 2nd."), keyed by the cell id.
    const counts = new Map<string, number>();
    for (const m of html.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
      const n = m[2].match(/^(\d+) contributions? on/);
      counts.set(m[1], n ? Number(n[1]) : 0);
    }

    const days: Day[] = [];
    for (const m of html.matchAll(/<td\b[^>]*\bdata-date="[^"]+"[^>]*>/g)) {
      const tag = m[0];
      const date = attr(tag, "data-date");
      const id = attr(tag, "id");
      const level = Number(attr(tag, "data-level") ?? 0);
      if (!date) continue;
      days.push({ date, count: (id && counts.get(id)) || 0, level: Math.min(4, Math.max(0, level)) as Day["level"] });
    }
    days.sort((a, b) => a.date.localeCompare(b.date));
    return days.length > 300 ? days : null;
  } catch {
    return null;
  }
}

export async function getRecentRepos(limit = 6): Promise<Repo[] | null> {
  try {
    const res = await fetch(`https://api.github.com/users/${githubUser}/repos?sort=pushed&per_page=30`, {
      headers: { ...HEADERS, Accept: "application/vnd.github+json" },
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      name: string;
      description: string | null;
      language: string | null;
      pushed_at: string;
      html_url: string;
      homepage: string | null;
      fork: boolean;
      private?: boolean;
    }[];
    return data
      .filter((r) => !r.fork && !r.private && r.name.toLowerCase() !== githubUser.toLowerCase() && !r.name.endsWith(".github.io"))
      .slice(0, limit)
      .map((r) => ({
        name: r.name,
        description: r.description,
        language: r.language,
        pushedAt: r.pushed_at,
        url: r.html_url,
        homepage: r.homepage || null,
      }));
  } catch {
    return null;
  }
}

export type Streaks = { total: number; activeDays: number; current: number; longest: number; best: Day | null };

export function summarize(days: Day[]): Streaks {
  let longest = 0;
  let run = 0;
  let best: Day | null = null;
  let total = 0;
  let activeDays = 0;
  for (const d of days) {
    total += d.count;
    if (d.count > 0) {
      activeDays++;
      run++;
      longest = Math.max(longest, run);
      if (!best || d.count > best.count) best = d;
    } else {
      run = 0;
    }
  }
  // Current streak: today may not have activity yet, so start from yesterday in that case.
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i--;
  let current = 0;
  while (i >= 0 && days[i].count > 0) {
    current++;
    i--;
  }
  return { total, activeDays, current, longest, best };
}
