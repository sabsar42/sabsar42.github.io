import type { MetadataRoute } from "next";
import { identity } from "@/lib/content";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${siteUrl}/`, lastModified: new Date(`${identity.lastUpdated}T00:00:00Z`), changeFrequency: "monthly", priority: 1 }];
}

export const dynamic = "force-static";
