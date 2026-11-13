import { identity } from "./content";

/** Canonical URL for metadata, sitemap, robots and OG. Override with NEXT_PUBLIC_SITE_URL. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://shakibabsar.vercel.app").replace(/\/$/, "");

export const siteTitle = `${identity.name}, ${identity.shortTitle}`;

export const siteDescription =
  "Shakib Absar is an AI/ML engineer in Sylhet, Bangladesh who builds agentic and multimodal AI systems that ship, with research in vision-language models and medical imaging. Ask his AI agent about his work.";
