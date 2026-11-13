# Build Shakib Absar's Portfolio: a YC Founding Engineer Site with a Built-In AI Agent

You are building my personal website. It must read like the site of a **YC founding engineer**: someone who ships fast, measures everything, and builds agentic AI products. Think of the craft level of Linear, Vercel, Raycast, and Cursor, and the personal sites of engineers like Rauno Freiberg and Paco Coursey. Do not copy any of them. Take only the standard: sharp typography, fast interactions, product-grade details, nothing generic.

The site has two jobs:

1. Make a founder or hiring manager think "this person ships" within 10 seconds.
2. Let them talk to an AI agent that knows my work, and show how that agent thinks while it answers. The site itself is proof that I build agentic systems.

---

## 0. How to work (read first)

Work in phases. After each phase, run `npm run build` and `npm run lint`, fix every error, then give me a short summary before moving on.

- **Phase 0, inspect:** read the existing project, find my profile picture (ask me for the path if you cannot find it), and list what you found.
- **Phase 1, plan:** write `DESIGN.md` with the design tokens (colors, type scale, spacing, motion durations), the component tree, and the data model. Stop and show me the plan before writing UI code.
- **Phase 2, foundation:** project setup, tokens, fonts, layout, and the content file (section 6).
- **Phase 3, hero and intro:** build these first and get them right. They matter more than anything else.
- **Phase 4, remaining sections.**
- **Phase 5, the AI agent** (section 4).
- **Phase 6, polish:** performance, accessibility, SEO, mobile, and the final checklist (section 9).

Do not invent facts about me anywhere: not in the UI, not in placeholder copy, not in the agent's knowledge. Use only the content in section 6. If you need something that is not there, leave a clearly marked `TODO` and tell me.

---

## 1. Hero: empty screen, one photo, one hidden door

The first screen stays almost completely empty. This is the signature of the site.

- No heading, tagline, buttons, navbar, or social links in the hero.
- My profile picture sits in a small, perfect circle, **horizontally centered and near the bottom of the viewport**, with a little breathing room beneath it. Not vertically centered, not at the top.
- Keep it small and elegant (around 64 to 88px on desktop).
- The rest of the screen is empty. No particles, gradients, blobs, or decoration.

```text
┌──────────────────────────────────────────┐
│                                          │
│                                          │
│                                          │
│                                          │
│                                          │
│                                          │
│                                          │
│                                          │
│                   O                      │
│                                          │
└──────────────────────────────────────────┘
```

**The hidden door:** the photo is also the entry point to my AI agent.

- On hover (desktop) or first tap (mobile), a tiny label fades in under the photo: `ask my agent`, in mono type.
- Clicking the photo opens the agent (section 4).
- A one-pixel status dot on the photo's edge pulses slowly (green), like an "online" indicator. Keep it very subtle.

The empty screen should feel intentional and confident, the way a founder's site can afford to be quiet because the work speaks.

---

## 2. Below the hero: the founder-style intro

As the visitor scrolls, the intro rises in, so it feels like a continuation of the empty hero, not a new page.

- One large statement line, editorial size, max two lines:
  **"I build agentic and multimodal AI systems that ship."**
- Under it, a quiet meta row in mono type, separated by thin dividers:
  `Shakib Absar` · `AI/ML Engineer` · `Sylhet, Bangladesh` · `local time (live clock, UTC+6)` · `Open to founding and early-stage AI engineering roles`
- A small **"Now"** line, like a changelog entry: `Now: building multi-agent geospatial pipelines with LangGraph and MCP.` Read it from the content file so I can update it in one place.

A minimal top bar appears only **after** the visitor scrolls past the hero: my name on the left, and `⌘K` plus `Ask my agent` on the right. It must never appear over the hero.

---

## 3. Sections and signature features

Do not build a stack of rounded cards. Each section should have its own layout, but all of them share one type system and one grid.

### 3.1 Proof strip (metrics)

A horizontal strip of real numbers in large mono type. Count up once when it scrolls into view (skip the animation if `prefers-reduced-motion`).

- `50K` checks per day, content moderation in production
- `60%` less manual review
- `+15%` mIoU from LoRA fine-tuning of foundation models
- `10K+` documents in a production RAG system
- `11` research papers (published, accepted, or under review)

### 3.2 Ship log (experience)

Present experience like a product changelog, not a resume list: date on the left in mono, role and company, then one or two lines on what I shipped. A thin vertical line connects the entries. Hovering an entry highlights it and dims the others slightly.

### 3.3 "How I build agents" (signature graphic)

