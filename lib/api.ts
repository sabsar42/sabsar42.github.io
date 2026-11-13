/**
 * Where the browser finds the API.
 * - Vercel / next start: same origin (NEXT_PUBLIC_API_BASE unset).
 * - GitHub Pages: NEXT_PUBLIC_API_BASE points at the Vercel deployment that holds the secrets.
 * - GitHub Pages with no API base: LOCAL_ONLY, so the agent answers in the browser and the form offers email.
 */
export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/$/, "");
export const LOCAL_ONLY = process.env.NEXT_PUBLIC_STATIC === "1" && !API_BASE;
export const apiUrl = (path: string) => `${API_BASE}${path}`;
