import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { formatDate, getAllLists, getList, hostOf } from "@/lib/content";
import { site } from "@/lib/site";
import { ListExplorer } from "@/components/ListExplorer";
import { Roadmap } from "@/components/Roadmap";
import { Newsletter } from "@/components/Newsletter";
import { ShareBar } from "@/components/ShareBar";
import { FollowNudge } from "@/components/FollowNudge";
import { ListCard } from "@/components/ListCard";
import { IconShield } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { guideLd, listLd, pageMetadata } from "@/lib/seo";
import { getAllGuides, getGuide } from "@/lib/guides";
import { GuideView } from "@/components/GuideView";

export function generateStaticParams() {
  return [...getAllLists(), ...getAllGuides()].map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (guide) {
    return pageMetadata({
      title: `${guide.title} (${guide.count} ${guide.unit})`,
      description: guide.description,
      path: `/${guide.slug}`,
      type: "article",
    });
  }
  const list = getList(slug);
  if (!list) return { title: "Not found", robots: { index: false, follow: true } };
  return pageMetadata({
    title: `${list.title} (${list.count})`,
    description: list.description,
    path: `/${list.slug}`,
    type: "article",
  });
}

// Every known slug is prerendered at build time. Params are read at the top (not behind Suspense)
// so unknown slugs return a real HTTP 404 instead of a soft 404.
export const instant = false;

export default async function ListPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (guide) {
    const more = getAllLists().slice(0, 3);
    return (
      <>
        <JsonLd data={guideLd(guide)} />
        <GuideView guide={guide} />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mt-16">
            <Newsletter compact />
          </div>
          <section className="mt-16">
            <h2 className="font-display text-2xl font-extrabold tracking-tight">More goldmines</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {more.map((l) => (
                <ListCard key={l.slug} list={l} />
              ))}
            </div>
          </section>
        </div>
        <FollowNudge />
      </>
    );
  }
  const list = getList(slug);
  if (!list) notFound();

  const verifiedLabel = formatDate(list.verified);
  const sources = new Set(list.items.map((i) => hostOf(i.url))).size;
  const related = getAllLists().filter((l) => l.slug !== list.slug).slice(0, 3);
  const shareText = list.hook ?? `${list.title} (${list.count})`;


  return (
    <div className="accent-scope" style={{ "--accent": list.accent } as CSSProperties}>
      <JsonLd data={listLd(list)} />
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
        {list.roadmap.length > 0 && (
          <Roadmap steps={list.roadmap} counts={Object.fromEntries(list.categories.map((c) => [c.name, c.count]))} />
        )}
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
