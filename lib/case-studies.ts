import { marks, type Mark } from "./content";

/**
 * Client and industry work as case files. Every line restates facts already in content.ts
 * (roles + projects); nothing here is new information.
 */
export type CaseStudy = {
  id: string;
  client: string;
  via: string;
  period: string;
  marks: Mark[];
  title: string;
  brief: string;
  steps: { name: string; detail: string }[];
  outcomes: { value: string; label: string }[];
  stack: string[];
  /** Where "read more" jumps. */
  target: string;
};

export const caseStudies: CaseStudy[] = [
  {
    id: "geo-agents",
    client: "UK clients",
    via: "Indetechs Software · Technovative Solutions (TVS)",
    period: "May 2025 – present",
    marks: [marks.indetechs, marks.tvs],
    title: "Agentic geospatial risk and hazard mapping",
    brief:
      "Generate geospatial risk and hazard maps that are grounded in domain evidence, and make it possible to tell whether a workflow change actually made the system better.",
    steps: [
      { name: "Plan", detail: "A self-hosted Qwen 3B LLM plans the work; LangGraph orchestrates the agents and LangChain composes tools and chains." },
      { name: "Act", detail: "Geospatial tools and data sources are exposed to the agents through MCP servers." },
      { name: "Ground", detail: "A RAG layer over domain documents grounds every hazard assessment in retrieved evidence." },
      { name: "Evaluate", detail: "An automated evaluator scores end-to-end runs on tool-call correctness and output quality, so changes can be compared across experiments." },
    ],
    outcomes: [
      { value: "Multi-agent", label: "LangGraph system generating hazard maps" },
      { value: "MCP", label: "servers exposing geospatial tools" },
      { value: "Auto", label: "evaluation of end-to-end agent runs" },
    ],
    stack: ["LangGraph", "LangChain", "MCP", "Qwen 3B", "RAG", "Python"],
    target: "exp-indetechs",
  },
  {
    id: "sat-seg",
    client: "UK clients",
    via: "Indetechs Software · Technovative Solutions (TVS)",
    period: "May 2025 – present",
    marks: [marks.indetechs, marks.tvs],
    title: "Satellite segmentation with foundation models",
    brief:
      "Segment satellite and aerial imagery more accurately without fully fine-tuning large foundation models, and let people find regions in plain language.",
    steps: [
      { name: "Adapt", detail: "Fine-tuned SAM3 and IBM Prithvi-2 (300M) with LoRA, training only 0.1% of the base parameters." },
      { name: "Index", detail: "GeoSeg VLM: CLIP embeddings index 50,000+ orthophotos for plain-language search." },
      { name: "Segment", detail: "SAM-2 refines the retrieved regions into segmentation masks." },
      { name: "Serve", detail: "The models run as FastAPI services in Docker." },
    ],
    outcomes: [
      { value: "+15%", label: "mIoU on satellite and aerial segmentation" },
      { value: "0.1%", label: "of parameters trained with LoRA" },
      { value: "50K+", label: "orthophotos searchable in plain language" },
    ],
    stack: ["SAM3", "Prithvi-2", "LoRA", "CLIP", "SAM-2", "FastAPI", "Docker"],
    target: "exp-indetechs",
  },
  {
    id: "moderation",
    client: "Fadlun",
    via: "London · remote",
    period: "Nov 2024 – Mar 2025",
    marks: [marks.fadlun],
    title: "Real-time AI content moderation",
    brief:
      "Screen user posts for hate speech, harassment, and NSFW imagery in real time, and cut how much moderators have to review by hand.",
    steps: [
      { name: "Detect", detail: "An AI moderation system flags hate speech, harassment, and NSFW imagery across text and images." },
      { name: "Serve", detail: "Python and FastAPI pipelines moderate posts in real time." },
      { name: "Escalate", detail: "Low-confidence predictions go to a human-in-the-loop queue for moderators." },
      { name: "Learn", detail: "Moderator decisions are logged as labeled data for retraining." },
    ],
    outcomes: [
      { value: "50K", label: "checks per day" },
      { value: "−60%", label: "manual review" },
      { value: "85%+", label: "precision" },
      { value: "<300 ms", label: "average response" },
    ],
    stack: ["Python", "FastAPI", "Human-in-the-loop"],
    target: "exp-fadlun",
  },
  {
    id: "rag",
    client: "Headstarter AI",
    via: "New York · remote",
    period: "Jul – Sep 2024",
    marks: [marks.headstarter],
    title: "Production RAG over 10K+ documents",
    brief: "Answer questions reliably over a large document store, in production, while shipping new AI apps every week.",
    steps: [
      { name: "Retrieve", detail: "Hybrid search: keyword (BM25) and dense vector retrieval over a 10K+ document store." },
      { name: "Generate", detail: "GPT-4 with LangChain answers from the retrieved documents." },
      { name: "Ship", detail: "5+ full-stack AI apps in weekly sprints with Next.js, LLM APIs, and vector databases." },
    ],
    outcomes: [
      { value: "10K+", label: "documents in production RAG" },
      { value: "5+", label: "full-stack AI apps shipped" },
      { value: "Top 5%", label: "of 200+ teams, hiring hackathon" },
    ],
    stack: ["GPT-4", "LangChain", "BM25", "Vector databases", "Next.js"],
    target: "exp-headstarter",
  },
];
