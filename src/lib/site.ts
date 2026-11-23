/**
 * Central site config — the ONE place to set the domain and brand.
 *
 *   NEXT_PUBLIC_SITE_URL=https://your-domain.com   (Vercel → Settings → Environment Variables)
 *
 * Everything else (metadataBase, canonical URLs, Open Graph/Twitter images, JSON-LD,
 * sitemap.xml, robots.txt, feed.xml, llms.txt) is derived from `site.url`.
 */
// NOTE: NEXT_PUBLIC_* must be read with literal `process.env.NEXT_PUBLIC_X` so Next.js can inline them in client code.
const clean = (v: string | undefined) => (v && v.trim() ? v.trim() : undefined);

const vercelProd = clean(process.env.VERCEL_PROJECT_PRODUCTION_URL);
const rawUrl = clean(process.env.NEXT_PUBLIC_SITE_URL) ?? (vercelProd ? `https://${vercelProd}` : "https://openvibes.si");

export const site = {
  name: "OpenVibes",
  url: rawUrl.replace(/\/$/, ""),
  locale: "en_US",
  language: "en",
  tagline: "Every free AI goldmine on the internet. Curated, verified, one click.",
  shortTagline: "Every free AI goldmine on the internet",
  description:
    "Hand-checked lists of the best free AI tools, models, credits and resources. Every link goes to the official source and every number is verified.",
  keywords: ["free AI tools", "free AI credits", "uncensored AI models", "offline AI", "local LLM", "AI coding agents", "Ollama", "Hugging Face", "open source AI", "AI directory"],
  author: "Khairallah AL-Awady",
  x: "eng_khairallah1",
  get xUrl() {
    return `https://x.com/${this.x}`;
  },
  themeColor: "#08080a",
  brandColor: "#c6ff3d",
} as const;

export const domainLabel = site.url.replace(/^https?:\/\//, "");

/** Search-console verification tokens (optional). */
export const verification = {
  google: clean(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION),
  bing: clean(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION),
  yandex: clean(process.env.NEXT_PUBLIC_YANDEX_VERIFICATION),
};

/** Analytics — off unless set. NEXT_PUBLIC_ANALYTICS = "vercel" | "plausible" | "both". */
export const analytics = {
  provider: clean(process.env.NEXT_PUBLIC_ANALYTICS) as "vercel" | "plausible" | "both" | undefined,
  plausibleDomain: clean(process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) ?? domainLabel,
  plausibleSrc: clean(process.env.NEXT_PUBLIC_PLAUSIBLE_SRC) ?? "https://plausible.io/js/script.outbound-links.js",
};

/** Optional `?ref=<value>` on outbound links (off by default). NEXT_PUBLIC_OUTBOUND_REF=vibes */
export const outboundRef = clean(process.env.NEXT_PUBLIC_OUTBOUND_REF);

export function outbound(url: string) {
  if (!outboundRef) return url;
  try {
    const u = new URL(url);
    if (!u.searchParams.has("ref")) u.searchParams.set("ref", outboundRef);
    return u.toString();
  } catch {
    return url;
  }
}

export const abs = (path = "/") => (path.startsWith("http") ? path : `${site.url}${path.startsWith("/") ? path : `/${path}`}`);
