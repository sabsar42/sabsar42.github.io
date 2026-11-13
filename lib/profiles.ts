import "server-only";
import { identity, profiles } from "./content";

/**
 * Live public stats from Scholar, Kaggle and Hugging Face, fetched on the server and cached for 12 hours.
 * Every fetch fails soft: a card without data still links to the profile.
 */

const REVALIDATE = 60 * 60 * 12;
const UA = { "User-Agent": "Mozilla/5.0 (compatible; portfolio-site)" };

export type ScholarStats = { citations: number; hIndex: number; i10: number; perYear: { year: number; count: number }[] };

export async function getScholar(): Promise<ScholarStats | null> {
  try {
    const url = `${identity.links.scholar}&hl=en`;
    const res = await fetch(url, { headers: UA, next: { revalidate: REVALIDATE } });
    if (!res.ok) { console.error("[profiles] status", res.status, res.url); return null; }
    const html = await res.text();
    const std = [...html.matchAll(/class="gsc_rsb_std">(\d+)</g)].map((m) => Number(m[1]));
    if (std.length < 6) return null;
    const years = [...html.matchAll(/class="gsc_g_t"[^>]*>(\d{4})</g)].map((m) => Number(m[1]));
    const counts = [...html.matchAll(/class="gsc_g_al">(\d+)</g)].map((m) => Number(m[1]));
    const perYear = years.length === counts.length ? years.map((year, i) => ({ year, count: counts[i] })) : [];
    return { citations: std[0], hIndex: std[2], i10: std[4], perYear };
  } catch (e) {
    console.error("[profiles]", e);
    return null;
  }
}

export type KaggleDataset = { title: string; url: string; downloads: number; votes: number; subtitle: string };

export async function getKaggle(): Promise<KaggleDataset[] | null> {
  try {
    const user = identity.links.kaggle.replace(/\/$/, "").split("/").pop();
    const res = await fetch(`https://www.kaggle.com/api/v1/datasets/list?user=${user}`, {
      headers: UA,
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) { console.error("[profiles] status", res.status, res.url); return null; }
    const data = (await res.json()) as {
      title?: string;
      titleNullable?: string;
      url?: string;
      urlNullable?: string;
      downloadCount?: number;
      voteCount?: number;
      subtitle?: string;
      subtitleNullable?: string;
    }[];
    return data
      .map((d) => ({
        title: d.title ?? d.titleNullable ?? "",
        url: d.url ?? d.urlNullable ?? identity.links.kaggle,
        downloads: d.downloadCount ?? 0,
        votes: d.voteCount ?? 0,
        subtitle: d.subtitle ?? d.subtitleNullable ?? "",
      }))
      .filter((d) => d.title)
      .sort((a, b) => b.downloads - a.downloads);
  } catch (e) {
    console.error("[profiles]", e);
    return null;
  }
}

export type HfItem = { id: string; kind: "dataset" | "space" | "model"; url: string };

export async function getHuggingFace(): Promise<HfItem[] | null> {
  try {
    const user = profiles.huggingface.split("/").pop();
    const kinds = [
      ["datasets", "dataset", "datasets/"],
      ["spaces", "space", "spaces/"],
      ["models", "model", ""],
    ] as const;
    const lists = await Promise.all(
      kinds.map(async ([api, kind, prefix]) => {
        const res = await fetch(`https://huggingface.co/api/${api}?author=${user}&limit=20`, {
          headers: UA,
          next: { revalidate: REVALIDATE },
        });
        if (!res.ok) return [];
        const data = (await res.json()) as { id: string; private?: boolean }[];
        return data.filter((d) => !d.private).map((d) => ({ id: d.id, kind, url: `https://huggingface.co/${prefix}${d.id}` }));
      }),
    );
    return lists.flat();
  } catch (e) {
    console.error("[profiles]", e);
    return null;
  }
}
