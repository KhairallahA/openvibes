import Link from "next/link";
import { getAllLists } from "@/lib/content";
import { site } from "@/lib/site";

export function Footer() {
  const lists = getAllLists();
  const year = lists.reduce((y, l) => (l.updated > y ? l.updated : y), "2026").slice(0, 4);
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-xl font-extrabold">
            {site.name}
            <span className="text-brand">.</span>
          </p>
          <p className="mt-2 max-w-sm text-sm text-muted">{site.tagline}</p>
          <p className="mt-4 max-w-sm text-xs leading-relaxed text-faint">
            Independent and not affiliated with any company listed. Names are trademarks of their owners. Offers and numbers change; every item shows the date it was last verified.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-faint">Lists</p>
          <ul className="mt-3 space-y-2 text-sm">
            {lists.map((l) => (
              <li key={l.slug}>
                <Link href={`/${l.slug}`} className="text-muted transition hover:text-ink">
                  {l.shortTitle} <span className="font-mono text-xs text-faint">{l.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-faint">More</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/saved" className="text-muted hover:text-ink">Your saved items</Link></li>
            <li><a href={`https://x.com/${site.x}`} target="_blank" rel="noopener" className="text-muted hover:text-ink">@{site.x} on X</a></li>
            <li><a href="/feed.xml" className="text-muted hover:text-ink">RSS feed</a></li>
            <li><a href="/sitemap.xml" className="text-muted hover:text-ink">Sitemap</a></li>
            <li><a href="/llms.txt" className="text-muted hover:text-ink">llms.txt</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-faint">
        © {year} {site.author}. Built with Next.js, Tailwind and Markdown.
      </div>
    </footer>
  );
}
