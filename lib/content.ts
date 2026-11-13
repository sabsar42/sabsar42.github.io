/**
 * The single source of truth for the site AND the agent's knowledge base.
 * Sources: CLAUDE.md section 6, Shakib's resume (approved as a second source), and the public
 * landing pages of his own live products (SpeakMock, Mindreva), which he pointed us to.
 * Do not add facts that are not in those sources.
 */

export type SectionId =
  | "about"
  | "brief"
  | "news"
  | "proof"
  | "clients"
  | "experience"
  | "agents"
  | "work"
  | "research"
  | "github"
  | "elsewhere"
  | "stack"
  | "recognition"
  | "contact";

export const sectionLabels: Record<SectionId, string> = {
  about: "About",
  brief: "Brief",
  news: "News",
  proof: "Proof",
  clients: "Client work",
  experience: "Experience",
  agents: "How I build agents",
  work: "Projects",
  research: "Publications",
  github: "Shipping in public",
  elsewhere: "Elsewhere",
  stack: "Stack",
  recognition: "Recognition",
  contact: "Contact",
};

export type Link = { label: string; href: string };

/** Color domains used across the site (see --c-* tokens in globals.css). */
export type Domain = "agent" | "vision" | "research" | "ship" | "data";

/* ------------------------------------------------------------------ */
/* Identity                                                            */
/* ------------------------------------------------------------------ */

export const identity = {
  name: "Shakib Absar",
  title: "AI/ML Engineer, Researcher, Software Developer",
  shortTitle: "AI/ML Engineer",
  location: "Sylhet, Bangladesh",
  timezone: { label: "UTC+6", iana: "Asia/Dhaka" },
  email: "sabsar42@gmail.com",
  links: {
    github: "https://github.com/sabsar42",
    scholar: "https://scholar.google.com/citations?user=30nhEaIAAAAJ",
    linkedin: "https://www.linkedin.com/in/shakib-absar-/",
    kaggle: "https://www.kaggle.com/shakibabsar42",
    academic: "https://shakibabsar.vercel.app",
  },
  interests: [
    "agentic AI",
    "multimodal learning",
    "vision-language models",
    "foundation model adaptation",
    "computer vision",
    "medical imaging",
    "geospatial AI",
  ],
  statement: "I build agentic and multimodal AI systems that ship.",
  /** Roles per CLAUDE.md; client work added by Shakib on 2026-11-13. */
  availability: "Open to founding and early-stage AI engineering roles, and available for client projects",
  availabilityShort: "open to roles and client projects",
  now: "Building multi-agent geospatial pipelines with LangGraph and MCP.",
  summary:
    "AI engineer with 2+ years of experience building and shipping agentic AI systems for UK-based clients. Designs multi-agent workflows with LangGraph, LangChain, and MCP, grounded with RAG and checked by automated evaluation pipelines. Delivers end to end, from FastAPI and Docker backends to Next.js and Flutter front ends.",
  /** TODO(Shakib): add the PDF at /public/Shakib_Absar_CV.pdf, then set this to "/Shakib_Absar_CV.pdf". */
  cvPath: null as string | null,
  /** Shown in the footer. Update when you change this file. */
  lastUpdated: "2026-11-12",
} as const;

/** Interactive words in the intro statement. Every proof line comes from the roles/projects below. */
export const statementHighlights: Record<string, { domain: Domain; title: string; proof: string[]; target: string }> = {
  agentic: {
    domain: "agent",
    title: "Agentic",
    proof: [
      "Multi-agent system with LangGraph, LangChain, and MCP that generates geospatial risk and hazard maps.",
      "Qwen 3B planner, a RAG layer over domain documents, and an automated evaluator for end-to-end runs.",
    ],
    target: "exp-indetechs",
  },
  multimodal: {
    domain: "vision",
    title: "Multimodal",
    proof: [
      "GeoSeg VLM: CLIP indexes 50,000+ orthophotos for plain-language search; SAM-2 refines regions into masks.",
      "Content moderation across text and images; LoRA fine-tuning of SAM3 and IBM Prithvi-2 (+15% mIoU).",
    ],
    target: "work",
  },
  ship: {
    domain: "ship",
    title: "Ships",
    proof: [
      "Content moderation in production: 50K checks per day, 60% less manual review.",
      "Production RAG system with GPT-4 and LangChain over 10K+ documents.",
    ],
    target: "exp-fadlun",
  },
};

/* ------------------------------------------------------------------ */
/* Proof strip                                                         */
/* ------------------------------------------------------------------ */

export type Metric = {
  id: string;
  domain: Domain;
  /** DOM id the tile links to. */
  target: string;
  /** Short attribution shown on the tile. */
  from: string;
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  source: SectionId;
};

