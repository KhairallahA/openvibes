import { getAllLists } from "@/lib/content";
import { getAllGuides } from "@/lib/guides";
import { abs, site } from "@/lib/site";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const rfc822 = (d: string) => new Date(`${d}T09:00:00Z`).toUTCString();

// RSS 2.0 feed of lists, newest first. Static at build time.
export function GET() {
  const lists = [...getAllLists(), ...getAllGuides()].sort((a, b) => b.updated.localeCompare(a.updated));
  const items = lists
    .map(
      (l) => `    <item>
      <title>${esc(`${l.title} (${"countLabel" in l ? l.countLabel : l.count})`)}</title>
      <link>${abs(`/${l.slug}`)}</link>
      <guid isPermaLink="true">${abs(`/${l.slug}`)}</guid>
      <pubDate>${rfc822(l.updated)}</pubDate>
      <category>${esc(l.category)}</category>
      <description>${esc(l.description)}</description>
    </item>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(site.name)}</title>
    <link>${site.url}</link>
    <description>${esc(site.description)}</description>
    <language>${site.language}</language>
    <lastBuildDate>${rfc822(lists[0]?.updated ?? "2026-01-01")}</lastBuildDate>
    <atom:link href="${abs("/feed.xml")}" rel="self" type="application/rss+xml"/>
    <image><url>${abs("/icon-512.png")}</url><title>${esc(site.name)}</title><link>${site.url}</link></image>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
