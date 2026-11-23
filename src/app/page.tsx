import Link from "next/link";
import { getAllLists, totalItems, hostOf, formatDate } from "@/lib/content";
import { site } from "@/lib/site";
import { ListCard } from "@/components/ListCard";
import { Newsletter } from "@/components/Newsletter";
import { HeroSearch } from "@/components/HeroSearch";
import { JsonLd } from "@/components/JsonLd";
import { homeLd, pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export function generateMetadata(): Metadata {
  const lists = getAllLists();
  return pageMetadata({
    absoluteTitle: `${site.name} · ${site.shortTagline}`,
    description: `${site.description} ${lists.length} lists, ${totalItems()} verified picks.`,
    path: "/",
  });
}

export default function Home() {
  const lists = getAllLists();
  const total = totalItems();
  const sources = new Set(lists.flatMap((l) => l.items.map((i) => hostOf(i.url)))).size;
  const [first, ...rest] = lists;

  return (
    <>
      <JsonLd data={homeLd(lists)} />
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div className="glow pointer-events-none absolute left-1/2 top-[-220px] size-[720px] -translate-x-1/2" />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
          <p className="inline-flex animate-rise items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-xs text-muted backdrop-blur">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-brand" />
            </span>
            {lists.length} lists · {total} verified picks · {sources} official sources
          </p>
          <h1 className="mt-6 max-w-4xl animate-rise font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.04em] sm:text-7xl md:text-8xl">
            Every free AI <span className="text-gradient">goldmine</span> on the internet.
          </h1>
          <p className="mt-6 max-w-2xl animate-rise text-lg text-ink-2 sm:text-xl">
            Hand-picked lists of free AI models, credits and tools. Every link goes to the official source, every number is checked, and nothing is behind a signup.
          </p>
          <div className="mt-8 max-w-2xl animate-rise">
            <HeroSearch />
          </div>
          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            {lists.map((l) => (
              <Link key={l.slug} href={`/${l.slug}`} className="rounded-full border border-line px-3 py-1.5 text-muted transition hover:border-line-2 hover:text-ink">
                <span className="mr-1.5 inline-block size-1.5 rounded-full align-middle" style={{ background: l.accent }} />
                {l.shortTitle} <span className="font-mono text-xs text-faint">{l.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="lists" className="mx-auto max-w-6xl scroll-mt-24 px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-faint">The collection</p>
            <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Pick a goldmine</h2>
          </div>
          <p className="hidden text-sm text-muted sm:block">Updated {lists[0] ? formatDate(lists[0].updated) : ""}</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {first && (
            <div className={`md:col-span-2 ${rest.length % 3 === 0 ? "lg:col-span-3" : "lg:col-span-2"}`}>
              <ListCard list={first} big />
            </div>
          )}
          {rest.map((l) => (
            <ListCard key={l.slug} list={l} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Official links only", "Every pick links to the maker's own page, repo or docs. No affiliate redirects, no link shorteners."],
            ["Verified, with a date", "Numbers come from the source page and every card shows when it was last checked."],
            ["Save, search, share", "Bookmark picks on this device, search every list with ⌘K, and copy a deep link to any card."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-line p-6">
              <p className="font-display text-lg font-bold">{t}</p>
              <p className="mt-1.5 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
        <Newsletter />
      </section>
    </>
  );
}