export const metrics: Metric[] = [
  { id: "checks", domain: "ship", target: "exp-fadlun", from: "Fadlun", value: 50, suffix: "K", label: "checks per day, content moderation in production", source: "experience" },
  { id: "review", domain: "ship", target: "exp-fadlun", from: "Fadlun", value: 60, suffix: "%", label: "less manual review", source: "experience" },
  { id: "miou", domain: "vision", target: "exp-indetechs", from: "Indetechs / TVS", value: 15, prefix: "+", suffix: "%", label: "mIoU from LoRA fine-tuning of foundation models", source: "experience" },
  { id: "docs", domain: "agent", target: "exp-headstarter", from: "Headstarter AI", value: 10, suffix: "K+", label: "documents in a production RAG system", source: "experience" },
  { id: "papers", domain: "research", target: "research", from: "Research", value: 11, label: "research papers: published, accepted, or under review", source: "research" },
];

/* ------------------------------------------------------------------ */
/* Experience                                                          */
/* ------------------------------------------------------------------ */

/** An institution mark: official logo in /public/logos, or a monogram when no logo is available. */
export type Mark = { src?: string; alt: string; monogram?: string };

export const marks = {
  indetechs: { src: "/logos/indetechs.webp", alt: "Indetechs Software" },
  tvs: { src: "/logos/tvs.webp", alt: "Technovative Solutions (TVS)" },
  fadlun: { alt: "Fadlun", monogram: "F" },
  headstarter: { src: "/logos/headstarter.webp", alt: "Headstarter AI" },
  ccds: { src: "/logos/ccds.webp", alt: "CCDS" },
  intex: { alt: "InteX Research Lab", monogram: "IX" },
  lu: { src: "/logos/lu.webp", alt: "Leading University" },
  ieee: { src: "/logos/ieee.webp", alt: "IEEE" },
  ieeecs: { src: "/logos/ieeecs.webp", alt: "IEEE Computer Society" },
  spaceapps: { src: "/logos/spaceapps.webp", alt: "NASA Space Apps Challenge" },
  sji: { src: "/logos/sji.webp", alt: "SJ Innovation" },
} satisfies Record<string, Mark>;

export type Role = {
  /** Logos shown next to the role. */
  marks: Mark[];
  id: string;
  kind: "industry" | "research";
  title: string;
  org: string;
  location: string;
  /** "YYYY-MM" */
  start: string;
  end: string | "present";
  /** 1–2 lines shown in the ship log. */
  highlights: string[];
  /** Full detail, used by the agent. */
  details: string[];
};

