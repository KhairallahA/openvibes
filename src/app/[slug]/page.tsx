import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type CSSProperties } from "react";
import { formatDate, getAllLists, getList, hostOf } from "@/lib/content";
import { site } from "@/lib/site";
import { ListExplorer } from "@/components/ListExplorer";
import { Newsletter } from "@/components/Newsletter";
import { ShareBar } from "@/components/ShareBar";
import { FollowNudge } from "@/components/FollowNudge";
import { ListCard } from "@/components/ListCard";
import { IconShield } from "@/components/icons";

export function generateStaticParams() {
  return getAllLists().map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const list = getList(slug);
  if (!list) return {};
  const title = `${list.title} (${list.count})`;
  return {
    title,
    description: list.description,
    alternates: { canonical: `/${list.slug}` },
    keywords: [...list.tags, list.category, "free", "AI"],
    openGraph: { type: "article", title, description: list.description, url: `/${list.slug}`, modifiedTime: list.updated },
    twitter: { card: "summary_large_image", title, description: list.description },
  };
}

// The URL-independent shell renders instantly; the list (which depends on the slug) is
// prerendered for every known slug at build time and streams in on client navigations.
export default function ListPage({ params }: PageProps<"/[slug]">) {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <ListContent params={params} />
    </Suspense>
  );
}

function ListSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 pt-16 sm:px-6" aria-busy="true" aria-label="Loading list">
      <div className="h-6 w-48 rounded-full bg-surface-2" />
      <div className="mt-6 h-14 w-3/4 rounded-2xl bg-surface-2" />
      <div className="mt-3 h-14 w-1/2 rounded-2xl bg-surface-2" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-56 rounded-2xl border border-line bg-surface" />
        ))}
      </div>
    </div>
  );
}

async function ListContent({ params }: Pick<PageProps<"/[slug]">, "params">) {
  const { slug } = await params;
  const list = getList(slug);
  if (!list) notFound();

  const verifiedLabel = formatDate(list.verified);
  const sources = new Set(list.items.map((i) => hostOf(i.url))).size;
  const related = getAllLists().filter((l) => l.slug !== list.slug).slice(0, 3);
  const shareText = list.hook ?? `${list.title} (${list.count})`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: list.title,
    description: list.description,
    url: `${site.url}/${list.slug}`,
    dateModified: list.updated,
    numberOfItems: list.count,
    itemListElement: list.items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: it.url })),
  };

  return (
    <div className="accent-scope" style={{ "--accent": list.accent } as CSSProperties}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div className="glow pointer-events-none absolute -top-64 right-[-10%] size-[700px]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pt-16">
          <nav aria-label="Breadcrumb" className="text-sm text-faint">
            <Link href="/" className="hover:text-ink">{site.name}</Link>
            <span className="mx-2">/</span>
            <span className="text-muted">{list.slug}</span>
          </nav>

          <div className="mt-6 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div className="animate-rise">
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-xs text-muted backdrop-blur">
                <span className="font-mono text-accent-fg">{list.icon}</span>
                Free directory · {list.category}
                <span className="font-semibold text-accent-fg lg:hidden">· {list.count} picks</span>
              </p>
              <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.035em] sm:text-6xl">
                {list.title}
              </h1>
              {list.lede && <p className="mt-5 max-w-2xl text-lg text-ink-2">{list.lede}</p>}
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <IconShield width={15} height={15} className="text-accent-fg" /> Verified {verifiedLabel}
                </span>
                <span>{sources} official sources</span>
                <span>No affiliate links</span>
              </div>
              <div className="mt-6">
                <ShareBar path={`/${list.slug}`} text={shareText} />
              </div>
            </div>
            <div className="hidden animate-rise rounded-3xl border border-line bg-surface/70 p-6 text-center backdrop-blur lg:block lg:min-w-56">
              <p className="font-display text-7xl font-extrabold leading-none tracking-tight text-accent-fg tabular-nums sm:text-8xl">{list.count}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-faint">hand-checked picks</p>
            </div>
          </div>

          {list.stats.length > 0 && (
            <dl className="mt-8 grid grid-cols-3 gap-2 sm:mt-10 sm:gap-3">
              {list.stats.map((s) => (
                <div key={s.label} className="min-w-0 rounded-2xl border border-line bg-surface/60 p-3 backdrop-blur sm:p-4">
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="block font-display text-xl font-extrabold tracking-tight sm:inline sm:text-3xl">{s.value}</span>
                    <span className="block text-xs leading-snug text-ink-2 sm:ml-2 sm:inline sm:text-sm">{s.label}</span>
                    {s.note && <span className="mt-1 hidden text-xs text-faint sm:block">{s.note}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ListExplorer slug={list.slug} items={list.items} categories={list.categories} tags={list.itemTags} verifiedLabel={verifiedLabel} />

        {list.bodyHtml && (
          <section className="mx-auto mt-16 max-w-3xl rounded-3xl border border-line p-6 sm:p-10">
            <div className="prose-v" dangerouslySetInnerHTML={{ __html: list.bodyHtml }} />
          </section>
        )}

        <div className="mt-16">
          <Newsletter compact />
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-extrabold tracking-tight">More goldmines</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {related.map((l) => (
                <ListCard key={l.slug} list={l} />
              ))}
            </div>
          </section>
        )}
      </div>
      <FollowNudge />
    </div>
  );
}
