import { getAllLists, formatDate } from "@/lib/content";
import { abs, site } from "@/lib/site";
import { getAllGuides } from "@/lib/guides";

// https://llmstxt.org — a plain-text map of the site for LLMs and AI agents.
export function GET() {
  const lists = getAllLists();
  const guides = getAllGuides();
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
    ...(guides.length
      ? [
          "## Guides",
          "",
          ...guides.map((g) => `- [${g.title} (${g.count} ${g.unit})](${abs(`/${g.slug}`)}): ${g.description} Checked ${formatDate(g.verified)}.`),
          "",
        ]
      : []),
    ...lists.flatMap((l) => [
      `## ${l.shortTitle} (${l.count})`,
      "",
      ...(l.roadmap.length
        ? [
            "Roadmap, in order:",
            "",
            ...l.roadmap.map((s, i) => `${i + 1}. ${s.title}${s.summary ? `: ${s.summary}` : ""}${s.build ? ` Build: ${s.build}.` : ""}`),
            "",
            "Resources:",
            "",
          ]
        : []),
      ...l.items.map((it) => `- [${it.name}](${it.url})${it.badge ? ` — ${it.badge}` : ""}${it.description ? `: ${it.description}` : ""}${it.command ? ` Command: \`${it.command}\`` : ""}`),
      "",
    ]),
    ...guides.flatMap((g) => [
      `## ${g.shortTitle} (${g.count} ${g.unit})`,
      "",
      ...(g.disclaimer ? [g.disclaimer, ""] : []),
      ...g.sections.flatMap((s) => [
        `### ${s.number}. ${s.title}`,
        "",
        ...s.formulas.map((f) => `- [${f.name}](${abs(`/${g.slug}#${f.id}`)}): $${f.tex.replace(/\s+/g, " ")}$ — ${f.means}${f.bot ? ` Bot use: ${f.bot}` : ""}`),
        "",
      ]),
      "### References",
      "",
      ...g.resources.map((r) => `- [${r.name}](${r.url})${r.badge ? ` — ${r.badge}` : ""}: ${r.description}`),
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