export const roles: Role[] = [
  {
    id: "indetechs",
    marks: [marks.indetechs, marks.tvs],
    kind: "industry",
    title: "AI/ML Engineer",
    org: "Indetechs Software Ltd. and Technovative Solutions Ltd. (TVS)",
    location: "Dhaka, Bangladesh (remote, UK clients)",
    start: "2025-05",
    end: "present",
    highlights: [
      "Multi-agent system with LangGraph, LangChain, and MCP that generates geospatial risk and hazard maps, with a Qwen 3B planner, a RAG layer, and an automated evaluator for end-to-end runs.",
      "LoRA fine-tuning of SAM3 and IBM Prithvi-2 (300M) for satellite and aerial segmentation: +15% mIoU.",
    ],
    details: [
      "Building a multi-agent orchestration system that generates geospatial risk and hazard maps, using LangGraph for agent workflows, LangChain for tool and chain composition, and a self-hosted Qwen 3B LLM as planner.",
      "Exposed geospatial tools and data sources to the agents through MCP servers and added a RAG layer over domain documents, so hazard assessments are grounded in retrieved evidence.",
      "Built an automated pipeline evaluator that scores end-to-end agent runs (tool-call correctness, output quality), so prompt and workflow changes can be compared across experiments.",
      "Fine-tuned SAM3 and IBM Prithvi-2 (300M) with LoRA for satellite and aerial segmentation, gaining +15% mIoU while training only 0.1% of base parameters.",
      "Developing GeoSeg VLM for text-prompted segmentation of aerial and satellite imagery: CLIP embeddings index 50,000+ orthophotos for plain-language search, SAM-2 refines regions into masks, and the models are served as FastAPI services in Docker.",
    ],
  },
  {
    id: "fadlun",
    marks: [marks.fadlun],
    kind: "industry",
    title: "Software Developer Intern (AI)",
    org: "Fadlun",
    location: "London, England (remote)",
    start: "2024-11",
    end: "2025-03",
    highlights: [
      "AI content moderation for text and images in Python and FastAPI: 50K checks per day, 60% less manual review.",
    ],
    details: [
      "Built an AI content moderation system that flags hate speech, harassment, and NSFW imagery in user posts, cutting manual review by 60%.",
      "Developed Python and FastAPI pipelines for real-time moderation, handling 50K checks per day at 85%+ precision with an average response time under 300 ms.",
      "Added a human-in-the-loop queue: low-confidence predictions go to moderators, and their decisions are logged as labeled data for retraining.",
    ],
  },
  {
    id: "headstarter",
    marks: [marks.headstarter],
    kind: "industry",
    title: "AI Engineering Fellow",
    org: "Headstarter AI",
    location: "New York, USA (remote)",
    start: "2024-07",
    end: "2024-09",
    highlights: [
      "Deployed a production RAG system with GPT-4 and LangChain over 10K+ documents. Finalist, Headstarter AI Hiring Hackathon (top 5% of 200+ teams).",
    ],
    details: [
      "Deployed a production RAG system using GPT-4 and LangChain, combining keyword (BM25) and dense vector search over a 10K+ document store.",
      "Shipped 5+ full-stack AI apps in weekly sprints with Next.js, LLM APIs, and vector databases.",
      "Finalist at the Headstarter AI Hiring Hackathon, placing in the top 5% of 200+ teams.",
    ],
  },
  {
    id: "ccds",
    marks: [marks.ccds],
    kind: "research",
    title: "Research Intern, MIRA Wing",
    org: "Center for Computational and Data Sciences (CCDS)",
    location: "Dhaka, Bangladesh",
    start: "2025-03",
    end: "present",
    highlights: [
      "VLM-ready panoramic dental X-ray dataset with VQA annotations, an OPG instance segmentation dataset and benchmark, and co-development of TFFM for retinal vessel segmentation.",
    ],
    details: [
      "Building a VLM-ready panoramic dental X-ray (OPG) dataset with VQA annotations for vision-language model grounding, under Prof. Md. Rashedur Rahman, D.Eng.",
      "Created a fully annotated OPG instance segmentation dataset and benchmarked multiple architectures for tooth segmentation and classification. Optimized U-Net variants for OPG segmentation (IEEE BECITHCON 2025).",
      "Co-developed TFFM, a topology-aware graph reasoning module for retinal vessel segmentation (WACV 2026 Workshop), and extended it into TFFM+.",
    ],
  },
  {
    id: "intex",
    marks: [marks.intex],
    kind: "research",
    title: "Research Assistant",
    org: "InteX Research Lab",
    location: "Sylhet, Bangladesh",
    start: "2023-09",
    end: "present",
    highlights: [
      "Transformer-based medical image classification, and a freshwater fish dataset with SAM-derived instance masks.",
    ],
    details: [
      "Transformer-based medical image classification.",
      "Freshwater fish dataset with manually localized ROIs and SAM-derived instance masks (Scientific Data, 2026).",
    ],
  },
];

export const education = {
  degree: "B.Sc. in Computer Science and Engineering",
  school: "Leading University",
  location: "Sylhet, Bangladesh",
  start: "2021-02",
  end: "2025-03",
  cgpa: "3.90 / 4.00",
  thesis: "ViT-SAGE Hybrid (Vision Transformer + GraphSAGE) for kidney CT classification, published at IEEE COMPAS 2025.",
  marks: [marks.lu] as Mark[],
};

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

/** How a project's real interface is shown on the page. */
export type Embed =
  /** A live site in an iframe inside a browser frame (the site must allow framing). */
  | { kind: "site"; url: string; poster: string }
  /** A mobile web app in a phone frame. `framable: false` when the app blocks iframes: show the poster and open it in a new tab. */
  | { kind: "phone"; url: string; poster: string; framable: boolean }
  /** A YouTube demo, loaded only after the visitor clicks play. */
  | { kind: "video"; youtubeId: string; poster: string };

export type Project = {
  id: string;
  name: string;
  outcome: string;
  stack: string[];
  details: string[];
  links: Link[];
  domain: Domain;
  /** Key number shown on the project tab (taken from the details above). */
  stat: { value: string; label: string };
  /** True when the product is publicly live. */
  live?: boolean;
  embed?: Embed;
};

