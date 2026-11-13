import { identity } from "../content";
import { expand, isKnownTerm, retrieve, tokenize, type Hit } from "../knowledge/bm25";

/**
 * The native agent: answers without any LLM, by extracting the most relevant sentences from the same
 * retrieved facts the model would have seen. It can't paraphrase, but it can't invent either.
 */

const MAX_WORDS = 130;

/** Strip the bookkeeping prefixes chunks use ("Project: X.", "News (2026-09, …):", "- "). */
function clean(s: string) {
  return s
    .replace(/^- /, "")
    .replace(/^(Work experience|Research experience|Research publication \([^)]*\)|Project|Education|News \([^)]*\)|Technical skills and stack, [^:]+|Awards[^:]*|Leadership[^:]*):\s*/i, "")
    .trim();
}

function sentences(text: string): string[] {
  return text
    .split("\n")
    .flatMap((line) => (line.startsWith("- ") ? [line] : line.split(/(?<=[.!?])\s+(?=[A-Z"“])/)))
    .map((s) => s.trim())
    // Drop bare titles ("Project: GeoSeg VLM.") and link lines: only quote real sentences.
    .filter((s) => clean(s).split(/\s+/).length > 4 && !/^(GitHub|Live|Demo|Paper|Project|Dataset|Code|Google Scholar|LinkedIn|Kaggle|Academic site):\s*https?:/i.test(s));
}

/** Role chunks open with a "title at org, dates" header: only useful when the question asks who/when/where. */
const ASKS_HEADER = /\b(when|where|role|title|position|dates?|how long|joined|start)\b/i;

function best(hit: Hit, q: Set<string>, take: number, question = ""): string[] {
  const header = /^(Work|Research) experience:/.test(hit.chunk.text) && !ASKS_HEADER.test(question);
  const name = (hit.chunk.label.split(" · ").pop() ?? "").replace(/…$/, "").toLowerCase();
  const ranked = sentences(hit.chunk.text)
    // A sentence that only restates the chunk's own title adds nothing.
    .filter((s) => {
      const c = clean(s).replace(/[.\s]+$/, "").toLowerCase();
      return !(name && (c === name || name.startsWith(c) || c.startsWith(name) && c.length - name.length < 4));
    })
    .map((s, i) => {
      const toks = tokenize(s);
      const overlap = toks.filter((t) => q.has(t)).length;
      const lead = i === 0 ? (header ? -2 : 0.6) : 0;
      return { s, score: overlap + lead + Math.min(toks.length, 30) / 300 };
    })
    .sort((a, b) => b.score - a.score);
  return ranked.slice(0, take).map((r) => {
    const c = clean(r.s);
    return c.length > 240 ? `${c.slice(0, 237).replace(/\s+\S*$/, "")}…` : c;
  });
}

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

function fitCheck(question: string): string {
  const [head, reqText = ""] = question.split(/requirements:/i);
  const role = head.replace(/^fit check for/i, "").trim().replace(/\.$/, "") || "this role";
  const reqs = reqText
    .split(";")
    .map((r) => r.replace(/\.$/, "").trim())
    .filter(Boolean)
    .slice(0, 8);
  if (!reqs.length) return `Add the requirements after "Requirements:" and I'll list the evidence for each one.`;
  const lines = reqs.map((r) => {
    const found = retrieve(r, "", 4).filter((h) => h.chunk.id !== "identity" && h.chunk.id !== "contact");
    // Evidence from real work beats a line in the skills list.
    const hit = found.find((h) => h.chunk.section !== "stack") ?? found[0];
    if (!hit) return `- **${r}**: not in my information.`;
    const [s] = best(hit, new Set(tokenize(r)), 1);
    return `- **${r}**: ${s} *(${hit.chunk.label})*`;
  });
  return [`Evidence on this site for **${role}**:`, "", ...lines, "", `For anything else, email him at ${identity.email}.`].join("\n");
}

export function nativeAnswer(question: string, hits: Hit[]): string {
  const q = question.trim();
  const lower = q.toLowerCase();

  if (/^fit check\b/i.test(q)) return fitCheck(q);

  if (/^(hi|hello|hey|yo|hiya|salam|assalamu|good (morning|evening|afternoon))\b/.test(lower) && words(q) <= 6) {
    return `Hi! I'm Shakib's native agent. Ask me about his roles, projects, research, or awards. For example: *What agentic AI systems has he shipped?*`;
  }
  if (/\b(thanks|thank you|thx)\b/.test(lower) && words(q) <= 6) {
    return `You're welcome. If you'd like to talk to Shakib directly, email him at ${identity.email}.`;
  }
  if (/\b(contact|email|reach|get in touch|hire|hiring|available|availability|freelanc\w*|open to work)\b/.test(lower) && !hits.some((h) => h.chunk.section === "work")) {
    return [
      `The best way to reach Shakib is email: **${identity.email}**.`,
      "",
      `He's ${identity.availability.charAt(0).toLowerCase()}${identity.availability.slice(1)}. You can also find him on [GitHub](${identity.links.github}), [LinkedIn](${identity.links.linkedin}), and [Google Scholar](${identity.links.scholar}).`,
    ].join("\n");
  }

  // A name the site never mentions (e.g. "NeurIPS") means the answer isn't here: say so plainly
  // instead of quoting near-misses.
  const unknown = q
    .split(/\s+/)
    .slice(1)
    .map((w) => w.replace(/[^A-Za-z0-9+#-]/g, ""))
    .filter((w) => /^[A-Z][A-Za-z0-9+#-]+$/.test(w) || /[A-Z].*[A-Z]/.test(w))
    .filter((w) => {
      const toks = tokenize(w);
      return toks.length > 0 && toks.every((t) => !isKnownTerm(t));
    });
  if (unknown.length) {
    return `That isn't in my information: nothing on this site mentions **${unknown.join(", ")}**. For anything not covered here, email Shakib at ${identity.email}.`;
  }

  // Identity is a fallback source: only quote it when nothing more specific matched.
  const specific = hits.filter((h) => h.chunk.id !== "contact" && h.chunk.id !== "identity");
  let useful = (specific.length ? specific : hits.filter((h) => h.chunk.id !== "contact")).slice(0, 3);
  // If the question names something (e.g. "Fadlun") and some sources mention it, quote only those.
  const names = q
    .split(/\s+/)
    .slice(1)
    .map((w) => w.replace(/[^A-Za-z0-9+#-]/g, "").toLowerCase())
    .filter((w, i, arr) => w.length > 2 && /[A-Z]/.test(q.split(/\s+/).slice(1)[i] ?? "") && arr.indexOf(w) === i);
  const naming = useful.filter((h) => names.some((n) => h.chunk.text.toLowerCase().includes(n) || h.chunk.label.toLowerCase().includes(n)));
  if (naming.length) useful = naming;
  if (!useful.length) {
    return `That isn't something I have information on. For anything not covered on this site, email Shakib at ${identity.email}.`;
  }

  const qset = new Set(expand(tokenize(q)));
  const out: string[] = [];
  let total = 0;
  for (const [i, h] of useful.entries()) {
    const picks = best(h, qset, i === 0 ? 2 : 1, q);
    const label = h.chunk.section === "news" ? "News" : h.chunk.label.split(" · ").pop();
    for (const p of picks) {
      if (total + words(p) > MAX_WORDS && out.length) break;
      out.push(`- **${label}**: ${p}`);
      total += words(p);
    }
  }
  return ["Here's what this site says:", "", ...out].join("\n");
}
