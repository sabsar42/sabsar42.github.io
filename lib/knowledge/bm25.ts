import { chunks, type Chunk } from "./chunks";

/**
 * Tiny BM25 over the content chunks. No dependencies, no vector DB.
 * The index is built once per server instance at module load.
 */

const STOPWORDS = new Set(
  "a an and are as at be but by can could did do does for from has have he her him his how i if in into is it its me my of on or our she so than that the their them then there these they this to us was we were what when where which who whom why will with would you your about tell shakib absar shakib's please give show".split(
    " ",
  ),
);

function stem(t: string): string {
  if (t.length <= 3) return t;
  if (t.endsWith("ies") && t.length > 4) return `${t.slice(0, -3)}y`;
  if (t.endsWith("sses")) return t.slice(0, -2);
  if (t.endsWith("ing") && t.length > 5) return t.slice(0, -3);
  if (t.endsWith("ed") && t.length > 4) return t.slice(0, -2);
  if (t.endsWith("es") && /(ch|sh|x|z)es$/.test(t)) return t.slice(0, -2);
  if (t.endsWith("s") && !t.endsWith("ss") && !t.endsWith("us")) return t.slice(0, -1);
  return t;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/[\s\-/.]+/)
    .map((t) => t.replace(/^[+#]+|[+#]+$/g, ""))
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map(stem);
}

/** Query-side expansion so visitor wording reaches the content's wording. */
const SYNONYMS: Record<string, string[]> = {
  award: ["award", "recognition", "hackathon", "finalist", "nominee", "runner", "ieeextreme"],
  prize: ["award", "recognition"],
  win: ["award", "recognition", "finalist", "runner"],
  won: ["award", "recognition", "finalist", "runner"],
  honor: ["award", "recognition"],
  achievement: ["award", "recognition"],
  competition: ["award", "hackathon", "ieeextreme", "competitive"],
  contact: ["contact", "email", "reach"],
  email: ["contact", "email"],
  reach: ["contact", "email"],
  client: ["availability", "open", "client", "project", "consulting", "independent"],
  consulting: ["availability", "open", "consulting", "independent"],
  independent: ["availability", "open", "consulting", "independent"],
  engagement: ["availability", "consulting", "independent"],
  freelance: ["availability", "client", "project"],
  available: ["availability", "open", "client"],
  hire: ["availability", "open", "founding", "role", "client"],
  hiring: ["availability", "open", "founding", "role"],
  paper: ["publication", "research", "venue"],
  publication: ["publication", "research", "venue"],
  publish: ["publication", "research"],
  research: ["research", "publication"],
  job: ["experience", "work", "engineer"],
  work: ["experience", "work"],
  career: ["experience", "work"],
  company: ["experience", "work"],
  employer: ["experience", "work"],
  intern: ["intern", "internship", "experience"],
  build: ["project", "built", "building", "system"],
  built: ["project", "built", "system"],
  ship: ["built", "deployed", "production", "system"],
  shipped: ["built", "deployed", "production", "system"],
  project: ["project"],
  news: ["news", "accepted", "published", "latest"],
  latest: ["news", "accepted", "published"],
  recent: ["news", "accepted", "published"],
  update: ["news"],
  product: ["project", "live", "app"],
  app: ["app", "project", "live"],
  live: ["live", "deployed", "production"],
  voice: ["voice", "journal", "record", "speaking"],
  journal: ["journal", "voice", "note"],
  ielts: ["ielts", "speaking", "examiner"],
  stack: ["stack", "skill"],
  skill: ["stack", "skill"],
  tech: ["stack", "skill"],
  technology: ["stack", "skill"],
  tool: ["stack", "skill", "tool"],
  language: ["python", "typescript", "stack"],
  agent: ["agent", "agentic", "multi", "langgraph", "mcp"],
  agentic: ["agent", "agentic", "multi", "langgraph", "mcp"],
  vision: ["vision", "image", "segmentation", "computer"],
  cv: ["vision", "computer", "image"],
  image: ["image", "vision"],
  medical: ["medical", "healthcare", "imaging"],
  health: ["medical", "healthcare"],
  healthcare: ["medical", "healthcare"],
  education: ["education", "university", "degree", "cgpa"],
  degree: ["education", "university", "degree"],
  university: ["education", "university"],
  study: ["education", "university"],
  gpa: ["cgpa", "education"],
  founding: ["founding", "availability", "early", "stage", "production", "built"],
  founder: ["founding", "availability"],
  startup: ["founding", "early", "stage", "availability"],
  fit: ["availability", "founding", "summary", "production", "deployed", "built", "agent"],
  location: ["location", "based", "sylhet", "bangladesh"],
  based: ["location", "based", "sylhet"],
  where: ["location", "based"],
  timezone: ["utc", "location"],
  rag: ["rag", "retrieval"],
  retrieval: ["rag", "retrieval"],
  vlm: ["vlm", "vision", "language"],
  llm: ["llm", "language", "model"],
  dataset: ["dataset", "data"],
  github: ["github"],
  linkedin: ["linkedin"],
  scholar: ["scholar"],
  lead: ["leadership", "chairperson", "mentor"],
  leadership: ["leadership", "chairperson", "mentor", "teaching"],
  teach: ["teaching", "mentor", "instructor"],
};

// Keys and values go through the same stemmer as the text, so "shipped", "hiring", etc. line up.
const SYN = new Map<string, string[]>();
for (const [key, values] of Object.entries(SYNONYMS)) {
  const k = stem(key);
  SYN.set(k, [...(SYN.get(k) ?? []), ...values.map(stem)]);
}

export function expand(tokens: string[]): string[] {
  const out = [...tokens];
  for (const t of tokens) {
    const extra = SYN.get(t);
    if (extra) out.push(...extra);
  }
  return out;
}

type Doc = { chunk: Chunk; tf: Map<string, number>; len: number; name: Set<string> };

const K1 = 1.2;
const B = 0.75;

const docs: Doc[] = chunks.map((chunk) => {
  // Label is part of the searchable text (e.g. "Recognition · Awards").
  const tokens = tokenize(`${chunk.label} ${chunk.text}`);
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  // The part of the label after "·" names the entity (employer, project, paper): a direct hit on it matters most.
  const name = new Set(tokenize(chunk.label.split(" · ").pop() ?? ""));
  return { chunk, tf, len: tokens.length, name };
});
const avgLen = docs.reduce((s, d) => s + d.len, 0) / docs.length;
const df = new Map<string, number>();
for (const d of docs) for (const t of d.tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
const N = docs.length;
const idf = (t: string) => {
  const n = df.get(t) ?? 0;
  return Math.log(1 + (N - n + 0.5) / (n + 0.5));
};

function scoreDoc(d: Doc, weights: Map<string, number>): number {
  let s = 0;
  for (const [t, w] of weights) {
    const f = d.tf.get(t);
    if (!f) continue;
    s += w * idf(t) * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * d.len) / avgLen)));
  }
  return s;
}

