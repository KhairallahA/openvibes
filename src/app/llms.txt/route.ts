import { getAllLists, formatDate } from "@/lib/content";
import { abs, site } from "@/lib/site";

// https://llmstxt.org — a plain-text map of the site for LLMs and AI agents.
export function GET() {
  const lists = getAllLists();
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `Curated by ${site.author} (${site.xUrl}). Every item links to its official source and shows the date it was last verified. No affiliate links.`,
    "",
    "## Lists",
    "",
    ...lists.map((l) => `- [${l.title} (${l.count})](${abs(`/${l.slug}`)}): ${l.description} Verified ${formatDate(l.verified)}.`),
    "",
    ...lists.flatMap((l) => [
      `## ${l.shortTitle} (${l.count})`,
      "",
      ...l.items.map((it) => `- [${it.name}](${it.url})${it.badge ? ` — ${it.badge}` : ""}${it.description ? `: ${it.description}` : ""}${it.command ? ` Command: \`${it.command}\`` : ""}`),
      "",
    ]),
    "## Optional",
    "",
    `- [Sitemap](${abs("/sitemap.xml")})`,
    `- [RSS feed](${abs("/feed.xml")})`,
    `- [Search index (JSON)](${abs("/search.json")})`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
