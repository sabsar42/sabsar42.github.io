import type { NextConfig } from "next";

/**
 * Two builds from one codebase:
 *  - default (Vercel / next start): full app with the /api routes.
 *  - STATIC_EXPORT=1 (GitHub Pages, via scripts/build-pages.mjs): plain static files, API routes excluded. The agent and contact
 *    form call NEXT_PUBLIC_API_BASE (your Vercel deployment) and fall back to in-browser answers.
 */
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // API route files are named route.api.ts. The static (Pages) build leaves "api.ts" out, so they are ignored there.
  pageExtensions: staticExport ? ["tsx", "ts", "jsx", "js"] : ["tsx", "ts", "jsx", "js", "api.ts"],
  images: staticExport ? { unoptimized: true } : { formats: ["image/avif", "image/webp"] },
  experimental: {
    optimizePackageImports: ["motion"],
  },
  ...(staticExport
    ? { output: "export" as const, env: { NEXT_PUBLIC_STATIC: "1" } }
    : {
        async headers() {
          return [
            {
              source: "/(.*)",
              headers: [
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                { key: "X-Frame-Options", value: "DENY" },
                { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