export const projects: Project[] = [
  {
    id: "geoseg",
    domain: "vision",
    stat: { value: "50K+", label: "orthophotos indexed with CLIP" },
    name: "GeoSeg VLM",
    outcome: "Text-prompted segmentation of aerial and satellite imagery: CLIP finds regions in plain language, SAM-2 turns them into masks.",
    stack: ["CLIP", "SAM-2", "FastAPI", "Docker"],
    details: [
      "CLIP embeddings index 50,000+ orthophotos so users can find regions in plain language.",
      "SAM-2 refines the retrieved regions into segmentation masks.",
      "Models are served as FastAPI services in Docker.",
      "Built at Indetechs / TVS (in development).",
    ],
    links: [],
  },
  {
    id: "speakmock",
    domain: "ship",
    stat: { value: "72h", label: "auto-cleanup of session pages via Vercel Cron" },
    name: "SpeakMock",
    outcome: "Live IELTS speaking platform: an AI mock test with an AI examiner, plus booking for human-examiner sessions with magic-link pages, an admin dashboard, and an automated email lifecycle.",
    stack: ["Next.js", "TypeScript", "Supabase", "Resend", "Vercel Cron"],
    details: [
      "AI Mock Test: a face-to-face video call with an AI examiner in the real three-part IELTS speaking format (about 15 minutes), with a band score across 4 criteria, written feedback, and a PDF minutes later.",
      "Students can also book 20-minute IELTS speaking sessions, submit a payment transaction ID, and get a private magic-link session page with their Google Meet link and result.",
      "A password-protected admin dashboard with cookie-based auth to verify payments, confirm or reject bookings, manage time slots, and upload result files to Supabase Storage.",
      "Lifecycle automated with Resend and React Email templates (confirmation, 24-hour and 1-hour reminders, result ready) and a Vercel Cron job that deletes session pages and result files 72 hours after completion.",
      "Built with Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Resend, and Vercel.",
    ],
    links: [
      { label: "GitHub", href: "https://github.com/sabsar42/SpeakMock" },
      { label: "Live", href: "https://speakmock.vercel.app" },
    ],
    live: true,
    embed: { kind: "site", url: "https://speakmock.vercel.app", poster: "/projects/speakmock.webp" },
  },
  {
    id: "mindreva",
    domain: "data",
    stat: { value: "3+", label: "languages: English, Bangla, Urdu, and more" },
    name: "Mindreva",
    outcome: "Voice journaling and notetaking: talk it out, and Mindreva turns it into a readable journal entry in English, Bangla, Urdu, and more.",
    stack: ["Next.js", "TypeScript", "Supabase", "Vercel"],
    details: [
      "Tap to record, keep a readable note: spoken thoughts become clean journal entries.",
      "Works across languages, including English, Bangla (বাংলা), and Urdu (اردو).",
      "Live as a web app.",
    ],
    links: [
      { label: "Live", href: "https://mindreva-web.vercel.app" },
      { label: "GitHub", href: "https://github.com/sabsar42/mindreva" },
    ],
    live: true,
    embed: { kind: "phone", url: "https://mindreva-web.vercel.app", poster: "/projects/mindreva.webp", framable: false },
  },
  {
    id: "content-guardian",
    domain: "agent",
    stat: { value: "97.1%", label: "NSFW image model accuracy" },
    name: "Content Guardian",
    outcome: "Multimodal moderation app: BERT hate-speech detection at 94.2% accuracy and an adversarially trained NSFW image model at 97.1%.",
    stack: ["Flutter", "FastAPI", "PyTorch", "HuggingFace Transformers", "BERT"],
    details: [
      "A cross-platform app that screens both text and images before they are posted, with a single FastAPI endpoint serving both models.",
      "Fine-tuned BERT for hate speech detection (94.2% accuracy) and adversarially trained a vision model for NSFW detection (97.1% accuracy), making it harder to fool with perturbed images.",
    ],
    links: [
      { label: "GitHub", href: "https://github.com/sabsar42/content_safeguard" },
      { label: "Demo", href: "https://www.youtube.com/watch?v=YzBwc_2c2Eg" },
    ],
    embed: { kind: "video", youtubeId: "YzBwc_2c2Eg", poster: "/projects/content-guardian.webp" },
  },
  {
    id: "digi-pharma",
    domain: "research",
    stat: { value: "92%", label: "OCR text extraction accuracy" },
    name: "Digi-Pharma",
    outcome: "Reads prescriptions with OCR at 92% extraction accuracy and structures them with Gemini and a medical knowledge graph.",
    stack: ["Flutter", "Google ML Kit OCR", "Gemini", "RAG", "Knowledge Graphs"],
    details: [
      "A mobile app that reads handwritten and printed prescriptions with OCR at 92% text extraction accuracy.",
      "Uses Gemini with a medical knowledge graph to turn raw text into structured medicine, dosage, and schedule data, generating 100+ patient insights.",
      "Includes a RAG-based health assistant and a dashboard for medication adherence and BMI tracking.",
    ],
    links: [{ label: "GitHub", href: "https://github.com/sabsar42/digital_pharmacist_v2" }],
  },
];

/** GeoSeg demo assets. TODO(Shakib): supply these files (same pixel size, masks as transparent PNG). */
export const geosegDemo = {
  base: "/geoseg/base.webp",
  prompts: [
    { id: "buildings", label: "buildings", mask: "/geoseg/mask-buildings.png" },
    { id: "roads", label: "roads", mask: "/geoseg/mask-roads.png" },
    { id: "water", label: "water", mask: "/geoseg/mask-water.png" },
  ],
  /** Flip to true once the files above exist in /public/geoseg. */
  assetsReady: false,
} as const;

