# shakibabsar — personal site with a built-in AI agent

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Vercel AI SDK + OpenRouter · cmdk · Motion (lazy).

## Run locally

```bash
npm install
cp .env.example .env.local   # add OPENROUTER_API_KEY
npm run dev                  # http://localhost:3000
npm run build && npm run lint
```

Without `OPENROUTER_API_KEY` the site works, and the agent panel shows its "model isn't responding" state.

## Environment

| Variable | Required | Notes |
|---|---|---|
| `OPENROUTER_API_KEY` | yes (prod) | Server only. Never sent to the browser. |
| `OPENROUTER_MODEL` | no | Defaults to `anthropic/claude-haiku-5.5`. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | yes (prod) | Rate limiting. Without them an in-memory limiter is used (per instance; fine locally, not on serverless). |
| `CHAT_RATE_LIMIT_PER_HOUR` | no | Default 20 messages per IP per hour. |
| `NEXT_PUBLIC_SITE_URL` | no | Canonical URL for metadata, sitemap, robots, OG. Defaults to `https://shakibabsar.vercel.app`. |
| `OPENROUTER_BASE_URL` | no | Testing only (point at a local mock). Leave empty in production. |

## Editing content

Everything (site **and** agent knowledge) comes from [`lib/content.ts`](lib/content.ts).

- "Now" line: `identity.now`
- Footer date: `identity.lastUpdated`
- CV: put the PDF in `public/` and set `identity.cvPath` (the Download CV link and palette command appear automatically)
- GeoSeg demo: add the files listed in `geosegDemo`, then set `assetsReady: true`
- Live embeds: set `embed` on a project (`site`, `phone`, or `video`). Posters live in `public/projects/`. To let Mindreva run inside the page, allow this site in its `frame-ancestors` CSP and set `framable: true`.

- LinkedIn posts: paste post URLs into `linkedinPosts` (any "Copy link to post" URL works); they embed in the Elsewhere section
- News: `news` (newest first; the first item is featured)
- Institution logos: `marks` (files in `public/logos/`)

The photo assets are generated from `shakib-absar.jpeg` with `npm run photo`. Tool and platform icons are copied from simple-icons into `lib/brand-icons.ts` with `npm run icons` (edit the list in `scripts/gen-icons.mjs`).

Live data (refreshed every 12 hours, falls back to plain links if a site is unreachable): GitHub contributions and repos (`lib/github.ts`), Google Scholar, Kaggle and Hugging Face (`lib/profiles.ts`).

## Open Channel (contact form)

Set `CONTACT_FORM_ENDPOINT` to your form backend's POST URL (Formspree, Web3Forms, Getform, a Zapier/Make webhook…). Messages are validated and forwarded server-side as JSON (`intent`, `message`, `anonymous`, `name`, `email`, plus `_replyto`/`_subject` for services that use them). To change the payload shape for a specific service, edit `app/api/contact/route.ts`. Until the variable is set, the form tells visitors it isn't connected and offers a prefilled email.

## How the agent works

1. `lib/knowledge/chunks.ts` flattens `content.ts` into ~30 chunks (one per role, project, publication, …), each linked to a DOM id.
2. `lib/knowledge/bm25.ts` scores chunks with BM25 plus a small synonym map. Top 5 (thresholded) go to the model.
3. `app/api/chat/route.ts` validates with zod (≤500 chars per user message, ≤10 messages), rate-limits per IP, then streams real trace events (`understood → retrieved N sources → writing → done`) followed by the answer.
4. If OpenRouter is down, out of credit, or the visitor has used their hourly model budget, the **native agent** answers instead: it quotes the best-matching sentences from the same retrieved facts (no LLM, so it cannot invent). The panel header shows which agent is live (`GET /api/agent/status`), and each answer says who wrote it.
5. The panel renders the trace with clickable source chips that close the panel and scroll to the exact entry.

## Deploying

**Vercel (full app).** Import the repo, set the env vars from `.env.example`. This hosts the pages *and* the API (agent, status, contact form).

**GitHub Pages (sabsar42.github.io).** GitHub Pages serves static files only, so the Pages build (`npm run build:pages` -> `out/`) contains no server code and no secrets. The agent and contact form call your Vercel deployment instead:

1. Deploy this repo to Vercel (above). It already allows https://sabsar42.github.io via CORS (`ALLOWED_ORIGINS`).
2. In the GitHub repo: Settings > Secrets and variables > Actions > Variables > add `API_BASE` = your Vercel URL.
3. Settings > Pages > Source = **GitHub Actions**, then run the "Deploy to GitHub Pages" workflow.

If `API_BASE` is empty, or Vercel is down, the Pages site still works: the agent answers in the browser as the Native Agent and the contact form offers a prefilled email.
