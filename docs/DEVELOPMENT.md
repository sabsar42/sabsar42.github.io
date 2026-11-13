> Developer notes: how this site is built, configured and deployed. The project overview is in the [README](../README.md).

# Shakib Absar

**AI/ML Engineer · Researcher · Software Developer**

A portfolio about building agentic and multimodal AI systems that ship—and a live example of one. Explore selected work, research, shipped outcomes, and an AI agent that answers questions about my experience using the same structured content as the site.

[Open the portfolio](https://sabsar42.github.io) · [Email](mailto:sabsar42@gmail.com) · [GitHub](https://github.com/sabsar42) · [LinkedIn](https://www.linkedin.com/in/shakib-absar-/)

![The quiet, dark hero of Shakib Absar's portfolio: a small circular profile photo near the bottom of the screen](docs/portfolio-hero.png)

## What you'll find

- **A quiet, interactive homepage** with a photo that opens the AI agent, a live section navigator, and dark and light themes.
- **A founder-style brief and proof of work** covering shipped products, production metrics, experience, and research.
- **An agent workflow graphic** that explains planning, retrieval, vision tools, MCP servers, and evaluation.
- **Selected projects** with interactive demos and live product previews, alongside a searchable command palette (`⌘K` / `Ctrl+K`).
- **Research and recognition** presented as a publications index, research areas, awards, and leadership.
- **Live profile activity** from GitHub, Google Scholar, Kaggle, and Hugging Face when those sources are available.
- **An Open Channel** for project, consulting, and role inquiries, plus direct email and profile links.

## The on-site agent

Ask questions about my work from the portrait, the navigation, or the command palette. The agent retrieves relevant sections from the site's content, streams its answer, and shows a trace with source chips that jump to the supporting section.

OpenRouter provides the primary model when configured. If it is unavailable—or the site is running as a static GitHub Pages build without a connected backend—a lightweight native agent answers from the same retrieved facts. This keeps the portfolio useful without model credentials and avoids making up unsupported details. The model key stays on the server; request validation and rate limits are applied to hosted chat.

## Tech

- Next.js App Router and TypeScript
- Tailwind CSS v4, CSS-variable design tokens, and `next/font`
- Motion for small, reduced-motion-aware transitions
- `cmdk` for the keyboard-accessible command palette
- Vercel AI SDK with OpenRouter, Zod validation, and optional Upstash Redis rate limiting
- GitHub Pages static export, with an optional hosted backend for model-powered chat and contact messages

## Run locally

Requirements: Node.js 22+ and npm.

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` to configure the optional hosted services. The site and native agent can run without an OpenRouter key. Then open [http://localhost:3000](http://localhost:3000).

Useful checks and builds:

```bash
npm run lint
npm run build
npm run build:pages
```

`npm run build:pages` writes a static export to `out/`.

## Configuration

| Variable | Purpose |
|---|---|
| `OPENROUTER_API_KEY` | Server-side key for the primary agent model. Without it, the native agent remains available. |
| `OPENROUTER_MODEL` | OpenRouter model ID; defaults to `openrouter/auto`. |
| `OPENROUTER_BASE_URL` | Optional provider URL override for testing. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Shared rate limiting for a hosted, serverless deployment. Without these, the server uses an in-memory fallback. |
| `CHAT_RATE_LIMIT_PER_HOUR` | Hourly primary-model message limit; defaults to 20. |
| `NATIVE_RATE_LIMIT_PER_HOUR` | Hourly native-agent message limit; defaults to 60. |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL used for metadata and sitemap generation. |
| `NEXT_PUBLIC_API_BASE` | Optional hosted backend origin for static builds. Leave empty to use the native agent and email fallback. |
| `CONTACT_FORM_ENDPOINT` | Optional form service or webhook for Open Channel messages. |
| `ALLOWED_ORIGINS` | Allowed browser origins for a hosted backend; comma-separated. |

## Deploy

### GitHub Pages

The GitHub Actions workflow builds and deploys the static site to [sabsar42.github.io](https://sabsar42.github.io) on pushes to `main`; it can also be run manually. The export contains no server code or API secrets. With no backend configured, the native agent runs in the browser and the contact form offers email instead.

For model-powered chat and form delivery, deploy the app to a server-capable host such as Vercel, then add its URL as the `API_BASE` repository variable for the Pages workflow. The workflow passes it into the static build as `NEXT_PUBLIC_API_BASE`.

### Vercel

Import the repository and configure the desired server environment variables above. OpenRouter and Upstash are optional for local development; configure them in production for the hosted model and shared rate limits.

## Updating the site

[`lib/content.ts`](lib/content.ts) is the source of truth for site content and the agent's knowledge. Update the identity, experience, projects, publications, stack, news, or suggested questions there.

- Set `identity.now` and `identity.lastUpdated` when updating the current focus or footer date.
- Add a CV under `public/` and set `identity.cvPath` to enable its download link.
- The GeoSeg demo currently uses an illustrative schematic. Add the aerial image and transparent masks described by `geosegDemo`, then set `assetsReady` to `true` to use the real assets.
- Add LinkedIn post URLs to `linkedinPosts` to populate the embedded-post section.
- Refresh the profile photo or project and institution images in `public/` as needed.

## Project layout

```text
app/                 Page shell, metadata, and application entry points
components/           Portfolio sections, interactive demos, agent, and palette
lib/content.ts        Shared content model for the site and agent
lib/knowledge/        Content chunking and keyword-based retrieval
lib/agent/            Agent prompts, fallback behavior, and shared types
public/               Profile photo, project previews, and institution marks
scripts/              Photo preparation, icon generation, and Pages build
docs/portfolio-hero.png
                     The single portfolio screenshot used above
```