/* ------------------------------------------------------------------ */
/* Publications                                                        */
/* ------------------------------------------------------------------ */

export const areas = ["Medical Imaging", "Computer Vision", "Agentic AI and LLMs", "Datasets"] as const;
export type Area = (typeof areas)[number];

export type Publication = {
  id: string;
  year?: number;
  venue: string;
  title: string;
  authors?: string;
  role?: string;
  status: "published" | "accepted" | "under review";
  areas: Area[];
  /** Shown on the page. The agent knows every publication. */
  featured?: boolean;
  links: Link[];
};

export const publications: Publication[] = [
  {
    id: "tffm",
    featured: true,
    year: 2026,
    venue: "WACV 2026 Workshops (P2P-CV), oral",
    title: "TFFM: Topology-Aware Feature Fusion Module via Latent Graph Reasoning for Retinal Vessel Segmentation",
    authors: "I. Ahmed, S. Absar, et al.",
    role: "Co-author (2nd author)",
    status: "published",
    areas: ["Medical Imaging", "Computer Vision"],
    links: [{ label: "Project", href: "https://tffm-module.github.io/" }],
  },
  {
    id: "fish",
    featured: true,
    year: 2026,
    venue: "Scientific Data",
    title: "A Freshwater Fish Dataset for Visual Recognition with Manually Localized ROIs and SAM-Derived Instance Masks",
    authors: "S. Absar, et al.",
    role: "First author",
    status: "published",
    areas: ["Datasets", "Computer Vision"],
    links: [{ label: "Paper", href: "https://www.nature.com/articles/s41597-026-07552-1" }],
  },
  {
    id: "vit-sage",
    featured: true,
    year: 2025,
    venue: "IEEE COMPAS 2025",
    title: "ViT-SAGE Hybrid: Transformer Patch Embeddings with Graph Neural Network Aggregation for Kidney CT Classification",
    authors: "S. Absar, et al.",
    role: "First author (undergraduate thesis)",
    status: "published",
    areas: ["Medical Imaging", "Computer Vision"],
    links: [{ label: "IEEE", href: "https://ieeexplore.ieee.org/document/11381879" }],
  },
  {
    id: "unet-opg",
    year: 2025,
    venue: "IEEE BECITHCON 2025",
    title: "Multi-Strategy Optimization of U-Net Variants for Orthopantomogram Segmentation",
    authors: "S. Absar, et al.",
    role: "First author",
    status: "published",
    areas: ["Medical Imaging", "Computer Vision"],
    links: [{ label: "IEEE", href: "https://ieeexplore.ieee.org/document/11503995" }],
  },
  {
    id: "kidney-ensemble",
    year: 2025,
    venue: "AAIML",
    title: "A Novel Ensemble-Based Deep Learning Model with Explainable AI for Accurate Kidney Disease Diagnosis",
    authors: "M. Arifuzzaman, I. Ahmed, M. J. U. Chowdhury, S. Absar",
    role: "Co-author (4th author)",
    status: "published",
    areas: ["Medical Imaging"],
    links: [{ label: "arXiv", href: "https://arxiv.org/abs/2412.09472" }],
  },
  {
    id: "drug-substitution",
    featured: true,
    year: 2026,
    venue: "AAAI 2026 Workshop (AT-AI4H-NW)",
    title: "Do LLM Agents Follow Therapeutic Boundaries? Evaluating Cross-System Drug Substitution Hallucination",
    role: "Co-author (2nd author)",
    status: "accepted",
    areas: ["Agentic AI and LLMs"],
    links: [],
  },
  {
    id: "bdmeddata",
    venue: "Scientific Data",
    title: "BDMedData: A Multi-Therapeutic Drug Dataset for Pharmacoinformatics and Public Health in Bangladesh",
    authors: "S. Absar, et al.",
    role: "First author",
    status: "accepted",
    areas: ["Datasets"],
    links: [],
  },
  {
    id: "tffm-plus",
    year: 2026,
    venue: "BD-MedVis Workshop @ BMVC 2026",
    title: "TFFM+: Spatially-Aware Dynamic Graph Fusion for Topology-Preserving Retinal Vessel Segmentation",
    role: "Co-author (2nd author)",
    status: "accepted",
    areas: ["Medical Imaging", "Computer Vision"],
    links: [],
  },
  {
    id: "vlm-healthcare-review",
    venue: "Artificial Intelligence in Medicine",
    title: "Vision-language models in healthcare (review)",
    role: "Co-author",
    status: "under review",
    areas: ["Medical Imaging", "Agentic AI and LLMs"],
    links: [],
  },
  {
    id: "opg-dataset",
    venue: "ACM Transactions on Computing for Healthcare",
    title: "Panoramic dental radiograph dataset",
    status: "under review",
    areas: ["Datasets", "Medical Imaging"],
    links: [],
  },
  {
    id: "totalspineseg",
    venue: "IEEE JBHI",
    title: "TotalSpineSeg evaluation",
    status: "under review",
    areas: ["Medical Imaging"],
    links: [],
  },
];

