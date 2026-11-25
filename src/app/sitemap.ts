import type { MetadataRoute } from "next";
import { getAllLists } from "@/lib/content";
import { getAllGuides } from "@/lib/guides";
import { abs, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lists = [...getAllLists(), ...getAllGuides()];
  const latest = lists.reduce((d, l) => (l.updated > d ? l.updated : d), "2026-01-01");
  return [
    { url: site.url, lastModified: latest, changeFrequency: "daily", priority: 1 },
    ...lists.map((l) => ({
      url: abs(`/${l.slug}`),
      lastModified: l.updated,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}
