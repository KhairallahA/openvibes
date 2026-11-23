// Central site config. Change these once and everything (metadata, OG images, sitemap) follows.
export const site = {
  name: "vibes",
  // TODO: set NEXT_PUBLIC_SITE_URL in Vercel to your real domain (e.g. https://vibes.md).
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://vibes.example.com").replace(/\/$/, ""),
  tagline: "Every free AI goldmine on the internet. Curated, verified, one click.",
  description:
    "Hand-checked lists of the best free AI tools, models, credits and resources. Every link goes to the official source and every number is verified.",
  author: "Khairallah AL-Awady",
  x: "eng_khairallah1",
} as const;

export const domainLabel = site.url.replace(/^https?:\/\//, "");