/* ------------------------------------------------------------------ */
/* Stack                                                               */
/* ------------------------------------------------------------------ */

export type Skill = { name: string; /** Lowercase phrases used to find where the skill appears in roles/projects/papers. */ match?: string[] };
export type SkillGroup = { name: string; domain: Domain; items: Skill[] };

export const stack: SkillGroup[] = [
  {
    name: "Agentic AI",
    domain: "agent",
    items: [
      { name: "LangGraph" },
      { name: "LangChain" },
      { name: "MCP" },
      { name: "Multi-agent systems", match: ["multi-agent"] },
      { name: "RAG" },
      { name: "Agent evaluation", match: ["evaluator", "evaluating"] },
      { name: "Vector databases", match: ["vector"] },
      { name: "Claude Code" },
      { name: "Sub-agent orchestration" },
    ],
  },
  {
    name: "Vision and Multimodal",
    domain: "vision",
    items: [
      { name: "VLMs", match: ["vlm", "vision-language", "vision language"] },
      { name: "CLIP" },
      { name: "DINO" },
      { name: "SAM3" },
      { name: "SAM-2", match: ["sam-2"] },
      { name: "Vision Transformers", match: ["vision transformer", "vit-sage", "transformer patch", "transformer-based"] },
      { name: "OCR" },
      { name: "Image analysis", match: ["image", "segmentation"] },
    ],
  },
  {
    name: "Machine Learning",
    domain: "research",
    items: [
      { name: "PyTorch" },
      { name: "TensorFlow" },
      { name: "HuggingFace Transformers", match: ["huggingface"] },
      { name: "scikit-learn" },
      { name: "OpenCV" },
      { name: "LoRA / QLoRA", match: ["lora"] },
      { name: "PEFT" },
      { name: "Adversarial training", match: ["adversarial"] },
      { name: "Explainable AI" },
    ],
  },
  {
    name: "Backend and Deployment",
    domain: "ship",
    items: [
      { name: "Python" },
      { name: "TypeScript" },
      { name: "SQL" },
      { name: "FastAPI" },
      { name: "Node.js" },
      { name: "Next.js" },
      { name: "Supabase" },
      { name: "Docker" },
      { name: "Vercel" },
      { name: "REST APIs" },
    ],
  },
];

export const areaDomain: Record<Area, Domain> = {
  "Medical Imaging": "research",
  "Computer Vision": "vision",
  "Agentic AI and LLMs": "agent",
  Datasets: "data",
};

/* ------------------------------------------------------------------ */
/* Recognition and leadership                                          */
/* ------------------------------------------------------------------ */

export const awards: { year: string; text: string; mark: Mark }[] = [
  { year: "2024", text: "IEEEXtreme 18.0: 9th in Bangladesh, 1,282nd globally among 10,000+ teams", mark: marks.ieee },
  { year: "2024", text: "NASA Space Apps Challenge: Global Nominee (team ORBITUS), top 947 of 9,900+ teams", mark: marks.spaceapps },
  { year: "2024", text: "2nd Runner-Up, Collaborative AI Hackathon by SJ Innovation", mark: marks.sji },
  { year: "2024", text: "Finalist, Headstarter AI Hiring Hackathon (top 5% of 200+ teams)", mark: marks.headstarter },
  { year: "2023", text: "LU ACM Coder of the Month; 1,000+ competitive programming problems solved", mark: marks.lu },
];

export const leadership: { year: string; text: string; mark: Mark }[] = [
  { year: "2024–25", text: "Chairperson, IEEE Computer Society LU Student Branch: led workshops, contests, and technical sessions", mark: marks.ieeecs },
  { year: "—", text: "Mentor, FTP Bootcamp at Qbitlab: taught computer science and machine learning foundations to 500+ school students", mark: { alt: "Qbitlab", monogram: "Q" } },
  { year: "—", text: "Instructor and Teaching Assistant, Leading University: ran programming workshops; tutored Java and Data Structures", mark: marks.lu },
];

/* ------------------------------------------------------------------ */
/* News (curated from the Updates feed on shakibabsar.vercel.app)      */
/* ------------------------------------------------------------------ */

export type NewsKind = "paper" | "product" | "career" | "research" | "award" | "education";
export type News = {
  id: string;
  /** "YYYY-MM" or "YYYY" */
  date: string;
  kind: NewsKind;
  title: string;
  text: string;
  place?: string;
  /** DOM id on this page to jump to. */
  href?: string;
  mark?: Mark;
};