A lightweight, animated SVG diagram of an agent graph, like a LangGraph flow: `user query → planner → tools (retrieval, vision, MCP servers) → evaluator → answer`. Data pulses move along the edges slowly. When the visitor hovers a node, a short caption explains what it does in my real projects. Pure SVG and CSS, no canvas libraries, no WebGL.

### 3.4 Selected work (projects)

Large typographic rows, one per project. On hover, a preview image slides in following the cursor (desktop only). Each row has the project name, a one-line outcome, the stack in mono, and its links.

For **GeoSeg VLM**, add a small interactive demo: a static aerial image with three prompt chips (for example `buildings`, `roads`, `water`). Clicking a chip fades in a **pre-rendered** mask overlay. No live inference, no heavy models in the browser. Mark the image and masks as `TODO` assets for me to supply.

### 3.5 Research (publications index)

An index-style list: year, venue, title, my role, and links. Filter chips by area (Medical Imaging, Computer Vision, Agentic AI and LLMs, Datasets). Filtering animates smoothly with layout transitions.

### 3.6 Stack

Typographic groups, no logos or icon walls: Agentic AI, Vision and Multimodal, Machine Learning, Backend and Deployment.

### 3.7 Recognition

A compact list with the year in mono.

### 3.8 Contact

Command-line style: a single line `> sabsar42@gmail.com` with a copy button that confirms with a small "copied" state, plus links to GitHub, Google Scholar, LinkedIn, and Kaggle. Footer: `Last updated` date and `Press ⌘K to ask my agent`.

### 3.9 Command palette (⌘K / Ctrl+K)

A Raycast-style palette available everywhere after the hero:

- Jump to any section.
- Copy email, open GitHub, Scholar, or LinkedIn.
- Download CV (`TODO`: I will add the PDF to `/public`).
- **Ask anything:** typing a question and pressing Enter sends it to the agent.

---

## 4. The AI agent (the defining feature)

The agent is my personal AI representative, powered by **OpenRouter**. It should feel like a product feature, not a chatbot widget.

### 4.1 Interface

- Opens from three places: clicking the hero photo, the `Ask my agent` button, and the ⌘K palette.
- On desktop, a side panel slides in from the right. On mobile, a full-height bottom sheet.
- First-time visitors see 4 to 6 suggested questions, for example:
  - What does Shakib build?
  - What agentic AI systems has he shipped?
  - Tell me about his computer vision and medical imaging research.
  - What is his strongest technical stack?
  - Is he a fit for a founding engineer role?
  - How do I contact him?
- Responses stream token by token, rendered as Markdown.

### 4.2 Agent trace (what makes it different)

While the agent answers, show a compact, collapsible **trace** above the answer, like a developer tool:

```text
✓ understood question
✓ retrieved 3 sources: Experience · Projects · Publications
… writing answer
```

- The sources must be **real**: they come from the retrieval step in 4.3.
- Each source is a chip. Clicking it closes the panel and smoothly scrolls to that section of the page, with a brief highlight.

### 4.3 Knowledge and grounding

- The knowledge base is the same `content.ts` file that renders the site (section 6). One source of truth.
- Split the content into small chunks (one per role, project, publication, and so on). For each question, retrieve the most relevant chunks with simple keyword scoring (BM25 or similar, server side, no external vector database needed), then send only those chunks to the model.
- System prompt rules:
  - Answer only from the provided chunks. Speak about me in the third person, warmly and concisely.
  - Never invent publications, roles, dates, numbers, skills, or personal details.
  - If the answer is not in the chunks, say so plainly and point to my email.
  - Politely decline unrelated requests (homework, coding help, other people).
  - Keep answers short by default (under about 120 words) unless the visitor asks for detail.

### 4.4 Server and security

- Use Next.js route handlers (`app/api/chat/route.ts`) with the **Vercel AI SDK** and the OpenRouter provider for streaming.
- Read `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` from environment variables. The key must never reach the browser.
- Pick a fast, inexpensive default model and keep it configurable through `OPENROUTER_MODEL`.
- Validate input with `zod`: max 500 characters per message, max 10 messages of history sent.
- Rate limit per IP (for example 20 messages per hour) with Upstash Redis, with an in-memory fallback for local development.
- Clear error states in the UI: rate limited, model unavailable, network error. The panel must never break or hang silently.
- Provide `.env.example` with every variable.

---

## 5. Visual design and motion

**Feel:** quiet, sharp, fast, product-grade. Dark-first, with a light mode that is just as polished, following the system setting with a toggle.

**Typography** (load with `next/font`, no layout shift):