export type Hit = { chunk: Chunk; score: number };

/** True when the (stemmed) term appears anywhere in the knowledge base. */
export function isKnownTerm(token: string): boolean {
  return df.has(token);
}

/**
 * @param query   the visitor's latest message
 * @param context the previous user message (for follow-ups like "tell me more"), weighted lower
 */
export function retrieve(query: string, context = "", k = 5): Hit[] {
  const weights = new Map<string, number>();
  const add = (tokens: string[], w: number) => {
    for (const t of tokens) weights.set(t, Math.max(weights.get(t) ?? 0, w));
  };
  add(expand(tokenize(context)), 0.4);
  add(expand(tokenize(query)), 1);
  if (weights.size === 0) return [];

  // Names the visitor typed (capitalized words or acronyms, not synonyms) that name a chunk boost it strongly:
  // "What did he ship at Fadlun?" should lead with Fadlun, not whichever role says "deployed" most.
  const typed = new Set(
    query
      .split(/\s+/)
      .slice(1)
      .filter((w) => /[A-Z]/.test(w))
      .flatMap((w) => tokenize(w)),
  );
  const scored = docs
    .map((d) => {
      let score = scoreDoc(d, weights);
      for (const t of typed) if (d.name.has(t) && idf(t) > 1.5) score *= 2.5;
      return { chunk: d.chunk, score };
    })
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score);
  if (!scored.length) return [];

  const top = scored[0].score;
  const MIN = 1.2;
  return scored.filter((h) => h.score >= MIN && h.score >= top * 0.35).slice(0, k);
}