export const newsKinds: { id: NewsKind; label: string; domain: Domain }[] = [
  { id: "paper", label: "Papers", domain: "research" },
  { id: "product", label: "Products", domain: "ship" },
  { id: "research", label: "Research", domain: "vision" },
  { id: "career", label: "Career", domain: "agent" },
  { id: "award", label: "Awards", domain: "data" },
  { id: "education", label: "Education", domain: "data" },
];

export const news: News[] = [
  {
    id: "tffm-plus-bmvc",
    date: "2026-09",
    kind: "paper",
    title: "TFFM+ accepted at BMVC 2026",
    text: "“TFFM+: Spatially-Aware Dynamic Graph Fusion for Topology-Preserving Retinal Vessel Segmentation” was accepted at the BD-MedVis Workshop @ BMVC 2026.",
    place: "Lancaster, UK",
    href: "research",
  },
  {
    id: "speakmock-voice-agent",
    date: "2026-09",
    kind: "product",
    title: "Shipped SpeakMock, an AI voice examiner",
    text: "An agentic examiner for IELTS speaking practice: an end-to-end STT → LLM → TTS → AI avatar pipeline with real-time conversational assessment.",
    place: "Dhaka, Bangladesh",
    href: "work-speakmock",
  },
  {
    id: "aaai-drug-substitution",
    date: "2026-09",
    kind: "paper",
    title: "LLM-agent safety paper accepted at AAAI 2026",
    text: "“Do LLM Agents Follow Therapeutic Boundaries? Evaluating Cross-System Drug Substitution Hallucination” was accepted at the AT-AI4H-NW 2026 Workshop @ AAAI 2026.",
    place: "Arlington, VA, USA",
    href: "pub-drug-substitution",
  },
  {
    id: "voice-agents",
    date: "2026-08",
    kind: "research",
    title: "Exploring voice agents",
    text: "Exploring voice agent workflows and agent embedding generation, toward more interactive and multimodal AI systems.",
    place: "Dhaka, Bangladesh",
  },
  {
    id: "fish-scidata",
    date: "2026-07",
    kind: "paper",
    title: "Fish dataset accepted at Scientific Data (Q1)",
    text: "The freshwater fish dataset paper, with manually localized ROIs and SAM-derived instance masks, was accepted at Scientific Data.",
    place: "Dhaka, Bangladesh",
    href: "pub-fish",
  },
  {
    id: "bdmeddata",
    date: "2026-06",
    kind: "paper",
    title: "BDMedData accepted at Scientific Data (Q1)",
    text: "A multi-therapeutic drug dataset for pharmacoinformatics and public health research in Bangladesh.",
    place: "Dhaka, Bangladesh",
    href: "research",
  },
  {
    id: "fish-masks",
    date: "2026-05",
    kind: "research",
    title: "9,075 masks generated with SAM",
    text: "Built the freshwater fish segmentation dataset with SAM: 9,075 binary masks from bounding-box prompts, checked by an automated QC pipeline (binarization, morphological filtering, connected-component analysis).",
    place: "Dhaka, Bangladesh",
  },
  {
    id: "tffm-wacv",
    date: "2026",
    kind: "paper",
    title: "TFFM published at WACV 2026, oral",
    text: "TFFM was published at P2P-CV @ WACV 2026 as an oral presentation: 38% less fragmentation, 90.97% Dice, and generalization across 5 datasets.",
    place: "Tucson, AZ, USA",
    href: "pub-tffm",
  },
  {
    id: "becithcon",
    date: "2025-11",
    kind: "paper",
    title: "OPG segmentation paper at IEEE BECITHCON 2025",
    text: "“Multi-Strategy Optimization of U-Net Variants for Orthopantomogram Segmentation” was published at IEEE BECITHCON 2025.",
    place: "Dhaka, Bangladesh",
    href: "research",
    mark: marks.ieee,
  },
  {
    id: "vit-sage",
    date: "2025",
    kind: "paper",
    title: "ViT-SAGE published at IEEE COMPAS 2025",
    text: "His thesis work, a Vision Transformer + GraphSAGE hybrid for kidney CT classification, was published at IEEE COMPAS 2025.",
    href: "pub-vit-sage",
    mark: marks.ieee,
  },
  {
    id: "promoted",
    date: "2025-05",
    kind: "career",
    title: "Promoted to AI/ML Engineer at Indetechs",
    text: "Promoted to Jr. AI/ML Engineer at Indetechs Software Ltd., working with UK clients on agentic and geospatial AI.",
    place: "Dhaka, Bangladesh",
    href: "exp-indetechs",
    mark: marks.indetechs,
  },
  {
    id: "ccds-start",
    date: "2025-03",
    kind: "career",
    title: "Joined CCDS MIRA Wing as a research intern",
    text: "Started a research internship at CCDS MIRA Wing, working on OPG diagnostic pipelines.",
    place: "Dhaka, Bangladesh",
    href: "exp-ccds",
    mark: marks.ccds,
  },
  {
    id: "graduated",
    date: "2025-03",
    kind: "education",
    title: "Graduated B.Sc. in CSE, CGPA 3.90",
    text: "Graduated from Leading University with a CGPA of 3.90 / 4.00.",
    place: "Sylhet, Bangladesh",
    href: "exp-education",
    mark: marks.lu,
  },
  {
    id: "ieeextreme",
    date: "2024-12",
    kind: "award",
    title: "IEEEXtreme 18.0: 9th in Bangladesh",
    text: "9th place nationally and 1,282nd globally among 10,000+ teams.",
    href: "recognition",
    mark: marks.ieee,
  },
  {
    id: "spaceapps",
    date: "2024-10",
    kind: "award",
    title: "NASA Space Apps Global Nominee",
    text: "Global Nominee at the NASA Space Apps Challenge 2024: among 947 teams out of 9,900+ worldwide.",
    href: "recognition",
    mark: marks.spaceapps,
  },
  {
    id: "headstarter-done",
    date: "2024-07",
    kind: "career",
    title: "Headstarter AI fellowship, hackathon finalist",
    text: "Completed the fellowship at Headstarter AI and was a finalist in its AI Hiring Hackathon (top 5% of 200+ teams).",
    place: "New York, USA",
    href: "exp-headstarter",
    mark: marks.headstarter,
  },
];