- A clean grotesk for UI and body (Geist or Inter).
- A serif for occasional editorial emphasis in large statements (Instrument Serif or similar), used sparingly.
- A mono for metrics, dates, labels, and the agent trace (Geist Mono or JetBrains Mono).

**Color:** near-black and off-white neutrals, one accent color used only for interactive states and the agent. No large gradients, no glassmorphism, no glow effects.

**Motion:**

- Fast and physical: 150 to 300ms, ease-out springs. Nothing slower than 400ms.
- Reveal on scroll once, never re-trigger.
- Respect `prefers-reduced-motion` everywhere: switch to simple fades or no motion.

**Avoid:** template portfolio layouts, card grids, emoji, stock icons, heavy 3D, cursor trails, typewriter effects, and anything that looks AI-generated.

---

## 6. Content (the only source of truth)

Create `content.ts` with this data. The site and the agent both read from it. Do not add facts that are not listed here.

**Identity**

- Name: Shakib Absar
- Title: AI/ML Engineer, Researcher, Software Developer
- Location: Sylhet, Bangladesh (UTC+6)
- Email: sabsar42@gmail.com
- Links: GitHub https://github.com/sabsar42 · Google Scholar https://scholar.google.com/citations?user=30nhEaIAAAAJ · LinkedIn https://www.linkedin.com/in/shakib-absar-/ · Kaggle https://www.kaggle.com/shakibabsar42
- Interests: agentic AI, multimodal learning, vision-language models, foundation model adaptation, computer vision, medical imaging, geospatial AI

**Experience**

- **Junior AI/ML Engineer**, Indetechs Software Ltd. and Technovative Solutions Ltd. (TVS), Dhaka (remote, UK clients), May 2025 to present
  - Building a multi-agent system with LangGraph, LangChain, and MCP that generates geospatial risk and hazard maps, with a Qwen 3B planner and a RAG layer over domain documents.
  - Built an automated evaluator that scores end-to-end agent runs so workflow changes can be compared.
  - Fine-tuned SAM3 and IBM Prithvi-2 (300M) with LoRA for satellite and aerial segmentation: +15% mIoU.
  - Developing GeoSeg VLM: CLIP indexes 50,000+ orthophotos for plain-language search, and SAM-2 refines regions into masks.
- **Software Developer Intern (AI)**, Fadlun, London, Nov 2024 to Mar 2025
  - Built an AI content moderation system for text and images: 50K checks per day, 60% less manual review, Python and FastAPI.
- **AI Engineering Fellow**, Headstarter AI, New York (remote), Jul 2024 to Sep 2024
  - Deployed a production RAG system with GPT-4 and LangChain over 10K+ documents.
  - Finalist, Headstarter AI Hiring Hackathon (top 5% of 200+ teams).

**Research**

- **Research Intern, MIRA Wing**, Center for Computational and Data Sciences (CCDS), Dhaka, Mar 2025 to present: VLM-ready panoramic dental X-ray dataset with VQA annotations; OPG instance segmentation dataset and benchmark; co-developed TFFM for retinal vessel segmentation.
- **Research Assistant**, InteX Research Lab, Sylhet, Sep 2023 to present: Transformer-based medical image classification; freshwater fish dataset with SAM-derived masks.

**Education**

- B.Sc. in Computer Science and Engineering, Leading University, Sylhet, 2021 to 2025. CGPA 3.90 / 4.00. Thesis: ViT-SAGE Hybrid for kidney CT classification (IEEE COMPAS 2025).

**Projects**

- **GeoSeg VLM:** text-prompted segmentation of aerial and satellite imagery with CLIP and SAM-2.
- **Content Guardian:** multimodal moderation app; BERT hate speech detection at 94.2% accuracy and an adversarially trained NSFW image model at 97.1%. GitHub https://github.com/sabsar42/content_safeguard · Demo https://www.youtube.com/watch?v=YzBwc_2c2Eg
- **Digi-Pharma:** reads prescriptions with OCR at 92% extraction accuracy and structures them with Gemini and a medical knowledge graph. GitHub https://github.com/sabsar42/digital_pharmacist_v2
- **SpeakMock:** full-stack IELTS speaking-session booking platform with Next.js, Supabase, Resend, and Vercel Cron. GitHub https://github.com/sabsar42/SpeakMock · Live https://speakmock.vercel.app

**Publications**

