/**
 * Static build for GitHub Pages: `npm run build:pages` -> ./out
 *
 * STATIC_EXPORT=1 turns on `output: "export"` and drops the API routes (see next.config.ts), so the result is
 * plain files with no server code and no secrets.
 *
 * Env: NEXT_PUBLIC_API_BASE = your Vercel URL (agent + contact form call it). Unset = fully offline mode.
 *      NEXT_PUBLIC_SITE_URL = https://sabsar42.github.io (canonical URL, sitemap, OG)
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";

const r = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    STATIC_EXPORT: "1",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://sabsar42.github.io",
  },
});
if (r.status === 0) {
  fs.writeFileSync("out/.nojekyll", ""); // keep GitHub Pages from ignoring the _next folder
  console.log("\nStatic site ready in ./out");
}
process.exit(r.status ?? 1);