/* ------------------------------------------------------------------ */
/* Profiles elsewhere                                                  */
/* ------------------------------------------------------------------ */

export const profiles = {
  huggingface: "https://huggingface.co/sabsar42",
  researchgate: "https://www.researchgate.net/profile/Shakib-Absar",
  youtube: "https://www.youtube.com/@shakibabsar",
  /** Featured video, played inline. */
  youtubeVideo: "YzBwc_2c2Eg",
} as const;

/**
 * LinkedIn posts to embed: paste each post's URL ("Copy link to post", or the src from "Embed this post").
 * TODO(Shakib): add 2–6 posts. Until then the section shows a follow card instead.
 */
export const linkedinPosts: string[] = [];

/* ------------------------------------------------------------------ */
/* Agent graph (section 3.3)                                           */
/* ------------------------------------------------------------------ */

export type GraphNodeId = "query" | "planner" | "retrieval" | "vision" | "mcp" | "evaluator" | "answer";

export const agentGraph: { id: GraphNodeId; label: string; caption: string; domain?: Domain }[] = [
  { id: "query", label: "user query", caption: "A question or task enters the graph as state." },
  {
    id: "planner",
    domain: "agent",
    label: "planner",
    caption: "Breaks the task into steps. In the geospatial hazard-mapping system, a self-hosted Qwen 3B model plans inside a LangGraph workflow.",
  },
  {
    id: "retrieval",
    domain: "research",
    label: "retrieval",
    caption: "RAG over domain documents grounds hazard assessments in retrieved evidence. At Headstarter: BM25 plus dense search over 10K+ documents.",
  },
  {
    id: "vision",
    domain: "vision",
    label: "vision",
    caption: "CLIP indexes 50,000+ orthophotos for plain-language search; SAM-2 refines regions into masks (GeoSeg VLM).",
  },
  {
    id: "mcp",
    domain: "ship",
    label: "MCP servers",
    caption: "Geospatial tools and data sources are exposed to the agents through MCP servers.",
  },
  {
    id: "evaluator",
    domain: "data",
    label: "evaluator",
    caption: "Scores end-to-end runs on tool-call correctness and output quality, so prompt and workflow changes can be compared.",
  },
  {
    id: "answer",
    label: "answer",
    caption: "A grounded output: a risk or hazard map, a mask, or an answer with sources. The agent on this site runs the same retrieve-then-answer loop.",
  },
];

/* ------------------------------------------------------------------ */
/* Agent suggestions                                                   */
/* ------------------------------------------------------------------ */

export const suggestedQuestions = [
  "What does Shakib build?",
  "What agentic AI systems has he shipped?",
  "Tell me about his computer vision and medical imaging research.",
  "What is his strongest technical stack?",
  "Is he open to roles and client work?",
  "How do I contact him?",
];


/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatMonth(ym: string): string {
  if (ym === "present") return "Present";
  const [y, m] = ym.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

export function formatRange(start: string, end: string): string {
  return `${formatMonth(start)} – ${formatMonth(end)}`;
}

export const content = {
  identity,
  metrics,
  roles,
  education,
  projects,
  publications,
  stack,
  awards,
  leadership,
  agentGraph,
} as const;