- I. Ahmed, S. Absar, et al. TFFM: Topology-Aware Feature Fusion Module via Latent Graph Reasoning for Retinal Vessel Segmentation. WACV 2026 Workshops (P2P-CV). Project: https://tffm-module.github.io/
- S. Absar, et al. A Freshwater Fish Dataset for Visual Recognition with Manually Localized ROIs and SAM-Derived Instance Masks. Scientific Data, 2026. https://www.nature.com/articles/s41597-026-07552-1
- S. Absar, et al. ViT-SAGE Hybrid: Transformer Patch Embeddings with Graph Neural Network Aggregation for Kidney CT Classification. IEEE COMPAS 2025. https://ieeexplore.ieee.org/document/11381879
- S. Absar, et al. Multi-Strategy Optimization of U-Net Variants for Orthopantomogram Segmentation. IEEE BECITHCON 2025. https://ieeexplore.ieee.org/document/11503995
- M. Arifuzzaman, I. Ahmed, M. J. U. Chowdhury, S. Absar. A Novel Ensemble-Based Deep Learning Model with Explainable AI for Accurate Kidney Disease Diagnosis. AAIML, 2025. https://arxiv.org/abs/2412.09472
- Co-author (2nd author). Do LLM Agents Follow Therapeutic Boundaries? Evaluating Cross-System Drug Substitution Hallucination. AAAI 2026 Workshop. Accepted.
- S. Absar, et al. BDMedData: A Multi-Therapeutic Drug Dataset for Pharmacoinformatics and Public Health in Bangladesh. Scientific Data. Accepted.
- Under review: TFFM+ (BMVC 2026 Workshop, co-author), VLMs in Healthcare review (Artificial Intelligence in Medicine, co-author), panoramic dental radiograph dataset (ACM Transactions on Computing for Healthcare), TotalSpineSeg evaluation (IEEE JBHI).

**Recognition**

- IEEEXtreme 18.0 (2024): 9th in Bangladesh, 1,282nd globally among 10,000+ teams
- NASA Space Apps Challenge 2024: Global Nominee (team ORBITUS), top 947 of 9,900+ teams
- 2nd Runner-Up, Collaborative AI Hackathon by SJ Innovation (2024)
- Finalist, Headstarter AI Hiring Hackathon (2024)
- 1,000+ competitive programming problems solved; LU ACM Coder of the Month (2023)
- Chairperson, IEEE Computer Society LU Student Branch (2024 to 2025)

---

## 7. Tech stack

- Next.js (App Router) with TypeScript, deployed on Vercel.
- Tailwind CSS for styling, with design tokens as CSS variables.
- Motion (Framer Motion) for animation, used sparingly and lazily where possible.
- `cmdk` for the command palette.
- Vercel AI SDK with the OpenRouter provider for the agent; `zod` for validation; Upstash Redis for rate limiting.
- No heavy UI kits, no three.js, no animation libraries beyond the ones listed.

---

## 8. Performance, accessibility, and SEO

**Speed budget (must pass):**

- Lighthouse 95+ on Performance, Accessibility, Best Practices, and SEO (mobile and desktop).
- LCP under 2 seconds, CLS under 0.05, first-load JS as small as possible. Lazy-load the agent panel and command palette so they cost nothing until opened.
- Profile photo through `next/image`, AVIF/WebP, correct sizes, `priority` in the hero.

**Accessibility:**

- Semantic HTML, one `h1` (visually hidden in the hero is fine, so the empty composition stays intact), logical heading order.
- Full keyboard support: the photo, palette, agent panel, and filters all work with keyboard, with visible focus rings. Trap focus inside the open agent panel and close it with Esc.
- Contrast passes WCAG AA in both themes. Screen readers announce streaming answers politely (`aria-live="polite"`).

**SEO:**

- Metadata, Open Graph and Twitter images (a minimal generated OG image: name, title, small circular photo), `sitemap.xml`, `robots.txt`, and JSON-LD `Person` schema with my links.

---

## 9. Final checklist (verify before you say you are done)

- [ ] Hero shows only the circular photo, centered horizontally and near the bottom, with nothing else on screen.
- [ ] Clicking the photo opens the agent; the `ask my agent` hint appears on hover or first tap.
- [ ] Top bar appears only after scrolling past the hero.
- [ ] ⌘K / Ctrl+K opens the palette; navigation, copy email, and ask-the-agent all work.
- [ ] The agent streams answers, shows a real trace with clickable sources, and refuses to invent facts. Test it with: "What awards did he win at NeurIPS?" It must say this is not in its knowledge.
- [ ] API key is only used server side; rate limiting and input validation work; error states display properly.
- [ ] Every number and fact on the site matches section 6 exactly.
- [ ] All links open the correct pages.
- [ ] Lighthouse targets met; reduced motion respected; works on a 375px-wide phone.
- [ ] `npm run build` and `npm run lint` pass with no errors.

List any `TODO` items (assets, CV PDF, GeoSeg demo images) in your final summary so I can supply them.
