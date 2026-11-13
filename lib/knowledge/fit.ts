import { retrieve, type Hit } from "./bm25";

/**
 * Fit checks list several requirements. Retrieving for each one separately grounds every requirement,
 * instead of letting the strongest one crowd out the rest.
 */
export function retrieveFit(question: string): Hit[] {
  const [head, reqText = ""] = question.split(/requirements:/i);
  const parts = [head.replace(/^fit check for/i, ""), ...reqText.split(";")].map((p) => p.trim()).filter(Boolean);
  const best = new Map<string, Hit>();
  for (const part of parts.slice(0, 12)) {
    for (const h of retrieve(part, "", 3)) {
      // Identity and contact are always in context; listing them as evidence adds noise.
      if (h.chunk.id === "identity" || h.chunk.id === "contact") continue;
      const prev = best.get(h.chunk.id);
      if (!prev || h.score > prev.score) best.set(h.chunk.id, h);
    }
  }
  // Cap each section so one area (e.g. many papers) can't crowd out roles and projects.
  const caps: Partial<Record<string, number>> = { research: 2, stack: 3 };
  const used = new Map<string, number>();
  return [...best.values()]
    .sort((a, b) => b.score - a.score)
    .filter((h) => {
      const n = (used.get(h.chunk.section) ?? 0) + 1;
      used.set(h.chunk.section, n);
      return n <= (caps[h.chunk.section] ?? 4);
    })
    .slice(0, 10);
}
